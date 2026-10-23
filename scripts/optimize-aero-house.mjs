import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const sourcePath=fileURLToPath(new URL('../assets/aero_house-source.glb',import.meta.url));
const outputPath=fileURLToPath(new URL('../public/models/aero_house.glb',import.meta.url));
const input=fs.readFileSync(sourcePath);
assert.equal(input.toString('ascii',0,4),'glTF');
assert.equal(input.readUInt32LE(4),2);
let json,sourceBin;
for(let offset=12;offset<input.length;){
  const length=input.readUInt32LE(offset),type=input.toString('ascii',offset+4,offset+8);
  if(type==='JSON')json=JSON.parse(input.toString('utf8',offset+8,offset+8+length));
  if(type==='BIN\0')sourceBin=input.subarray(offset+8,offset+8+length);
  offset+=8+length;
}
assert.ok(json&&sourceBin);
assert.equal(json.buffers.length,1);
assert.equal(json.images.length,1);

const chunks=[],views=[],accessors=[],meshes=[],nodes=[];
let byteLength=0;
function append(bytes,target){
  const view={buffer:0,byteOffset:byteLength,byteLength:bytes.length};
  if(target)view.target=target;
  views.push(view);chunks.push(bytes);
  byteLength+=bytes.length;
  const padding=(4-byteLength%4)%4;
  if(padding){chunks.push(Buffer.alloc(padding));byteLength+=padding;}
  return views.length-1;
}
function accessorBytes(accessor){
  assert.equal(accessor.componentType,5126);
  assert.equal(accessor.byteOffset??0,0);
  const view=json.bufferViews[accessor.bufferView];
  assert.equal(view.buffer,0);
  assert.equal(view.byteStride,undefined);
  return sourceBin.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength);
}
const imageView=json.bufferViews[json.images[0].bufferView];
const imageBytes=sourceBin.subarray(imageView.byteOffset??0,(imageView.byteOffset??0)+imageView.byteLength);
const optimizedImageView=append(imageBytes);

function addMesh(name,parts){
  const attributes={},names=Object.keys(parts[0].attributes);
  for(const attributeName of names){
    const sources=parts.map(part=>json.accessors[part.attributes[attributeName]]);
    const first=sources[0];
    assert.ok(sources.every(source=>source.type===first.type&&source.componentType===first.componentType));
    const bytes=Buffer.concat(sources.map(accessorBytes));
    const accessor={bufferView:append(bytes,34962),componentType:first.componentType,count:sources.reduce((sum,source)=>sum+source.count,0),type:first.type};
    if(sources.every(source=>source.min&&source.max)){
      accessor.min=first.min.map((_,i)=>Math.min(...sources.map(source=>source.min[i])));
      accessor.max=first.max.map((_,i)=>Math.max(...sources.map(source=>source.max[i])));
    }
    attributes[attributeName]=accessors.push(accessor)-1;
  }
  const mesh={name,primitives:[{attributes,material:parts[0].material}]};
  nodes.push({name,mesh:meshes.push(mesh)-1});
}

const doorNames=new Set(['Olive arched door','Door plank seam','Door window frame','Door window glass','Door window mullion','Door window cross','Brass doorknob']);
const staticGroups=new Map(),doors=[];
for(const node of json.nodes){
  assert.equal(node.children,undefined);
  assert.equal(node.matrix,undefined);
  assert.equal(node.translation,undefined);
  assert.equal(node.rotation,undefined);
  assert.equal(node.scale,undefined);
  const sourceMesh=json.meshes[node.mesh];
  assert.equal(sourceMesh.primitives.length,1);
  const part=sourceMesh.primitives[0];
  assert.equal(part.indices,undefined);
  assert.equal(part.mode??4,4);
  if(doorNames.has(node.name)){doors.push({name:node.name,part});continue;}
  const key=`${part.material}|${Object.keys(part.attributes).sort().join(',')}`;
  if(!staticGroups.has(key))staticGroups.set(key,[]);
  staticGroups.get(key).push(part);
}
for(const [key,parts] of staticGroups)addMesh(`Static house ${key}`,parts);
for(const door of doors)addMesh(door.name,[door.part]);

const optimized={
  asset:{...json.asset,generator:'Hanwha aero house static mesh merge'},
  scene:0,scenes:[{nodes:nodes.map((_,i)=>i)}],nodes,meshes,
  materials:json.materials,textures:json.textures,samplers:json.samplers,
  images:[{...json.images[0],bufferView:optimizedImageView}],
  accessors,bufferViews:views,buffers:[{byteLength}],
};
const jsonBytes=Buffer.from(JSON.stringify(optimized),'utf8');
const jsonPadding=(4-jsonBytes.length%4)%4;
const jsonChunk=Buffer.concat([jsonBytes,Buffer.alloc(jsonPadding,0x20)]);
const binChunk=Buffer.concat(chunks);
const header=Buffer.alloc(12),jsonHeader=Buffer.alloc(8),binHeader=Buffer.alloc(8);
header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+jsonChunk.length+8+binChunk.length,8);
jsonHeader.writeUInt32LE(jsonChunk.length,0);jsonHeader.write('JSON',4);
binHeader.writeUInt32LE(binChunk.length,0);binHeader.write('BIN\0',4);
fs.writeFileSync(outputPath,Buffer.concat([header,jsonHeader,jsonChunk,binHeader,binChunk]));
console.log(`Merged ${json.nodes.length} nodes into ${nodes.length} while keeping ${doors.length} door pieces separate.`);
