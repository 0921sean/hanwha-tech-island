import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SYSTEMS_QUESTIONS, SYSTEMS_EXHIBITS, systemsAnswer } from '../src/data/systems.js';

test('all 20 systems questions have mode-specific answers and supplied official links',()=>{
  assert.deepEqual(Object.keys(SYSTEMS_QUESTIONS),['고객','일반대중','취준생','신규입사자']);
  for(const [mode,questions] of Object.entries(SYSTEMS_QUESTIONS)){
    assert.equal(questions.length,5);
    for(const q of questions){
      const a=systemsAnswer(q,mode);
      assert.equal(a.insufficient,false);assert.ok(a.summary.length>35);
      assert.ok(a.sources.some(s=>s.url.endsWith('/naval/combat01.do')));
    }
  }
  assert.equal(systemsAnswer('자료에 없는 질문','고객').insufficient,true);
});
test('K2 and PKMR retain explanation, activity and source content',()=>{
  assert.deepEqual(SYSTEMS_EXHIBITS.map(f=>f.id),['systems-k2','systems-pkmr']);
  assert.match(SYSTEMS_EXHIBITS[0].principle,/현대로템/);
  for(const f of SYSTEMS_EXHIBITS){assert.equal(f.challenge.steps.length,3);assert.ok(f.sources.length>=2);assert.ok(f.principle&&f.analogy&&f.value);}
});
test('supplied Hantori is a complete GLB 2 asset',()=>{
  const file=fs.readFileSync(new URL('../public/hantori-edited.glb',import.meta.url));
  assert.equal(file.readUInt32LE(0),0x46546c67);assert.equal(file.readUInt32LE(4),2);assert.equal(file.readUInt32LE(8),file.length);
  const gltf=JSON.parse(file.subarray(20,20+file.readUInt32LE(12)).toString());
  assert.ok(gltf.meshes.length>0);
  assert.ok(!gltf.buffers.some(b=>b.uri),'GLB must not depend on missing external buffers');
});
