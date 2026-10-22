"""Local educational answers shared with the browser's systems house."""
import re


def answer_systems(data, question, audience):
    questions = data["questions"].get(audience, [])
    exact = question in questions
    if exact:
        summary = data["responses"][audience][questions.index(question)]
    elif re.search(r"레이다|레이더|radar|전파", question, re.I):
        summary = data["responses"]["일반대중"][1]
    elif re.search(r"함정|pkmr|전투체계", question, re.I):
        summary = data["responses"]["일반대중"][2]
    elif re.search(r"k2|전차|탱크", question, re.I):
        summary = "K2 전차의 제작사는 현대로템이며, 한화시스템은 사격통제시스템과 조준 장비를 담당해요. 왼쪽 전시물에서 정보 처리의 역할을 살펴보세요."
    else:
        summary = "공개 자료에서 구체적인 답을 확인하기 어려워요. 관심 사업, 전공 또는 부서를 덧붙이거나 추천 질문을 선택해 주세요."
    return {"summary": summary, "mode": "demo", "insufficient": not exact,
            "sources": data["sources"], "comparison": []}
