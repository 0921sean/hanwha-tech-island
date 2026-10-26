import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import mascotUrl from '../../hanwha-mascot.glb?url';
import { buildExterior, buildInterior } from './world3d.js';
import { CHARACTER_RADIUS, findPath, moveWithCollisions, nearestWalkablePoint } from './navigation3d.js';
import { houseForTopic } from '../data/houses.js';

const COMPANY_NAMES = {hub:'모여봐요 한화의 숲', systems:'한화시스템 마을', aerospace:'한화에어로스페이스 마을', ocean:'한화오션 마을'};
const FACILITY_NAMES = {radar:'레이다 연구소',satellite:'위성 관측소',combat:'에어로의 집',engine:'항공엔진 공방',launch:'시스템의 집',ground:'지상장비 정비소',lng:'오션의 집',naval:'특수선 설계실',offshore:'해양 플랜트'};
const VALID_COMPANIES = new Set(Object.keys(COMPANY_NAMES));

export function disposeGroup(group) {
  if (!group) return;
  const geometries = new Set(), materials = new Set(), textures = new Set();
  group.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    const values = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
    for (const material of values) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  geometries.forEach(value => value.dispose());
  textures.forEach(value => value.dispose());
  materials.forEach(value => value.dispose());
}

function houseNameplate(texture,{width=3.3,x=-.2,y=3.76,z=2.14}={}) {
  const group=new THREE.Group();
  texture.colorSpace=THREE.SRGBColorSpace;
  const height=width*texture.image.height/texture.image.width;
  const face=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.04,side:THREE.DoubleSide,depthWrite:false}));
  face.position.set(x,y,z);group.add(face);
  return group;
}

const noAssetLoad=()=>({cancel(){},ready:Promise.resolve()});

function loadOceanExterior(world) {
  if(!world.oceanHouse)return noAssetLoad();
  const {mount,fallback}=world.oceanHouse;
  let cancelled=false;
  const ready=Promise.allSettled([
    new GLTFLoader().loadAsync('/models/seaside_house_03.glb'),
    new THREE.TextureLoader().loadAsync('/images/ocean-house-nameplate.png'),
  ]).then(([modelResult,textureResult])=>{
    if(cancelled||modelResult.status==='rejected'||textureResult.status==='rejected'){
      if(modelResult.status==='fulfilled')disposeGroup(modelResult.value.scene);
      if(textureResult.status==='fulfilled')textureResult.value.dispose();
      if(!cancelled)fallback.visible=true;
      return;
    }
    const model=modelResult.value.scene,texture=textureResult.value;
    const doorParts=[];
    model.traverse(node=>{
      if(node.name.startsWith('Anchor__'))node.visible=false;
      if(/^(Front_Door|Door_Planks|Door_Handle|Door_Porthole|Door_Hardware)__/.test(node.name))doorParts.push(node);
      if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}
    });
    mount.add(model,houseNameplate(texture));
    const hinge=new THREE.Group();hinge.position.set(-.69,0,1.75);model.add(hinge);
    model.updateMatrixWorld(true);
    for(const part of doorParts)hinge.attach(part);
    const door=world.doors.find(item=>item.id==='lng');
    if(door)door.pivot=hinge;
  }).catch(()=>{
    if(!cancelled)fallback.visible=true;
  });
  return {ready,cancel(){cancelled=true;}};
}

function loadSystemsExterior(world) {
  if(!world.systemsHouse)return noAssetLoad();
  const {mount,fallback}=world.systemsHouse;
  let cancelled=false;
  const ready=Promise.allSettled([
    new GLTFLoader().loadAsync('/models/system_house.glb'),
    new THREE.TextureLoader().loadAsync('/images/system-house-nameplate.png'),
  ]).then(([modelResult,textureResult])=>{
    if(cancelled||modelResult.status==='rejected'||textureResult.status==='rejected'){
      if(modelResult.status==='fulfilled')disposeGroup(modelResult.value.scene);
      if(textureResult.status==='fulfilled')textureResult.value.dispose();
      if(!cancelled)fallback.visible=true;
      return;
    }
    const model=modelResult.value.scene,texture=textureResult.value;
    const doorParts=[];
    model.traverse(node=>{
      if(['Arched wooden door','Door plank joint','Door handle','Door diamond glass'].includes(node.name))doorParts.push(node);
      if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}
    });
    mount.add(model,houseNameplate(texture,{width:3.3,x:0,y:4.17,z:2.43}));
    const hinge=new THREE.Group();hinge.position.set(-.715,0,2.08);model.add(hinge);
    model.updateMatrixWorld(true);
    for(const part of doorParts)hinge.attach(part);
    const door=world.doors.find(item=>item.id==='launch');
    if(door)door.pivot=hinge;
  }).catch(()=>{if(!cancelled)fallback.visible=true;});
  return {ready,cancel(){cancelled=true;}};
}

