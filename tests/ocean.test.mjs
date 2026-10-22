import test from 'node:test';
import assert from 'node:assert/strict';
import { HOUSES } from '../src/data/houses.js';
import { OCEAN_QUESTIONS, oceanAnswer, oceanTopic } from '../src/data/ocean.js';

test('ocean house is named and all four audiences have five exact questions', () => {
  assert.equal(HOUSES.find(h => h.id === 'lng').name, '오션의 집');
  assert.deepEqual(Object.keys(OCEAN_QUESTIONS), ['고객', '일반대중', '취준생', '신규입사자']);
  for (const [audience, questions] of Object.entries(OCEAN_QUESTIONS)) {
    assert.equal(questions.length, 5);
    for (const question of questions) {
      const answer = oceanAnswer(question, audience);
      assert.equal(answer.mode, 'demo');
      assert.equal(answer.insufficient, false);
      assert.ok(answer.summary.length > 30);
      assert.ok(answer.sources.every(source => source.url.startsWith('https://')));
    }
  }
  assert.equal(oceanAnswer('확인되지 않은 계약 조건은?', '고객').insufficient, true);
  assert.equal(oceanTopic('잠수함은?'), 'naval');
  assert.equal(oceanTopic('FLNG란?'), 'offshore');
});
