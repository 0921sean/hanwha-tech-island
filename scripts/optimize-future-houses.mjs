import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

for(const [sourceName,outputName] of [
  ['power_house-source.glb','power_house.glb'],
  ['engine_house-source.glb','engine_house.glb'],
]){
  const sourcePath=fileURLToPath(new URL(`../assets/${sourceName}`,import.meta.url));
  const outputPath=fileURLToPath(new URL(`../public/models/${outputName}`,import.meta.url));
  const input=fs.readFileSync(sourcePath);
  assert.equal(input.toString('ascii',0,4),'glTF');
  let json,sourceBin;
  for(let offset=12;offset<input.length;){
    const length=input.readUInt32LE(offset),type=input.toString('ascii',offset+4,offset+8);
    if(type==='JSON')json=JSON.parse(input.toString('utf8',offset+8,offset+8+length));
    if(type==='BIN\0')sourceBin=input.subarray(offset+8,offset+8+length);
    offset+=8+length;
  }
  assert.ok(json&&sourceBin);
  assert.equal(json.buffers.length,1);
  assert.ok(!json.images?.length);

  const chunks=[],views=[],accessors=[],meshes=[],nodes=[];
  let byteLength=0;
  function append(bytes){
    const view={buffer:0,byteOffset:byteLength,byteLength:bytes.length,target:34962};
    views.push(view);chunks.push(bytes);byteLength+=bytes.length;
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
  const groups=new Map();
  for(const node of json.nodes){
    assert.ok(node.mesh!==undefined);
    assert.ok(!node.children&&!node.matrix&&!node.translation&&!node.rotation&&!node.scale);
    const mesh=json.meshes[node.mesh];
    assert.equal(mesh.primitives.length,1);
    const part=mesh.primitives[0];
    assert.equal(part.indices,undefined);
    assert.equal(part.mode??4,4);
    const key=`${part.material}|${Object.keys(part.attributes).sort().join(',')}`;
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(part);
  }
  for(const [key,parts] of groups){
    const attributes={};
    for(const name of Object.keys(parts[0].attributes)){
      const sources=parts.map(part=>json.accessors[part.attributes[name]]),first=sources[0];
      assert.ok(sources.every(source=>source.type===first.type&&source.componentType===first.componentType));
      const accessor={bufferView:append(Buffer.concat(sources.map(accessorBytes))),componentType:first.componentType,count:sources.reduce((sum,source)=>sum+source.count,0),type:first.type};
      if(sources.every(source=>source.min&&source.max)){
        accessor.min=first.min.map((_,i)=>Math.min(...sources.map(source=>source.min[i])));
        accessor.max=first.max.map((_,i)=>Math.max(...sources.map(source=>source.max[i])));
      }
      attributes[name]=accessors.push(accessor)-1;
    }
    const name=`Static house ${key}`;
    nodes.push({name,mesh:meshes.push({name,primitives:[{attributes,material:parts[0].material}]})-1});
  }
  const optimized={asset:{...json.asset,generator:'Hanwha future house static mesh merge'},scene:0,scenes:[{nodes:nodes.map((_,i)=>i)}],nodes,meshes,materials:json.materials,accessors,bufferViews:views,buffers:[{byteLength}]};
  const jsonBytes=Buffer.from(JSON.stringify(optimized),'utf8');
  const jsonChunk=Buffer.concat([jsonBytes,Buffer.alloc((4-jsonBytes.length%4)%4,0x20)]);
  const binChunk=Buffer.concat(chunks);
  const header=Buffer.alloc(12),jsonHeader=Buffer.alloc(8),binHeader=Buffer.alloc(8);
  header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+jsonChunk.length+8+binChunk.length,8);
  jsonHeader.writeUInt32LE(jsonChunk.length,0);jsonHeader.write('JSON',4);
  binHeader.writeUInt32LE(binChunk.length,0);binHeader.write('BIN\0',4);
  fs.writeFileSync(outputPath,Buffer.concat([header,jsonHeader,jsonChunk,binHeader,binChunk]));
  console.log(`${outputName}: merged ${json.nodes.length} nodes into ${nodes.length}`);
}
