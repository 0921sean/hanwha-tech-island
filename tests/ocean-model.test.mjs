import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('supplied ocean exterior fits the house plot and faces the existing entrance', () => {
  const file = readFileSync(new URL('../public/models/seaside_house_03.glb', import.meta.url));
  assert.equal(file.toString('ascii', 0, 4), 'glTF');
  assert.equal(file.readUInt32LE(4), 2);
  const jsonLength = file.readUInt32LE(12);
  const gltf = JSON.parse(file.toString('utf8', 20, 20 + jsonLength));
  const bounds = name => {
    const mesh = gltf.meshes.find(item => item.name?.startsWith(name));
    assert.ok(mesh, `${name} mesh is present`);
    return gltf.accessors[mesh.primitives[0].attributes.POSITION];
  };
  const base = bounds('Base__');
  const door = bounds('Front_Door__');
  assert.ok(base.max[0] - base.min[0] < 7.3);
  assert.ok(base.max[2] - base.min[2] < 6);
  assert.ok(door.min[2] > 1.5, 'front door faces the player side of the plot');
});

test('supplied turtle is a forward-facing resident with a usable scale', () => {
  const file = readFileSync(new URL('../public/models/tori_turtle.glb', import.meta.url));
  assert.equal(file.toString('ascii', 0, 4), 'glTF');
  assert.equal(file.readUInt32LE(4), 2);
  const gltf = JSON.parse(file.toString('utf8', 20, 20 + file.readUInt32LE(12)));
  assert.equal(gltf.scenes[0].extras.axis, 'Y up, +Z forward');
  const positions = gltf.meshes.flatMap(mesh => mesh.primitives.map(primitive => gltf.accessors[primitive.attributes.POSITION]));
  const minY = Math.min(...positions.map(accessor => accessor.min[1]));
  const maxY = Math.max(...positions.map(accessor => accessor.max[1]));
  assert.equal(minY, 0);
  assert.ok(maxY > 1 && maxY < 2, 'turtle has a human-scale model height');
});

test('business division exhibit uses the supplied LNG carrier mesh', () => {
  const file = readFileSync(new URL('../public/models/LNG_carrier_3D_mesh.glb', import.meta.url));
  assert.equal(file.toString('ascii', 0, 4), 'glTF');
  assert.equal(file.readUInt32LE(4), 2);
  assert.equal(file.readUInt32LE(8), file.length);
  const gltf = JSON.parse(file.toString('utf8', 20, 20 + file.readUInt32LE(12)));
  assert.ok(gltf.meshes.length > 100);
  assert.ok(gltf.meshes.every(mesh => mesh.primitives.every(primitive => 'COLOR_0' in primitive.attributes)));
  const hull = gltf.accessors[gltf.meshes[0].primitives[0].attributes.POSITION];
  assert.ok(hull.max[0] - hull.min[0] > hull.max[1] - hull.min[1], 'long X axis needs a wide plinth');
});

test('ocean house uses the supplied transparent nameplate art', () => {
  const file = readFileSync(new URL('../public/images/ocean-house-nameplate.png', import.meta.url));
  assert.equal(file.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(file.readUInt32BE(16), 1877);
  assert.equal(file.readUInt32BE(20), 838);
  assert.equal(file[25], 6, 'PNG includes an alpha channel');
});
