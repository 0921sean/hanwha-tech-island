import test from 'node:test';
import assert from 'node:assert/strict';
import {AERO_QUESTIONS,aeroAnswer,AERO_FIELDS,aeroSources} from '../src/data/aero.js';
test('four audiences each have five working recommended answers',()=>{
 assert.equal(Object.keys(AERO_QUESTIONS).length,4);
 for(const [audience,questions] of Object.entries(AERO_QUESTIONS)){
  assert.equal(questions.length,5);
  for(const q of questions){const answer=aeroAnswer(q,audience);assert.ok(answer.summary.length>30);assert.equal(answer.insufficient,false);assert.equal(answer.sources.length,4);}
 }
});
test('aerospace workshop keeps all four official source links',()=>{
 assert.deepEqual(AERO_FIELDS.map(f=>f.key),['space','air','land','sea']);
 for(const s of aeroSources)assert.ok(s.url.startsWith('https://www.hanwhaaerospace.com/kor/whatwedo/product/'));
 assert.match(aeroAnswer('해양 추진','일반대중').summary,/한화오션/);
});