function loadAeroExterior(world) {
  if(!world.aeroHouse)return noAssetLoad();
  const {mount,fallback}=world.aeroHouse;
  let cancelled=false;
  const ready=Promise.allSettled([
    new GLTFLoader().loadAsync('/models/aero_house.glb'),
    new THREE.TextureLoader().loadAsync('/images/aero-house-nameplate.png'),
  ]).then(([modelResult,textureResult])=>{
    if(cancelled||modelResult.status==='rejected'||textureResult.status==='rejected'){
      if(modelResult.status==='fulfilled')disposeGroup(modelResult.value.scene);
      if(textureResult.status==='fulfilled')textureResult.value.dispose();
      if(!cancelled)fallback.visible=true;
      return;
    }
    const model=modelResult.value.scene,texture=textureResult.value;
    const doorParts=[];
    model.traverse(node=>{
      if(['Olive arched door','Door plank seam','Door window frame','Door window glass','Door window mullion','Door window cross','Brass doorknob'].includes(node.name))doorParts.push(node);
      if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}
    });
    mount.add(model,houseNameplate(texture,{width:3.4,x:0,y:4.45,z:2.75}));
    const hinge=new THREE.Group();hinge.position.set(-.25,0,2.3);model.add(hinge);
    model.updateMatrixWorld(true);
    for(const part of doorParts)hinge.attach(part);
    const door=world.doors.find(item=>item.id==='combat');
    if(door)door.pivot=hinge;
  }).catch(()=>{if(!cancelled)fallback.visible=true;});
  return {ready,cancel(){cancelled=true;}};
}

function loadFutureExteriors(world) {
  if(!world.futureHouses?.length)return noAssetLoad();
  let cancelled=false;
  const ready=Promise.all(world.futureHouses.map(async ({id,mount,fallback})=>{
    const power=id==='radar';
    const name=power?'power':'engine';
    const [modelResult,textureResult]=await Promise.allSettled([
      new GLTFLoader().loadAsync(`/models/${name}_house.glb`),
      new THREE.TextureLoader().loadAsync(`/images/${name}-house-nameplate.png`),
    ]);
    if(cancelled||modelResult.status==='rejected'||textureResult.status==='rejected'){
      if(modelResult.status==='fulfilled')disposeGroup(modelResult.value.scene);
      if(textureResult.status==='fulfilled')textureResult.value.dispose();
      if(!cancelled)fallback.visible=true;
      return;
    }
    const model=modelResult.value.scene,texture=textureResult.value;
    // The supplied façades face -Z; the shared village path approaches +Z.
    model.rotation.y=Math.PI;
    model.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
    mount.add(model,houseNameplate(texture,{width:3.3,x:0,y:power?3.65:3.62,z:power?2.55:3.08}));
  }));
  return {ready,cancel(){cancelled=true;}};
}

function loadModelDisplays(world) {
  if(!world.modelDisplays?.length)return noAssetLoad();
  let cancelled=false;
  const ready=Promise.all(world.modelDisplays.map(async ({url,mount,fallback,maxSize,baseY=0,rotationY=0,vertexColorTint})=>{
    try{
      const {scene:model}=await new GLTFLoader().loadAsync(url);
      if(cancelled){disposeGroup(model);return;}
      model.rotation.y=rotationY;
      const bounds=new THREE.Box3().setFromObject(model);
      const size=bounds.getSize(new THREE.Vector3());
      if(![size.x,size.y,size.z].every(value=>Number.isFinite(value)&&value>0)){
        disposeGroup(model);fallback.visible=true;return;
      }
      const scale=Math.min(maxSize[0]/size.x,maxSize[1]/size.y,maxSize[2]/size.z);
      model.scale.setScalar(scale);
      model.position.set(-(bounds.min.x+bounds.max.x)*scale/2,baseY-bounds.min.y*scale,-(bounds.min.z+bounds.max.z)*scale/2);
      model.userData.dynamic=true;
      const tint=vertexColorTint?new THREE.Color(vertexColorTint):null;
      model.traverse(node=>{
        if(!node.isMesh)return;
        node.castShadow=true;node.receiveShadow=true;
        const colors=tint&&node.geometry.getAttribute('color');
        if(colors){
          for(let i=0;i<colors.count;i++)colors.setXYZ(i,
            THREE.MathUtils.lerp(colors.getX(i),tint.r,.78),
            THREE.MathUtils.lerp(colors.getY(i),tint.g,.78),
            THREE.MathUtils.lerp(colors.getZ(i),tint.b,.78));
          colors.needsUpdate=true;
        }
      });
      mount.add(model);
    }catch{if(!cancelled)fallback.visible=true;}
  }));
  return {ready,cancel(){cancelled=true;}};
}

function loadHouseResident(world) {
  if(!world.resident)return noAssetLoad();
  const {mount,fallback,modelUrl,name}=world.resident;
  let cancelled=false;
  const ready=new GLTFLoader().loadAsync(modelUrl).then(({scene:model})=>{
    if(cancelled){disposeGroup(model);return;}
    // Both supplied residents use Y as up and face the visitor along +Z.
    const bounds=new THREE.Box3().setFromObject(model);
    const size=bounds.getSize(new THREE.Vector3());
    if(!Number.isFinite(size.y)||size.y<=0){disposeGroup(model);fallback.visible=true;return;}
    const scale=Math.min(1.8/size.y,1.4/Math.max(size.x,size.z));
    model.scale.setScalar(scale);
    model.position.set(-3-(bounds.min.x+bounds.max.x)*scale/2,-bounds.min.y*scale,1.8-(bounds.min.z+bounds.max.z)*scale/2);
    model.name=`${name} · 집 주민`;
    model.userData.dynamic=true;
    model.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
    mount.add(model);
  }).catch(()=>{
    if(!cancelled)fallback.visible=true;
  });
  return {ready,cancel(){cancelled=true;}};
}

