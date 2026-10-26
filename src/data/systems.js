import data from './systems.json' with {type:'json'};
export const SYSTEMS_QUESTIONS = data.questions;
export const systemsSources = data.sources;
export function systemsAnswer(question, audience) {
  const index = SYSTEMS_QUESTIONS[audience]?.indexOf(question) ?? -1;
  let summary = index >= 0 ? data.responses[audience][index] : '';
  if (!summary) {
    const text = question.toLowerCase();
    summary = /레이다|레이더|radar|전파/.test(text) ? data.responses['일반대중'][1]
      : /함정|pkmr|전투체계/.test(text) ? data.responses['일반대중'][2]
      : '공개 자료에서 이 질문의 구체적인 답을 확인하기 어려워요. 관심 사업, 전공 또는 부서를 덧붙이거나 아래 추천 질문을 선택해 주세요.';
  }
  return {summary, mode:'demo', insufficient:index < 0, sources:systemsSources};
}
export const SYSTEMS_EXHIBITS = [
  {id:'systems-aesa', companyId:'systems', name:'AESA 레이다', icon:'radar',
    summary:'AESA 레이다는 전파를 보내고 돌아온 신호를 처리해 대상을 탐지하고 추적해요.',
    analogy:'손전등 빛을 여러 방향으로 돌려 주변을 살피는 장면을 떠올려 보세요.',
    analogyLimit:'실제 레이다는 빛이 아니라 전파를 사용하고, 전자식으로 빔 방향을 바꿔요.',
    principle:'능동형 전자식 빔 주사 배열은 전파 빔의 방향을 전자적으로 조절해요. 반사 신호를 처리하면 대상의 거리와 방향, 움직임을 파악하는 데 도움이 돼요.',
    problem:'넓은 공간에서 여러 대상의 위치와 움직임을 파악해야 해요.',value:'탐지·추적 정보를 제공해 운용자가 상황을 이해하도록 도와요.',
    sources:data.sources.filter(s=>s.id==='systems-isr'||s.id==='systems-aesa'),
    challenge:{type:'sequence',title:'레이다가 주변을 살펴요',instruction:'전파가 정보를 전하는 순서대로 골라 주세요.',steps:['전파를 보내요','대상에서 돌아온 신호를 받아요','신호를 처리해 위치와 움직임을 살펴요'],explanation:'송신 → 수신 → 처리의 흐름을 이해했어요. 실제 장비의 운용 절차를 재현하는 체험은 아니에요.'}},
  {id:'systems-pkmr', companyId:'systems', name:'PKMR · 함정 전투체계', icon:'naval',
    summary:'함정 전투체계는 여러 장비의 정보를 모아 운용자의 상황 판단을 도와요.',
    analogy:'각 반의 소식을 모아 학교 전체 상황을 보여주는 방송실을 떠올려 보세요.',
    analogyLimit:'PKMR 모형은 학습용으로 외형을 단순화했어요. 설명과 체험은 함정 전투체계의 일반적인 정보 흐름이에요.',
    principle:'레이다와 전자광학 등 센서가 얻은 정보를 전투체계가 연결하고 화면에 보여줘요. 배의 선체와 그 안의 전투체계는 서로 다른 역할을 해요.',
    problem:'센서와 장비의 정보를 따로 확인하면 전체 상황을 이해하기 어려워요.',value:'정보를 통합해 운용자의 상황 인식과 판단을 지원해요.',
    sources:data.sources.filter(s=>s.id==='systems-naval'||s.id==='systems-combat'),
    challenge:{type:'sequence',title:'함정의 상황판을 완성해요',instruction:'센서 정보가 상황판에 도착하는 순서대로 골라 주세요.',steps:['센서가 주변 정보를 얻어요','전투체계가 정보를 모으고 연결해요','통합 화면으로 상황을 확인해요'],explanation:'탐지 정보를 연결하면 전체 상황을 이해하기 쉬워져요. 특정 함정의 장비 구성이나 성능을 재현하지 않아요.'}}
];
