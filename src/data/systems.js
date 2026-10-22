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
      : /k2|전차|탱크/.test(text) ? 'K2 흑표 전차에서 한화시스템은 사격통제시스템과 조준 장비를 담당해요. 전차 완성체의 제작사는 현대로템이에요. 왼쪽 전시물에서 센서와 정보 처리의 역할을 체험해 보세요.'
      : '공개 자료에서 이 질문의 구체적인 답을 확인하기 어려워요. 관심 사업, 전공 또는 부서를 덧붙이거나 아래 추천 질문을 선택해 주세요.';
  }
  return {summary, mode:'demo', insufficient:index < 0, sources:systemsSources};
}
export const SYSTEMS_EXHIBITS = [
  {id:'systems-k2', companyId:'systems', name:'K2 흑표 · 사격통제시스템', icon:'ground',
    summary:'전차의 센서와 컴퓨터가 정보를 연결해 운용자의 판단을 도와요.',
    analogy:'여러 관찰자의 메모를 한 장의 상황판으로 정리하는 도우미와 비슷해요.',
    analogyLimit:'실제 장비는 전용 센서와 컴퓨터를 사용해요. 모형은 외형을 단순화한 학습용이에요.',
    principle:'조준 장비가 관측한 정보를 사격통제컴퓨터가 처리하고 운용자에게 제공해요. K2 전차는 현대로템의 제품이며, 한화시스템의 역할은 사격통제시스템과 조준 장비를 중심으로 살펴봐요.',
    problem:'여러 관측 정보를 따로 보면 상황을 함께 파악하기 어려워요.', value:'센서와 정보 처리를 연결해 운용자의 상황 이해를 지원해요.',
    sources:data.sources.filter(s=>s.id==='systems-land'||s.id==='systems-k2-source'),
    challenge:{type:'sequence',title:'전차 안의 정보 연결',instruction:'정보가 운용자에게 전달되는 순서로 카드를 골라 주세요.',steps:['센서로 주변을 관측해요','컴퓨터가 관측 정보를 처리해요','운용자가 정보를 확인해요'],explanation:'관측 → 처리 → 확인의 흐름을 이해했어요. 실제 사격 절차를 재현하는 체험은 아니에요.'}},
  {id:'systems-pkmr', companyId:'systems', name:'PKMR · 함정 전투체계', icon:'naval',
    summary:'함정 전투체계는 여러 장비의 정보를 모아 운용자의 상황 판단을 도와요.',
    analogy:'각 반의 소식을 모아 학교 전체 상황을 보여주는 방송실을 떠올려 보세요.',
    analogyLimit:'PKMR 모형은 학습용으로 외형을 단순화했어요. 설명과 체험은 함정 전투체계의 일반적인 정보 흐름이에요.',
    principle:'레이다와 전자광학 등 센서가 얻은 정보를 전투체계가 연결하고 화면에 보여줘요. 배의 선체와 그 안의 전투체계는 서로 다른 역할을 해요.',
    problem:'센서와 장비의 정보를 따로 확인하면 전체 상황을 이해하기 어려워요.',value:'정보를 통합해 운용자의 상황 인식과 판단을 지원해요.',
    sources:data.sources.filter(s=>s.id==='systems-naval'||s.id==='systems-combat'),
    challenge:{type:'sequence',title:'함정의 상황판을 완성해요',instruction:'센서 정보가 상황판에 도착하는 순서대로 골라 주세요.',steps:['센서가 주변 정보를 얻어요','전투체계가 정보를 모으고 연결해요','통합 화면으로 상황을 확인해요'],explanation:'탐지 정보를 연결하면 전체 상황을 이해하기 쉬워져요. 특정 함정의 장비 구성이나 성능을 재현하지 않아요.'}}
];