function loadOceanDivisionShip(world) {
  if(!world.oceanDivisionShip)return noAssetLoad();
  const {mount,fallback}=world.oceanDivisionShip;
  let cancelled=false;
  const ready=new GLTFLoader().loadAsync('/models/LNG_carrier_3D_mesh.glb?v=20261021').then(({scene:model})=>{
    if(cancelled){disposeGroup(model);return;}
    model.updateMatrixWorld(true);
    const parts=[];
    model.traverse(node=>{
      if(node.isMesh)parts.push(node.geometry.clone().applyMatrix4(node.matrixWorld));
    });
    const merged=parts.length?mergeGeometries(parts,false):null;
    parts.forEach(part=>part.dispose());
    let ship=model;
    if(merged){
      merged.computeVertexNormals();
      ship=new THREE.Mesh(merged,new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.78,metalness:.06,side:THREE.DoubleSide}));
      disposeGroup(model);
    }
    // The supplied mesh uses Z as up. Lay its long X axis across the display.
    ship.rotation.x=-Math.PI/2;
    const bounds=new THREE.Box3().setFromObject(ship);
    const size=bounds.getSize(new THREE.Vector3());
    if(!Number.isFinite(size.x)||!Number.isFinite(size.y)||!Number.isFinite(size.z)||Math.min(size.x,size.y,size.z)<=0){
      disposeGroup(ship);fallback.visible=true;return;
    }
    const scale=Math.min(2.45/size.x,1.24/size.z,1.17/size.y);
    ship.scale.setScalar(scale);
    ship.position.set(4.6-(bounds.min.x+bounds.max.x)*scale/2,.72-bounds.min.y*scale,1.1-(bounds.min.z+bounds.max.z)*scale/2);
    ship.name='사업부 둘러보기 · LNG 운반선';
    ship.userData.dynamic=true;
    ship.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
    mount.add(ship);
  }).catch(()=>{if(!cancelled)fallback.visible=true;});
  return {ready,cancel(){cancelled=true;}};
}

function loadSystemsResident(world) {
  if(!world.systemsResident)return noAssetLoad();
  const {mount,fallback}=world.systemsResident;
  let cancelled=false;
  const ready=new GLTFLoader().loadAsync('/hantori-edited.glb?v=systems-20261021').then(({scene:model})=>{
    if(cancelled){disposeGroup(model);return;}
    const bounds=new THREE.Box3().setFromObject(model);
    const size=bounds.getSize(new THREE.Vector3());
    if(!Number.isFinite(size.y)||size.y<=0){disposeGroup(model);fallback.visible=true;return;}
    const scale=Math.min(2.1/size.y,1.7/Math.max(size.x,size.z));
    model.scale.setScalar(scale);
    model.position.set(-(bounds.min.x+bounds.max.x)*scale/2,-bounds.min.y*scale,-(bounds.min.z+bounds.max.z)*scale/2);
    model.name='한토리 · 시스템의 집 주민';
    model.userData.dynamic=true;
    model.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
    mount.add(model);
  }).catch(()=>{if(!cancelled)fallback.visible=true;});
  return {ready,cancel(){cancelled=true;}};
}

