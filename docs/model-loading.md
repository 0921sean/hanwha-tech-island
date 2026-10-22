# 캐릭터·집 모델 교체 시 화면 전환 규칙

오션의 집·주민 파도·사업부 전시선과 시스템의 집 주민 한토리는 GLB를 비동기로 불러옵니다. 로딩 동안 예전 임시 모델을 보이게 하면 집을 나갔다 다시 들어올 때 한두 프레임 동안 옛 집이나 캐릭터가 나타납니다. 다음 규칙을 지켜 주세요.

1. **새 공간의 임시 모델은 처음부터 숨깁니다.** `src/game/world3d.js`에서 오션의 집, 파도, 사업부 전시선, 한토리의 `fallback.visible`을 `false`로 둡니다. 임시 모델은 GLB 로딩이 실제로 실패했을 때만 표시합니다. 다른 캐릭터나 집을 GLB로 바꿀 때도 같은 방식으로 만듭니다.
2. **전환 화면은 필요한 모델과 텍스처가 모두 준비된 후 걷습니다.** `src/game/VillageGame.js`의 `replaceWorld()`가 각 로더의 `ready`를 반환하고, `transition()`이 이를 기다립니다. 로딩 완료 전에 전환 화면을 닫거나 `onReady`를 호출하지 않습니다.
3. **늦게 끝난 이전 로딩 결과를 붙이지 않습니다.** 공간을 바꾸거나 게임을 종료할 때 로더를 `cancel()`하고, 완료 콜백은 취소 상태를 확인합니다. 취소된 GLB와 텍스처는 폐기합니다. 전환 완료 시에는 `transitionVersion`을 확인해 이전 전환이 새 화면을 덮지 않게 합니다.
4. **파일 내용을 바꿀 때 브라우저 캐시도 갱신합니다.** 교체 GLB·PNG의 파일명을 새 버전으로 바꾸고 `VillageGame.js`의 경로를 함께 수정하거나 URL 버전 쿼리를 올립니다. 파일과 코드가 서로 다른 버전을 가리키지 않는지 확인합니다.
5. **반복 이동으로 검증합니다.** `npm test`와 `npm run build`를 통과시킨 뒤 실제 브라우저에서 중앙 광장 ↔ 오션의 집, 중앙 광장 ↔ 시스템의 집을 여러 번 왕복합니다. 느린 네트워크에서도 옛 집·옛 주민이 한 프레임도 나오지 않아야 합니다. GLB 요청 실패 시에만 임시 모델이 나타나고 입장·대화 기능은 계속 동작해야 합니다.

현재 파일: `public/models/seaside_house_03.glb`(오션의 집), `public/models/tori_turtle.glb`(파도), `public/models/LNG_carrier_3D_mesh.glb`(사업부 전시선), `public/hantori-edited.glb`(한토리), `public/images/ocean-house-nameplate.png`(명패), `hanwha-mascot.glb`(플레이어 캐릭터).
