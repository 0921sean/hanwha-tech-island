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
    else:
        summary = "공개 자료에서 구체적인 답을 확인하기 어려워요. 관심 사업, 전공 또는 부서를 덧붙이거나 추천 질문을 선택해 주세요."
    return {"summary": summary, "mode": "demo", "insufficient": not exact,
            "sources": data["sources"], "comparison": []}