export function makeExplorer(color) {
  const group = new THREE.Group();
  group.name = 'Choco the village puppy';
  const material = hex => new THREE.MeshStandardMaterial({color:hex,roughness:.94});
  const golden=material('#f8c861'), lightGold=material('#ffda79'), earBrown=material('#b97831');
  const cream=material('#fff0cf'), white=material('#fffaf0'), blush=material('#fa9e94');
  const brown=material('#5a3427'), eye=material('#39251f'), shine=material('#ffffff');
  const shirtCanvas=document.createElement('canvas');shirtCanvas.width=128;shirtCanvas.height=128;
  const shirtTexture=new THREE.CanvasTexture(shirtCanvas);
  shirtTexture.colorSpace=THREE.SRGBColorSpace;
  shirtTexture.wrapS=THREE.RepeatWrapping;shirtTexture.wrapT=THREE.RepeatWrapping;
  shirtTexture.repeat.set(2,1);
  const shirt=new THREE.MeshStandardMaterial({map:shirtTexture,roughness:1});
  const sleeves=material(color);
  function setShirtColor(hex) {
    const ctx=shirtCanvas.getContext('2d');
    ctx.fillStyle=hex;ctx.fillRect(0,0,128,128);
    ctx.fillStyle='rgba(28,83,43,.27)';
    for(let p=0;p<128;p+=32){ctx.fillRect(p,0,15,128);ctx.fillRect(0,p,128,15);}
    ctx.fillStyle='rgba(238,247,170,.25)';
    for(let p=16;p<128;p+=32){ctx.fillRect(p,0,3,128);ctx.fillRect(0,p,128,3);}
    shirtTexture.needsUpdate=true;sleeves.color.set(hex);
  }
  setShirtColor(color);
  const mesh=(geometry,mat,x,y,z,parent=group)=>{
    const object=new THREE.Mesh(geometry,mat);object.position.set(x,y,z);
    object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
  };
  const sphere=(r,mat,x,y,z,parent=group,sx=1,sy=1,sz=1)=>{
    const object=mesh(new THREE.SphereGeometry(r,24,16),mat,x,y,z,parent);
    object.scale.set(sx,sy,sz);return object;
  };
  const curve=(points,r,mat,parent=group)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,r,6,false),mat,0,0,0,parent);

  // Original 3D interpretation of the supplied character sheet; front faces +z.
  sphere(.26,golden,0,.73,0,group,1,.9,.75);
  const shirtOutline=[
    [0,0],[.3,0],[.36,.035],[.37,.09],[.34,.17],[.32,.33],[.29,.48],[.24,.55],[0,.55]
  ];
  mesh(new THREE.LatheGeometry(shirtOutline.map(([radius,y])=>new THREE.Vector2(radius,y)),28),shirt,0,.62,0);
  for(const side of[-1,1])curve([[side*.27,.65,.2],[side*.3,.81,.19],[side*.27,1.08,.19]],.008,material('#3b824a'));
  sphere(.12,white,-.11,1.185,.19,group,1,.42,.32).rotation.z=-.67;
  sphere(.12,white,.11,1.185,.19,group,1,.42,.32).rotation.z=.67;
  for(const y of [1.045,.885,.725])sphere(.036,brown,0,y,.286,group,1,1,.55);

  const head=new THREE.Group();head.position.y=1.65;group.add(head);
  const headGeometry=new THREE.SphereGeometry(.52,36,26);
  const headVertices=headGeometry.getAttribute('position');
  for(let i=0;i<headVertices.count;i++){
    const x=headVertices.getX(i),y=headVertices.getY(i),z=headVertices.getZ(i);
    const cheeks=Math.max(0,1-Math.abs(y+.17)/.42)*Math.max(0,z/.52);
    headVertices.setXYZ(i,x*(1.04+cheeks*.085),y*.95,z*.86+cheeks*.025);
  }
  headGeometry.computeVertexNormals();
  mesh(headGeometry,golden,0,0,0,head);
  sphere(.42,lightGold,0,.14,.27,head,.84,.69,.52);
  sphere(.16,cream,0,.2,.43,head,1.05,1.65,.42); // forehead blaze
  sphere(.42,cream,0,-.23,.17,head,1.02,.62,1.02);
  sphere(.3,cream,0,-.23,.45,head,1,.53,.63); // rounded muzzle
  for(const side of [-1,1]) {
    const earGeometry=new THREE.SphereGeometry(1,24,18);
    const earVertices=earGeometry.getAttribute('position');
    for(let i=0;i<earVertices.count;i++){
      const x=earVertices.getX(i),y=earVertices.getY(i),z=earVertices.getZ(i);
      earVertices.setXYZ(i,x*(.16-.035*y),y*.33,z*.11);
    }
    earGeometry.computeVertexNormals();
    const floppy=mesh(earGeometry,earBrown,side*.515,-.09,-.04,head);
    floppy.rotation.z=side*.2;
    sphere(.092,blush,side*.27,-.24,.49,head,1,.62,.28);
    sphere(.091,eye,side*.22,.04,.397,head,.83,1.28,.56);
    sphere(.025,shine,side*.242,.09,.449,head,.65,1,.5);
  }
  sphere(.073,brown,0,-.21,.635,head,1,.75,.65);
  curve([[0,-.257,.633],[0,-.328,.615]],.012,brown,head);
  curve([[-.14,-.31,.59],[-.11,-.37,.61],[0,-.392,.625],[.11,-.37,.61],[.14,-.31,.59]],.012,brown,head);

  const leftArm=new THREE.Group(),rightArm=new THREE.Group();
  leftArm.position.set(-.325,1.09,0);rightArm.position.set(.325,1.09,0);group.add(leftArm,rightArm);
  for(const [arm,side] of [[leftArm,-1],[rightArm,1]]) {
    const sleeve=sphere(.12,sleeves,side*.055,-.09,0,arm,.9,1.35,1);
    sleeve.rotation.z=side*.24;
    sphere(.105,golden,side*.09,-.26,.015,arm,.82,1.1,.87);
    sphere(.095,cream,side*.105,-.345,.045,arm,.92,.72,.92);
  }
  const leftLeg=new THREE.Group(),rightLeg=new THREE.Group();
  leftLeg.position.set(-.16,.49,0);rightLeg.position.set(.16,.49,0);group.add(leftLeg,rightLeg);
  for(const leg of [leftLeg,rightLeg]) {
    sphere(.12,golden,0,-.17,0,leg,.92,1.5,.9);
    sphere(.13,cream,0,-.36,.065,leg,1,.62,1.35);
  }
  const tail=new THREE.Group();tail.position.set(0,.67,-.18);group.add(tail);
  curve([[0,0,0],[.13,.025,-.16],[.25,.1,-.26],[.29,.19,-.29]],.065,golden,tail);
  sphere(.078,cream,.29,.19,-.29,tail,.92,.8,1);
  return {group,shirt,head,leftArm,rightArm,leftLeg,rightLeg,tail,setShirtColor};
}

// Keep the procedural character as a load-failure fallback, hidden until the
// supplied GLB either succeeds or fails. The wrapper is the movement anchor.
export function loadMascotInto(explorer, color = '#58a45f', onSettled = () => {}) {
  let cancelled = false;
  explorer.group.visible=false;
  new GLTFLoader().load(mascotUrl, ({scene: model}) => {
    if (cancelled) { disposeGroup(model); return; }
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    if (!Number.isFinite(size.y) || size.y <= 0) {
      disposeGroup(model);explorer.group.visible=true;onSettled();return;
    }
    const scale = 2.15 / size.y;
    model.scale.setScalar(scale);
    model.position.set(
      -(bounds.min.x + bounds.max.x) * scale / 2,
      -bounds.min.y * scale,
      -(bounds.min.z + bounds.max.z) * scale / 2,
    );
    const uniformMaterials = new Map();
    model.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (material?.name?.toLowerCase().includes('uniform')) {
          uniformMaterials.set(material, material.color.clone());
        }
      }
    });
    for (const child of [...explorer.group.children]) {
      explorer.group.remove(child);
      disposeGroup(child);
    }
    explorer.group.add(model);
    explorer.model = model;
    explorer.isModel = true;
    explorer.setShirtColor = hex => {
      for (const [material, original] of uniformMaterials) {
        // Existing saves used green for the old dog's default shirt. The new
        // mascot keeps the artist's original charcoal uniform by default.
        material.color.copy(hex === '#58a45f' || hex === '#303136' ? original : new THREE.Color(hex));
      }
    };
    explorer.setShirtColor(color);
    explorer.group.visible=true;
    onSettled();
  }, undefined, () => {
    if(cancelled)return;
    explorer.group.visible=true;
    onSettled();
  });
  return () => { cancelled = true; };
}

const isEditable = target => target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
const distanceTo=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

export function createVillageGame(container, options = {}) {
  let destroyed=false,paused=false,companyId=VALID_COMPANIES.has(options.companyId)?options.companyId:'hub';
  let facilityId=null,world=null,frameId=0,transitionTimer=0,transitionVersion=0,inTransition=false,lastTime=0;
  let oceanLoad=noAssetLoad(),systemsHouseLoad=noAssetLoad(),aeroHouseLoad=noAssetLoad(),futureHousesLoad=noAssetLoad(),displayLoad=noAssetLoad(),residentLoad=noAssetLoad(),oceanDivisionShipLoad=noAssetLoad(),systemsResidentLoad=noAssetLoad(),mascotReady=false,sceneAssetsReady=false;
  let doorCooldown=0,walkTime=0,nearbyKey='',path=[],pointerStart=null,ready=false,comingSoonVisit=null;
  let direction={x:0,z:0},held=new Set();
  let renderer=null;
  const call=(name,...args)=>{if(!destroyed && typeof options[name]==='function')options[name](...args);};
  const inert={destroy(){destroyed=true;},setCompany(){},setPaused(){},setCharacterColor(){},moveToFacility(){},setDirection(){},exitInterior(){}};
  const canvas=document.createElement('canvas');
  canvas.setAttribute('aria-label','방향키로 탐험하는 3D 모여봐요 한화의 숲');
  canvas.setAttribute('role','img');canvas.tabIndex=0;
  canvas.style.cssText='display:block;width:100%;height:100%;outline:none;touch-action:none;';
  try {
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  } catch {
    queueMicrotask(()=>call('onError','3D 화면을 시작하지 못했어요. 브라우저의 하드웨어 가속을 켜고 새로고침해 주세요.'));
    return inert;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.2;
  container.appendChild(canvas);
  const previousPosition=container.style.position;
  if(getComputedStyle(container).position==='static')container.style.position='relative';
  const fade=document.createElement('div');
  fade.setAttribute('aria-hidden','true');
  fade.style.cssText='position:absolute;inset:0;background:#f4eedc;opacity:0;pointer-events:none;transition:opacity 180ms ease;z-index:3;';
  container.appendChild(fade);
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#c7e6df');scene.fog=new THREE.Fog('#c7e6df',48,100);
  const camera=new THREE.PerspectiveCamera(39,1,.1,160);
  const hemisphere=new THREE.HemisphereLight('#fff7de','#72977a',2.5);scene.add(hemisphere);
  const sun=new THREE.DirectionalLight('#fff4d6',3.1);sun.position.set(-14,28,12);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-32;sun.shadow.camera.right=32;
  sun.shadow.camera.top=32;sun.shadow.camera.bottom=-32;sun.shadow.camera.near=.5;sun.shadow.camera.far=85;
  sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;sun.shadow.radius=3;
  scene.add(sun,sun.target);
  const avatar=makeExplorer(/^#[0-9a-f]{6}$/i.test(options.color||'')?options.color:'#58a45f');scene.add(avatar.group);
  const cancelMascotLoad=loadMascotInto(avatar, options.color || '#58a45f',()=>{mascotReady=true;});
  const player={x:0,z:8};
  const cameraTarget=new THREE.Vector3(),desiredCamera=new THREE.Vector3();
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0),hitPoint=new THREE.Vector3();
  const destinationMarker=new THREE.Mesh(new THREE.RingGeometry(.27,.37,32),new THREE.MeshBasicMaterial({color:'#fff9c5',transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide}));
  destinationMarker.rotation.x=-Math.PI/2;destinationMarker.position.y=.04;destinationMarker.visible=false;scene.add(destinationMarker);
  const arrivalPositions=new Map();

  function resize() {
    if(destroyed)return;
    const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight);
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);resize();

  function cameraPosition(snap=false,dt=.016) {
    const interior=Boolean(facilityId);
    // Keep the camera near the character's height and on the front-facing side
    // of the village, so the avatar and house facades read from eye level.
    const offset=interior?{y:3.9,z:8.5,lookY:1.35,lead:1.4}:{y:3.8,z:10.8,lookY:1.35,lead:2.1};
    cameraTarget.set(player.x,offset.lookY,player.z-offset.lead);
    desiredCamera.set(player.x,offset.y,player.z+offset.z);
    if(snap)camera.position.copy(desiredCamera);
    else camera.position.lerp(desiredCamera,1-Math.exp(-5*dt));
    // Keep the gaze attached to the smoothed camera to avoid a springy horizon.
    const target=new THREE.Vector3(camera.position.x,offset.lookY,camera.position.z-offset.z-offset.lead);
    camera.lookAt(target);
  }

  function notifyLocation() {
    call('onLocationChange',{companyId,facilityId,label:facilityId?(world?.label||FACILITY_NAMES[facilityId]):(world?.label||COMPANY_NAMES[companyId]),interior:Boolean(facilityId)});
  }

  function clearInput() {held.clear();direction={x:0,z:0};path=[];destinationMarker.visible=false;}

  function replaceWorld(nextCompany,nextFacility,spawnOverride) {
    // Build first so a failed resource build never destroys the active room.
    const nextWorld=nextFacility?buildInterior(THREE,nextFacility):buildExterior(THREE,nextCompany);
    const spawn=nearestWalkablePoint(spawnOverride||nextWorld.spawn,nextWorld.colliders,nextWorld.bounds);
    if(!spawn){disposeGroup(nextWorld.group);throw new Error('No safe character spawn');}
    oceanLoad.cancel();systemsHouseLoad.cancel();aeroHouseLoad.cancel();futureHousesLoad.cancel();displayLoad.cancel();residentLoad.cancel();oceanDivisionShipLoad.cancel();systemsResidentLoad.cancel();
    if(world){scene.remove(world.group);disposeGroup(world.group);}
    world=nextWorld;companyId=nextCompany;facilityId=nextFacility;
    sceneAssetsReady=false;
    scene.add(world.group);player.x=spawn.x;player.z=spawn.z;
    oceanLoad=loadOceanExterior(world);
    systemsHouseLoad=loadSystemsExterior(world);
    aeroHouseLoad=loadAeroExterior(world);
    futureHousesLoad=loadFutureExteriors(world);
    displayLoad=loadModelDisplays(world);
    residentLoad=loadHouseResident(world);
    oceanDivisionShipLoad=loadOceanDivisionShip(world);
    systemsResidentLoad=loadSystemsResident(world);
    avatar.group.position.set(player.x,0,player.z);
    avatar.group.rotation.y=nextFacility?Math.PI:0;
    scene.background.set(nextFacility?'#e6dec9':'#c7e6df');
    scene.fog.color.copy(scene.background);
    scene.fog.near=nextFacility?45:48;
    sun.intensity=nextFacility?2.1:3.1;hemisphere.intensity=nextFacility?2.9:2.5;
    doorCooldown=performance.now()+1300;nearbyKey='';comingSoonVisit=null;clearInput();
    call('onNearby',null);cameraPosition(true);notifyLocation();
    return Promise.all([oceanLoad.ready,systemsHouseLoad.ready,aeroHouseLoad.ready,futureHousesLoad.ready,displayLoad.ready,residentLoad.ready,oceanDivisionShipLoad.ready,systemsResidentLoad.ready]).then(()=>{
      if(!destroyed&&world===nextWorld)sceneAssetsReady=true;
    });
  }

  function transition(nextCompany,nextFacility=null,spawnOverride=null,after=null) {
    if(destroyed)return;
    const version=++transitionVersion;
    window.clearTimeout(transitionTimer);clearInput();inTransition=true;
    // Cover the old scene before building a new one, then uncover it only
    // after every replacement model for that scene has settled.
    fade.style.transition='none';fade.style.opacity='1';
    transitionTimer=window.setTimeout(async()=>{
      if(destroyed||version!==transitionVersion)return;
      try{await replaceWorld(nextCompany,nextFacility,spawnOverride);}
      catch{call('onError','공간을 불러오지 못했어요. 현재 위치에서 다시 시도해 주세요.');}
      if(destroyed||version!==transitionVersion)return;
      inTransition=false;
      void fade.offsetWidth;
      fade.style.transition='opacity 180ms ease';fade.style.opacity='0';
      if(typeof after==='function')after();
    },40);
  }

  function enterHouse(id) {
    if(id==='radar'||id==='engine')return;
    if(!FACILITY_NAMES[id]||facilityId)return;
    const door=world.triggers.find(trigger=>trigger.type==='enter'&&trigger.id===id);
    if(door)arrivalPositions.set(id,{x:door.x,z:door.z+1.8});
    const model=world.doors?.find(item=>item.id===id);
    if(model)model.open=true;
    transition(companyId,id);
  }

  function leaveHouse(after=null) {
    if(!facilityId||inTransition)return;
    const exitPosition=arrivalPositions.get(facilityId);
    transition(companyId,null,exitPosition,after);
  }

  function triggerAction(trigger) {
    if(trigger.type==='enter')enterHouse(trigger.id);
    else if(trigger.type==='coming-soon'){
      clearInput();
      if(comingSoonVisit!==trigger.id){comingSoonVisit=trigger.id;call('onComingSoon','입주 예정입니다');}
    }
    else if(trigger.type==='exit')leaveHouse();
    else if(trigger.type==='company') {
      const id=trigger.id.replace(/^portal-/,'');
      if(VALID_COMPANIES.has(id))transition(id);
    }
  }

  function currentNearby() {
    if(!world)return null;
    let best=null,bestDistance=Infinity;
    for(const item of world.interactables||[]) {
      const distance=distanceTo(player,item);
      if(distance<(item.radius||2.1)&&distance<bestDistance) {
        best={...item,type:item.type||'inspect',label:item.label||'전시물 살펴보기'};bestDistance=distance;
      }
    }
    for(const trigger of world.triggers||[]) {
      const distance=distanceTo(player,trigger);
      if(distance<(trigger.radius||1)+1.5&&distance<bestDistance) {
        let label=trigger.label;
        if(!label)label=trigger.type==='enter'?`${FACILITY_NAMES[trigger.id]||'기술의 집'} · 문으로 걸어가 입장`:
          trigger.type==='exit'?'출구로 걸어가 마을로 나가기':`${COMPANY_NAMES[trigger.id.replace(/^portal-/,'')]||'중앙 마을'} · 관문으로 이동`;
        best={...trigger,label};bestDistance=distance;
      }
    }
    return best;
  }

  function interact() {
    if(paused||inTransition||destroyed)return;
    const nearby=currentNearby();
    if(!nearby)return;
    if(nearby.type==='inspect'&&facilityId) {clearInput();call('onInteract',nearby.id);}
    else if(nearby.type==='resident'&&facilityId) {clearInput();call('onResident',facilityId);}
    else if(nearby.type==='exit')leaveHouse();
    else if(nearby.type==='enter'||nearby.type==='coming-soon'||nearby.type==='company') {
      // A keyboard shortcut still walks the character into the real doorway.
      routeTo(nearby);
    }
  }

  function routeTo(point) {
    if(!world||destroyed||paused||inTransition)return;
    held.clear();direction={x:0,z:0};
    path=findPath(player,point,world.colliders,world.bounds);
    if(path.length){const destination=path.at(-1);destinationMarker.position.set(destination.x,.045,destination.z);destinationMarker.visible=true;}
  }

  function moveToFacility(id) {
    if(destroyed)return;
    if(id.startsWith('portal-')) {
      if(facilityId){leaveHouse(()=>moveToFacility(id));return;}
      const portal=world.triggers.find(trigger=>trigger.type==='company'&&(trigger.id===id||trigger.id===id.replace(/^portal-/,'')));
      if(portal)routeTo(portal);
      else {
        const target=id.replace('portal-','');
        if(VALID_COMPANIES.has(target))transition(target);
      }
      return;
    }
    const home=houseForTopic(id);
    if(!home)return;
    if(companyId!=='hub') {transition('hub',null,null,()=>moveToFacility(id));return;}
    if(facilityId===home.id) {
      const exhibit=world.interactables.find(item=>item.id===id&&item.type!=='resident');
      if(exhibit)routeTo({x:exhibit.x,z:exhibit.z+Math.min(1.9,(exhibit.radius||2)*.8)});
      return;
    }
    if(facilityId){leaveHouse(()=>moveToFacility(id));return;}
    const door=world.triggers.find(trigger=>['enter','coming-soon'].includes(trigger.type)&&trigger.id===home.id);
    if(door)routeTo(door);
  }

  function keyDown(event) {
    if(paused||inTransition||isEditable(event.target)||event.ctrlKey||event.metaKey||event.altKey)return;
    const key=event.key.toLowerCase();
    if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)) {
      event.preventDefault();held.add(key);path=[];destinationMarker.visible=false;
    } else if(key==='shift') {
      held.add('shift');
    } else if(key==='e'&&!event.repeat){event.preventDefault();interact();}
  }
  function keyUp(event){held.delete(event.key.toLowerCase());}
  function onBlur(){held.clear();direction={x:0,z:0};}
  function pointerDown(event){pointerStart={x:event.clientX,y:event.clientY};}
  function pointerUp(event) {
    if(!pointerStart||paused||inTransition||destroyed)return;
    const drag=Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y);pointerStart=null;
    if(drag>8)return;
    const rect=canvas.getBoundingClientRect();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    // Only an actual nearby exhibit opens a learning panel. Clicking a house
    // routes to its entrance, never jumps straight to educational content.
    const hits=raycaster.intersectObjects(world.group.children,true);
    const first=hits.find(hit=>hit.object.visible);
    if(first) {
      let object=first.object,interaction=null;
      while(object&&object!==world.group) {
        const data=object.userData;
        if(data.facilityId||data.interactId||data.triggerId) {interaction=data.facilityId||data.interactId||data.triggerId;break;}
        object=object.parent;
      }
      if(interaction) {
        if(facilityId&&distanceTo(player,world.interactables.find(item=>item.id===interaction)||{x:Infinity,z:Infinity})<2.3) {interact();return;}
        if(!facilityId){moveToFacility(interaction);return;}
      }
    }
    if(raycaster.ray.intersectPlane(groundPlane,hitPoint))routeTo({x:hitPoint.x,z:hitPoint.z});
    canvas.focus({preventScroll:true});
  }
  function contextLost(event){event.preventDefault();paused=true;clearInput();call('onError','3D 그래픽 연결이 잠시 끊겼어요. 새로고침하면 탐험 기록을 불러올 수 있어요.');}
  window.addEventListener('keydown',keyDown,{passive:false});window.addEventListener('keyup',keyUp);window.addEventListener('blur',onBlur);
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('webglcontextlost',contextLost);

  function tick(time) {
    if(destroyed)return;
    frameId=requestAnimationFrame(tick);
    if(document.hidden){lastTime=time;return;}
    // A 120/144 Hz display must not double the draw calls or battery usage.
    if(lastTime&&time-lastTime<1000/60-.25)return;
    const dt=lastTime?Math.min((time-lastTime)/1000,.2):.016;lastTime=time;
    let moving=false,running=false;
    if(world&&!paused&&!inTransition) {
      let dx=direction.x+(held.has('arrowright')||held.has('d')?1:0)-(held.has('arrowleft')||held.has('a')?1:0);
      let dz=direction.z+(held.has('arrowdown')||held.has('s')?1:0)-(held.has('arrowup')||held.has('w')?1:0);
      const keyboardMoving=Math.hypot(dx,dz)>.01;
      if(keyboardMoving){path=[];destinationMarker.visible=false;}
      else if(path.length) {
        const target=path[0];dx=target.x-player.x;dz=target.z-player.z;
        if(Math.hypot(dx,dz)<.1){path.shift();if(!path.length)destinationMarker.visible=false;}
      }
      const length=Math.hypot(dx,dz);
      if(length>.01) {
        running=held.has('shift');
        dx/=length;dz/=length;
        const stride=Math.min((running?8:4.7)*dt,path.length?Math.max(.01,distanceTo(player,path[0])):Infinity);
        const next=moveWithCollisions(player,{x:dx*stride,z:dz*stride},world.colliders,world.bounds,CHARACTER_RADIUS);
        moving=distanceTo(player,next)>.001;
        player.x=next.x;player.z=next.z;
        if(moving) {
          const angle=Math.atan2(dx,dz);
          const delta=THREE.MathUtils.euclideanModulo(angle-avatar.group.rotation.y+Math.PI,Math.PI*2)-Math.PI;
          avatar.group.rotation.y+=delta*Math.min(1,dt*17);
        }
      }
      if(time>doorCooldown) {
        const trigger=world.triggers.find(item=>distanceTo(player,item)<(item.radius||1));
        if(trigger){doorCooldown=time+1400;triggerAction(trigger);}
      }
      if(comingSoonVisit&&!world.triggers.some(item=>item.type==='coming-soon'&&item.id===comingSoonVisit&&distanceTo(player,item)<(item.radius||1)+.5))comingSoonVisit=null;
      const nearby=currentNearby(),key=nearby?`${nearby.type}:${nearby.id}`:'';
      if(key!==nearbyKey){nearbyKey=key;call('onNearby',nearby?{id:nearby.id,label:nearby.label,type:nearby.type}:null);}
    }
    walkTime+=dt*(moving?(running?16:10):2);
    const gait=moving?Math.sin(walkTime)*.65:Math.sin(walkTime)*.025;
    if (avatar.isModel) {
      avatar.model.rotation.z=moving?Math.sin(walkTime)*.035:0;
      avatar.group.position.set(player.x,moving?Math.abs(Math.sin(walkTime))*.035:0,player.z);
    } else {
      avatar.leftLeg.rotation.x=gait;avatar.rightLeg.rotation.x=-gait;
      avatar.leftArm.rotation.x=-gait*.8;avatar.rightArm.rotation.x=gait*.8;
      avatar.group.position.set(player.x,moving?Math.abs(Math.sin(walkTime))*.055:Math.sin(walkTime)*.012,player.z);
      avatar.head.rotation.z=moving?Math.sin(walkTime/2)*.025:Math.sin(walkTime*.4)*.018;
      avatar.tail.rotation.y=Math.sin(walkTime*(moving?1.8:1.2))*.32;
    }
    for(const item of world?.animated||[]) {
      if(item.kind==='rotate')item.mesh.rotation.y+=dt*(item.speed||1);
      else if(item.kind==='bob')item.mesh.position.y=(item.baseY??0)+Math.sin(time/1000*(item.speed||1))*.13;
      else if(item.kind==='water') {
        const positions=item.mesh.geometry.attributes.position,t=time*.0007;
        for(let i=0;i<positions.count;i++)positions.setZ(i,Math.sin(positions.getX(i)*.16+t)*.07+Math.cos(positions.getY(i)*.22-t*.8)*.06);
        positions.needsUpdate=true;
      }
    }
    for(const door of world?.doors||[]) {
      const angle=door.open?-Math.PI*.62:0;
      door.pivot.rotation.y=THREE.MathUtils.damp(door.pivot.rotation.y,angle,18,dt);
    }
    destinationMarker.scale.setScalar(1+Math.sin(time/180)*.08);
    cameraPosition(false,dt);renderer.render(scene,camera);
    if(!ready&&mascotReady&&sceneAssetsReady){ready=true;call('onReady');}
  }

  try{
    replaceWorld(companyId,null);
    frameId=requestAnimationFrame(tick);
  }
  catch{call('onError','마을을 준비하지 못했어요. 페이지를 새로고침해 주세요.');}

  return {
    destroy() {
      if(destroyed)return;destroyed=true;transitionVersion++;cancelAnimationFrame(frameId);clearTimeout(transitionTimer);resizeObserver.disconnect();
      cancelMascotLoad();oceanLoad.cancel();systemsHouseLoad.cancel();aeroHouseLoad.cancel();futureHousesLoad.cancel();displayLoad.cancel();residentLoad.cancel();oceanDivisionShipLoad.cancel();systemsResidentLoad.cancel();
      window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);window.removeEventListener('blur',onBlur);
      canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('webglcontextlost',contextLost);
      disposeGroup(world?.group);disposeGroup(avatar.group);disposeGroup(destinationMarker);
      sun.shadow.dispose();
      renderer.renderLists.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();fade.remove();
      container.style.position=previousPosition;
    },
    setCompany(id) {if(VALID_COMPANIES.has(id)&&id!==companyId)transition(id);},
    setPaused(value) {paused=Boolean(value);if(paused)clearInput();},
    setCharacterColor(color) {if(/^#[0-9a-f]{6}$/i.test(color))avatar.setShirtColor(color);},
    moveToFacility,
    setDirection(x,z) {
      if(typeof x==='object'&&x!==null){z=x.z??x.y??0;x=x.x??0;}
      if(paused||inTransition)return;
      direction={x:Math.max(-1,Math.min(1,Number(x)||0)),z:Math.max(-1,Math.min(1,Number(z)||0))};
      if(Math.hypot(direction.x,direction.z)>.01){path=[];destinationMarker.visible=false;}
    },
    exitInterior(){leaveHouse();},
  };
}

export default createVillageGame;
