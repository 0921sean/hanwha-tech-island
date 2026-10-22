(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const storageKey = 'hanwha-ocean-experience-v1';
  const badges = ['route', 'sonar', 'plant', 'quiz'];
  const progress = Object.fromEntries(badges.map((key) => [key, false]));
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    badges.forEach((key) => { progress[key] = saved[key] === true; });
  } catch { /* Private browsing may block storage. */ }

  function updateProgress() {
    const count = badges.filter((key) => progress[key]).length;
    $('#overall-progress').textContent = `${count} / 4 완료`;
    $('#overall-progress-bar').style.width = `${count * 25}%`;
    badges.forEach((key) => {
      const badge = $(`[data-badge="${key}"]`);
      badge.classList.toggle('complete', progress[key]);
      badge.querySelector('i').textContent = progress[key] ? '완료 ✓' : '미완료';
    });
    $('#explorer-certificate').hidden = count !== 4;
  }
  function earn(key) {
    if (!progress[key]) {
      progress[key] = true;
      try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch { /* Session-only progress. */ }
      updateProgress();
    }
  }
  $('#reset-progress').addEventListener('click', () => {
    badges.forEach((key) => { progress[key] = false; });
    try { localStorage.removeItem(storageKey); } catch { /* Session-only progress. */ }
    updateProgress();
  });
  updateProgress();

  function fillList(selector, items) {
    const list = $(selector);
    list.replaceChildren(...items.map((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    }));
  }
  function makeSelector(container, items, onSelect) {
    const root = $(container);
    items.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.name;
      button.setAttribute('aria-pressed', String(index === 0));
      button.addEventListener('click', () => {
        root.querySelectorAll('button').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
        onSelect(item, index);
      });
      root.append(button);
    });
    onSelect(items[0], 0);
  }

  const vesselData = [
    { name: 'LNG 운반선', en: 'LNG CARRIER', desc: '액화천연가스를 약 영하 162도의 극저온 상태로 저장해 바다를 건너 운송하는 선박입니다.', points: ['극저온 화물창과 단열', '기화가스 관리와 에너지 효율', '세계 LNG 공급망 연결'], fact: 'LNG는 부피를 줄이기 위해 액화합니다. 운송 중에는 화물창의 온도와 압력을 관리하고 기화가스를 다루는 기술이 중요합니다.', icon: 'tank' },
    { name: '초대형 원유운반선', en: 'VLCC', desc: '대량의 원유를 장거리로 운송하는 대형 선박으로, 안전한 화물 관리와 효율적인 운항이 중요합니다.', points: ['대규모 원유 운송', '화물 관리와 선체 안전', '추진 효율과 연료 절감'], fact: 'VLCC는 Very Large Crude Carrier의 약자입니다. 화물을 대량으로 실을 수 있도록 설계된 원유 운반선입니다.', icon: 'tanker' },
    { name: '컨테이너선', en: 'CONTAINER SHIP', desc: '표준화된 컨테이너에 담긴 다양한 화물을 세계 각지로 운송하며 국제 물류를 연결합니다.', points: ['표준 컨테이너 운송', '효율적인 적재와 항로 운영', '대형 선박 설계'], fact: '컨테이너 규격을 표준화하면 항구에서 선박·트럭·철도 사이의 화물을 더 쉽게 옮길 수 있습니다.', icon: 'container' },
    { name: '액화가스·암모니아 운반선', en: 'GAS & AMMONIA CARRIER', desc: 'LPG와 암모니아 등 화물별 성질에 맞는 저장·관리 체계를 갖춘 특수 화물선입니다.', points: ['화물별 저장 조건 고려', '안전한 화물 관리', '에너지 운송의 선택지 확대'], fact: '액화가스와 암모니아는 물질마다 요구되는 온도·압력·안전 조건이 다르므로 선박과 화물 시스템도 이에 맞춰 설계됩니다.', icon: 'gas' },
  ];
  function shipSvg(icon) {
    const cargo = {
      tank: '<ellipse cx="180" cy="136" rx="55" ry="32" fill="#edf1ee"/><ellipse cx="300" cy="136" rx="55" ry="32" fill="#edf1ee"/><ellipse cx="180" cy="136" rx="55" ry="32" fill="none" stroke="#8db5be" stroke-width="4"/><ellipse cx="300" cy="136" rx="55" ry="32" fill="none" stroke="#8db5be" stroke-width="4"/>',
      tanker: '<path d="M114 129H391V170H114Z" fill="#bacdd2"/><path d="M126 137H375M126 151H375" stroke="#6c929c" stroke-width="4"/>',
      container: '<path d="M120 93h92v72h-92zM216 93h92v72h-92zM312 93h92v72h-92z" fill="#f37321" stroke="#d05b16" stroke-width="4"/><path d="M122 117h280M122 141h280" stroke="#f9b47d" stroke-width="3"/>',
      gas: '<rect x="126" y="108" width="118" height="60" rx="27" fill="#e4f1ed"/><rect x="254" y="108" width="118" height="60" rx="27" fill="#e4f1ed"/><path d="M138 136h222" stroke="#9bbcc3" stroke-width="4"/>',
    }[icon];
    return `<path d="M49 170H471L431 216H96L49 170Z" fill="#a5d0d9"/><path d="M66 180H456L427 207H104L66 180Z" fill="#567e90"/>${cargo}<path d="M398 93H441V170H398Z" fill="#e8f1eb"/><path d="M414 65H423V94H414Z" fill="#a5c4cc"/><path d="M85 236C165 220 224 249 310 234C395 220 447 247 492 233" stroke="#60cee7" stroke-width="5" fill="none"/>`;
  }
  let selectedVessel = vesselData[0];
  makeSelector('#vessel-select', vesselData, (item) => {
    selectedVessel = item;
    $('#vessel-svg').innerHTML = shipSvg(item.icon);
    $('#vessel-tag').textContent = item.en;
    $('#vessel-en').textContent = item.en;
    $('#vessel-name').textContent = item.name;
    $('#vessel-description').textContent = item.desc;
    fillList('#vessel-points', item.points);
  });
  $('#vessel-fact-button').addEventListener('click', () => {
    $('#fact-title').textContent = selectedVessel.name;
    $('#fact-body').textContent = selectedVessel.fact;
    const dialog = $('#fact-dialog');
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
  });
  $('#fact-close').addEventListener('click', () => {
    const dialog = $('#fact-dialog');
    if (dialog.close) dialog.close(); else dialog.removeAttribute('open');
  });

  const navalData = [
    { name: '잠수함', en: 'SUBMARINE', desc: '수중에서 항해하며 다양한 해양 임무를 수행하는 함정입니다. 한화오션의 공개 자료에는 장보고-III급 잠수함 사례가 소개됩니다.', points: ['수중 항해와 탐지의 일반 원리', '선체·추진·통신 체계의 통합', '장보고-III급 공개 사례'] },
    { name: '구축함', en: 'DESTROYER', desc: '함대 방어를 비롯한 여러 해상 임무를 수행하는 수상 전투함입니다.', points: ['해상 방어와 함대 운용', '선체·추진·센서의 기본 구성', '함정 시스템의 통합'] },
    { name: '기타 수상함', en: 'SURFACE VESSELS', desc: '임무에 따라 다양한 형태로 설계되는 수상함입니다. 상선과 달리 공공·안보 임무를 위한 체계가 포함됩니다.', points: ['임무에 맞는 함정 유형', '해상 작전 및 지원', '상선과 다른 설계 목적'] },
    { name: '함정 MRO', en: 'NAVAL MRO', desc: '운용 중인 함정을 점검하고 유지·보수·정비해 성능과 운용 가능 상태를 관리하는 분야입니다.', points: ['정기 점검과 정비', '부품·설비 유지관리', '함정 운용 수명 관리'] },
  ];
  makeSelector('#naval-select', navalData, (item) => {
    $('#naval-en').textContent = item.en;
    $('#naval-name').textContent = item.name;
    $('#naval-description').textContent = item.desc;
    fillList('#naval-points', item.points);
    const submerged = item.en === 'SUBMARINE';
    $('#naval-illustration').classList.toggle('submerged', submerged);
    $('#naval-stage-tag').textContent = submerged ? 'SUBMERGED / 수중' : 'SURFACE / 수상';
  });
  $('#dive-button').addEventListener('click', () => {
    const vessel = $('#naval-illustration');
    vessel.classList.toggle('submerged');
    $('#naval-stage-tag').textContent = vessel.classList.contains('submerged') ? 'SUBMERGED / 수중' : 'SURFACE / 수상';
  });
  const navalFacts = {
    platform: '함정 플랫폼: 선체·추진·전력·생활 공간 등이 목적에 맞게 함께 설계됩니다.',
    sensor: '센서: 함정은 주변 환경을 파악하기 위한 여러 센서를 사용합니다. 여기서는 공개된 일반 개념만 소개합니다.',
  };
  $$('[data-hotspot]').forEach((button) => button.addEventListener('click', () => {
    $('#hotspot-info').textContent = navalFacts[button.dataset.hotspot];
  }));

  const epuData = [
    { name: 'FLNG', en: 'FLOATING LNG', desc: '해상에서 천연가스를 처리·액화하고 저장하는 부유식 LNG 생산설비입니다.', points: ['해상 천연가스 처리', '가스 액화와 LNG 저장', '운송 선박과의 연계'] },
    { name: 'FPSO', en: 'FLOATING PRODUCTION', desc: '해상 유전에서 생산한 원유를 처리·저장하고 다른 선박으로 옮기는 부유식 설비입니다.', points: ['해상 원유 생산과 처리', '원유 저장', '선박으로 하역'] },
    { name: '육상 플랜트', en: 'ONSHORE PLANT', desc: '육지의 발전·산업 시설에서 설계, 조달, 시공 등 플랜트 사업 역량을 활용합니다.', points: ['설비 설계', '기자재 조달', '시공과 시운전'] },
    { name: '해상풍력·재생에너지', en: 'OFFSHORE RENEWABLES', desc: '해상풍력과 관련 인프라는 바다의 바람을 전기에너지로 바꾸는 에너지 전환 분야입니다.', points: ['풍력 터빈과 해상 설비', '전력 연결 인프라', '설치와 운영 지원'] },
  ];
  makeSelector('#epu-select', epuData, (item) => {
    $('#epu-en').textContent = item.en;
    $('#epu-name').textContent = item.name;
    $('#epu-description').textContent = item.desc;
    fillList('#epu-points', item.points);
    $('.plant-stage').classList.toggle('show-wind', item.en === 'OFFSHORE RENEWABLES');
    $('.plant-stage').classList.toggle('show-land', item.en === 'ONSHORE PLANT');
  });
  const epuFacts = {
    production: '생산: 바다의 에너지 자원을 끌어올리거나 바람의 운동에너지를 전기로 바꾸는 단계입니다.',
    processing: '처리: 생산된 자원을 운송·사용하기 좋은 상태로 만들기 위한 공정입니다.',
    storage: '저장·운송: 처리한 자원을 설비에 저장한 뒤 선박이나 육상 인프라로 연결합니다.',
  };
  $$('[data-epu-hotspot]').forEach((button) => button.addEventListener('click', () => {
    $('#epu-hotspot-info').textContent = epuFacts[button.dataset.epuHotspot];
  }));
  $('#flow-button').addEventListener('click', () => {
    const flow = $('.energy-flow');
    flow.classList.remove('active');
    void flow.offsetWidth;
    flow.classList.add('active');
    $('#epu-hotspot-info').textContent = '생산 → 처리 → 저장 → 운송: 이해를 돕기 위해 단순화한 에너지 흐름입니다.';
  });

  const gamePanels = { route: $('#game-route'), sonar: $('#game-sonar'), plant: $('#game-plant') };
  function switchGame(key) {
    if (key !== 'route' && route.active) { route.paused = true; $('#route-pause').textContent = '계속하기'; }
    if (key !== 'sonar' && sonar.active) { sonar.paused = true; $('#sonar-pause').textContent = '계속하기'; hideTargets(); }
    Object.entries(gamePanels).forEach(([name, panel]) => { panel.hidden = name !== key; });
    $$('[data-game-tab]').forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.gameTab === key)));
  }
  $$('[data-game-tab]').forEach((tab) => tab.addEventListener('click', () => switchGame(tab.dataset.gameTab)));
  $$('[data-focus-game]').forEach((link) => link.addEventListener('click', () => switchGame(link.dataset.focusGame)));

  const routeRocks = [[2, 0], [2, 1], [2, 2], [4, 1], [4, 2], [4, 3], [6, 2], [6, 3], [6, 4], [7, 1], [3, 4]];
  const route = { active: false, paused: false, time: 60, score: 0, x: 0, y: 0, timer: null };
  routeRocks.forEach(([x, y]) => {
    const rock = document.createElement('span');
    rock.className = 'route-rock';
    rock.textContent = '◆';
    rock.style.left = `${((x + .5) / 9) * 100}%`;
    rock.style.top = `${((y + .5) / 6) * 100}%`;
    $('#route-board').append(rock);
  });
  function drawRoute() {
    $('#route-ship').style.left = `${((route.x + .5) / 9) * 100}%`;
    $('#route-ship').style.top = `${((route.y + .5) / 6) * 100}%`;
    $('#route-time').textContent = route.time;
    $('#route-score').textContent = route.score;
  }
  function finishRoute(won) {
    clearInterval(route.timer);
    route.active = false;
    $('#route-pause').disabled = true;
    $('#route-vessel').disabled = false;
    $('#route-start').textContent = '다시 시작';
    $('#route-message').textContent = won
      ? `항구 도착! ${$('#route-vessel').value}으로 ${route.score}점을 얻었습니다. 상선은 화물의 특성에 맞춰 설계됩니다.`
      : `시간이 끝났습니다. 점수 ${route.score}점. 항로를 다시 살펴보고 재도전하세요.`;
    if (won) earn('route');
  }
  function startRoute() {
    clearInterval(route.timer);
    Object.assign(route, { active: true, paused: false, time: 60, score: 0, x: 0, y: 0 });
    $('#route-vessel').disabled = true;
    $('#route-pause').disabled = false;
    $('#route-pause').textContent = '일시정지';
    $('#route-start').textContent = '처음부터';
    $('#route-message').textContent = '방향키·WASD 또는 화면 버튼으로 암초를 피해 목적지로 가세요.';
    drawRoute();
    route.timer = setInterval(() => {
      if (route.paused || !route.active) return;
      route.time -= 1;
      drawRoute();
      if (route.time <= 0) finishRoute(false);
    }, 1000);
  }
  function moveRoute(dx, dy) {
    if (!route.active || route.paused) return;
    const x = route.x + dx;
    const y = route.y + dy;
    if (x < 0 || x > 8 || y < 0 || y > 5 || routeRocks.some(([rx, ry]) => rx === x && ry === y)) {
      route.score = Math.max(0, route.score - 5);
      $('#route-message').textContent = '암초 또는 항로 경계입니다! 점수 5점이 감점됩니다.';
    } else {
      route.x = x; route.y = y; route.score += 10;
      $('#route-message').textContent = '안전하게 이동했습니다. 목적지는 오른쪽 아래 항구입니다.';
      if (x === 8 && y === 5) { route.score += 100; drawRoute(); finishRoute(true); return; }
    }
    drawRoute();
  }
  $('#route-start').addEventListener('click', startRoute);
  $('#route-pause').addEventListener('click', () => {
    route.paused = !route.paused;
    $('#route-pause').textContent = route.paused ? '계속하기' : '일시정지';
    $('#route-message').textContent = route.paused ? '항해를 일시정지했습니다.' : '항해를 다시 시작했습니다.';
  });
  const directions = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  $$('[data-direction]').forEach((button) => button.addEventListener('click', () => moveRoute(...directions[button.dataset.direction])));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && window.parent !== window) {
      window.parent.postMessage({ type: 'ocean-experience-close' }, '*');
      return;
    }
    if (gamePanels.route.hidden || /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName || '')) return;
    const key = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' }[event.key];
    if (key && route.active && !route.paused) { event.preventDefault(); moveRoute(...directions[key]); }
  });
  drawRoute();

  const sonar = { active: false, paused: false, time: 45, score: 0, found: new Set(), timer: null, revealTimer: null };
  function hideTargets() { $$('.sonar-target').forEach((target) => target.classList.remove('revealed')); }
  function drawSonar() { $('#sonar-time').textContent = sonar.time; $('#sonar-score').textContent = sonar.score; }
  function finishSonar(won) {
    clearInterval(sonar.timer); clearTimeout(sonar.revealTimer);
    sonar.active = false; hideTargets();
    $('#sonar-scan').disabled = true; $('#sonar-pause').disabled = true;
    $('#sonar-start').textContent = '다시 시작';
    $('#sonar-message').textContent = won
      ? `탐색 성공! 3개 목표를 모두 찾았습니다. 점수 ${sonar.score}점. 소나는 음파의 반사를 이용해 주변을 탐지하는 일반 원리입니다.`
      : `시간이 끝났습니다. ${sonar.found.size}/3개를 찾았습니다. 다시 탐색해 보세요.`;
    if (won) earn('sonar');
  }
  function startSonar() {
    clearInterval(sonar.timer); clearTimeout(sonar.revealTimer);
    Object.assign(sonar, { active: true, paused: false, time: 45, score: 0, found: new Set() });
    $$('.sonar-target').forEach((target) => target.classList.remove('found', 'revealed'));
    $('#sonar-scan').disabled = false; $('#sonar-pause').disabled = false;
    $('#sonar-pause').textContent = '일시정지'; $('#sonar-start').textContent = '처음부터';
    $('#sonar-message').textContent = '소나 스캔을 눌러 잠깐 나타나는 목표를 선택하세요.';
    drawSonar();
    sonar.timer = setInterval(() => {
      if (sonar.paused || !sonar.active) return;
      sonar.time -= 1; drawSonar();
      if (sonar.time <= 0) finishSonar(false);
    }, 1000);
  }
  $('#sonar-start').addEventListener('click', startSonar);
  $('#sonar-scan').addEventListener('click', () => {
    if (!sonar.active || sonar.paused) return;
    const wave = $('#sonar-wave');
    wave.classList.remove('scanning'); void wave.offsetWidth; wave.classList.add('scanning');
    $$('.sonar-target:not(.found)').forEach((target) => target.classList.add('revealed'));
    clearTimeout(sonar.revealTimer);
    sonar.revealTimer = setTimeout(hideTargets, 2400);
    $('#sonar-message').textContent = '탐지 파동이 퍼집니다. 보이는 목표를 눌러보세요!';
  });
  $$('.sonar-target').forEach((target) => target.addEventListener('click', () => {
    if (!sonar.active || sonar.paused || !target.classList.contains('revealed') || target.classList.contains('found')) return;
    target.classList.add('found'); target.classList.remove('revealed');
    sonar.found.add(target.dataset.target); sonar.score += 100;
    drawSonar();
    $('#sonar-message').textContent = `${sonar.found.size}/3개 목표 발견!`;
    if (sonar.found.size === 3) finishSonar(true);
  }));
  $('#sonar-pause').addEventListener('click', () => {
    sonar.paused = !sonar.paused; hideTargets();
    $('#sonar-pause').textContent = sonar.paused ? '계속하기' : '일시정지';
    $('#sonar-message').textContent = sonar.paused ? '탐색을 일시정지했습니다.' : '다시 소나 스캔을 눌러 탐색하세요.';
  });

  const plant = { active: false, selected: null, placed: new Set(), score: 0 };
  const blockNames = { production: '생산설비', processing: '처리설비', storage: '저장설비', transport: '운송 연결설비' };
  function drawPlant() {
    $('#plant-progress').textContent = plant.placed.size * 25;
    $('#plant-score').textContent = plant.score;
  }
  function startPlant() {
    plant.active = true; plant.selected = null; plant.placed = new Set(); plant.score = 0;
    $('#plant-game-board').classList.remove('complete');
    $$('[data-slot]').forEach((slot) => { slot.classList.remove('correct', 'wrong'); slot.querySelector('span').textContent = `${blockNames[slot.dataset.slot]} 자리`; });
    $$('[data-block]').forEach((block) => { block.classList.remove('used', 'selected'); block.disabled = false; });
    $('#plant-message').textContent = '블록을 끌어 놓거나 블록을 선택한 뒤 알맞은 자리를 누르세요.';
    drawPlant();
  }
  function placeBlock(id, slot) {
    if (!plant.active || !id || plant.placed.has(id) || slot.classList.contains('correct')) return;
    if (slot.dataset.slot !== id) {
      plant.score = Math.max(0, plant.score - 5);
      slot.classList.add('wrong'); setTimeout(() => slot.classList.remove('wrong'), 600);
      $('#plant-message').textContent = '이 자리는 다른 설비의 자리입니다. 5점 감점!';
      drawPlant(); return;
    }
    plant.placed.add(id); plant.score += 100;
    slot.classList.add('correct'); slot.querySelector('span').textContent = `${blockNames[id]} ✓`;
    const block = $(`[data-block="${id}"]`);
    block.classList.remove('selected'); block.classList.add('used'); block.disabled = true;
    plant.selected = null; drawPlant();
    $('#plant-message').textContent = `${blockNames[id]} 배치 성공! ${plant.placed.size}/4개 완료.`;
    if (plant.placed.size === 4) {
      plant.active = false; $('#plant-game-board').classList.add('complete');
      $('#plant-message').textContent = `플랜트 완성! ${plant.score}점. 생산 → 처리 → 저장 → 운송 흐름을 완성했습니다. 교육용으로 단순화한 모델입니다.`;
      earn('plant');
    }
  }
  $('#plant-start').addEventListener('click', startPlant);
  $$('[data-block]').forEach((block) => {
    block.addEventListener('click', () => {
      if (!plant.active) return;
      plant.selected = block.dataset.block;
      $$('[data-block]').forEach((other) => other.classList.toggle('selected', other === block));
      $('#plant-message').textContent = `${block.textContent} 선택. 알맞은 자리를 누르세요.`;
    });
    block.addEventListener('dragstart', (event) => {
      if (!plant.active) { event.preventDefault(); return; }
      event.dataTransfer.setData('text/plain', block.dataset.block);
      event.dataTransfer.effectAllowed = 'move';
    });
  });
  $$('[data-slot]').forEach((slot) => {
    slot.addEventListener('click', () => placeBlock(plant.selected, slot));
    slot.addEventListener('dragover', (event) => { if (plant.active) event.preventDefault(); });
    slot.addEventListener('drop', (event) => {
      event.preventDefault();
      placeBlock(event.dataTransfer.getData('text/plain'), slot);
    });
  });
  drawPlant();

  const questions = [
    { category: '상선', key: 'commercial', q: 'LNG 운반선은 주로 무엇을 운송할까요?', options: ['액화천연가스', '자동차', '철광석'], answer: 0, explanation: 'LNG는 액화천연가스입니다.' },
    { category: '상선', key: 'commercial', q: 'VLCC가 주로 운송하는 화물은?', options: ['컨테이너', '원유', '담수'], answer: 1, explanation: 'VLCC는 초대형 원유운반선입니다.' },
    { category: '상선', key: 'commercial', q: '컨테이너선의 주요 역할은?', options: ['수중 탐색', '해상 발전', '표준화된 화물 운송'], answer: 2, explanation: '컨테이너선은 표준 컨테이너 화물을 운송합니다.' },
    { category: '특수선', key: 'naval', q: '바닷속에서 임무를 수행하는 함정은?', options: ['컨테이너선', '잠수함', '유조선'], answer: 1, explanation: '잠수함은 수중에서 항해하고 임무를 수행합니다.' },
    { category: '특수선', key: 'naval', q: 'MRO는 무엇과 가장 가까울까요?', options: ['유지·보수·정비', '컨테이너 적재', 'LNG 액화'], answer: 0, explanation: '함정 MRO는 운용 중인 함정의 유지·보수·정비를 뜻합니다.' },
    { category: '특수선', key: 'naval', q: '구축함은 주로 어디에서 운용하는 함정일까요?', options: ['땅속', '공중', '해상'], answer: 2, explanation: '구축함은 다양한 해상 임무를 수행하는 수상함입니다.' },
    { category: 'EPU', key: 'epu', q: 'FPSO의 대표 기능은?', options: ['컨테이너 운송', '해상 원유 생산·저장·하역', '여객 운송'], answer: 1, explanation: 'FPSO는 부유식 원유 생산·저장·하역 설비입니다.' },
    { category: 'EPU', key: 'epu', q: 'FLNG는 주로 무엇을 해상에서 처리하고 액화할까요?', options: ['천연가스', '자동차', '철광석'], answer: 0, explanation: 'FLNG는 천연가스 처리와 LNG 생산·저장에 쓰이는 부유식 설비입니다.' },
    { category: 'EPU', key: 'epu', q: '해상풍력은 무엇의 운동에너지를 이용할까요?', options: ['조수', '바람', '선박 엔진'], answer: 1, explanation: '해상풍력 터빈은 바람의 운동에너지를 전기로 바꿉니다.' },
  ];
  const quiz = { active: false, index: 0, score: 0, by: { commercial: 0, naval: 0, epu: 0 }, answered: false };
  function renderQuestion() {
    const question = questions[quiz.index]; quiz.answered = false;
    $('#quiz-category').textContent = question.category.toUpperCase();
    $('#quiz-counter').textContent = `${quiz.index + 1} / ${questions.length}`;
    $('#quiz-progress-bar').style.width = `${(quiz.index / questions.length) * 100}%`;
    $('#quiz-question').textContent = question.q;
    $('#quiz-feedback').textContent = '';
    $('#quiz-next').hidden = true;
    const options = question.options.map((option, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
      button.addEventListener('click', () => answerQuestion(index));
      return button;
    });
    $('#quiz-options').replaceChildren(...options);
  }
  function answerQuestion(choice) {
    if (!quiz.active || quiz.answered) return;
    quiz.answered = true;
    const question = questions[quiz.index];
    if (choice === question.answer) { quiz.score++; quiz.by[question.key]++; }
    $$('#quiz-options button').forEach((button, index) => {
      button.disabled = true;
      button.classList.toggle('correct', index === question.answer);
      button.classList.toggle('wrong', index === choice && choice !== question.answer);
    });
    $('#quiz-feedback').textContent = `${choice === question.answer ? '정답입니다!' : '아쉬워요.'} ${question.explanation}`;
    $('#quiz-next').textContent = quiz.index === questions.length - 1 ? '결과 보기 →' : '다음 문제 →';
    $('#quiz-next').hidden = false;
    $('#quiz-progress-bar').style.width = `${((quiz.index + 1) / questions.length) * 100}%`;
  }
  function finishQuiz() {
    quiz.active = false;
    $('#quiz-category').textContent = 'RESULT'; $('#quiz-counter').textContent = '9 / 9';
    $('#quiz-question').textContent = `${quiz.score} / 9문제 정답 · ${quiz.score * 10}점`;
    $('#quiz-options').replaceChildren();
    $('#quiz-feedback').textContent = `상선 ${quiz.by.commercial}/3 · 특수선 ${quiz.by.naval}/3 · EPU ${quiz.by.epu}/3. 다시 풀면서 새로운 내용을 확인해 보세요.`;
    $('#quiz-next').hidden = true; $('#quiz-start').hidden = false;
    $('#quiz-start').textContent = '퀴즈 다시 풀기';
    earn('quiz');
  }
  $('#quiz-start').addEventListener('click', () => {
    Object.assign(quiz, { active: true, index: 0, score: 0, by: { commercial: 0, naval: 0, epu: 0 }, answered: false });
    $('#quiz-start').hidden = true; renderQuestion();
  });
  $('#quiz-next').addEventListener('click', () => {
    if (!quiz.answered) return;
    quiz.index++;
    if (quiz.index >= questions.length) finishQuiz(); else renderQuestion();
  });

  let audio = null;
  $('#sound-toggle').addEventListener('click', async () => {
    const button = $('#sound-toggle');
    if (audio) {
      await audio.context.close(); audio = null;
      button.setAttribute('aria-pressed', 'false'); button.querySelector('span').textContent = '사운드 OFF';
      button.title = '파도 소리 켜기'; return;
    }
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) { button.disabled = true; button.title = '이 브라우저는 사운드를 지원하지 않습니다'; return; }
    try {
      const context = new Context();
      const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
      const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 320;
      const gain = context.createGain(); gain.gain.value = .025;
      const lfo = context.createOscillator(); lfo.frequency.value = .18;
      const depth = context.createGain(); depth.gain.value = .018;
      source.connect(filter).connect(gain).connect(context.destination);
      lfo.connect(depth).connect(gain.gain);
      source.start(); lfo.start(); audio = { context };
      button.setAttribute('aria-pressed', 'true'); button.querySelector('span').textContent = '사운드 ON';
      button.title = '파도 소리 끄기';
    } catch { button.disabled = true; button.title = '사운드를 시작할 수 없습니다'; }
  });
  $('#close-experience').addEventListener('click', () => {
    if (window.parent !== window) window.parent.postMessage({ type: 'ocean-experience-close' }, '*');
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  if (window.parent === window) { $('#close-experience').textContent = '맨 위로 ↑'; $('#close-experience').title = '맨 위로'; }
  window.addEventListener('pagehide', () => { clearInterval(route.timer); clearInterval(sonar.timer); clearTimeout(sonar.revealTimer); audio?.context.close(); });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: .08 });
    $$('.reveal').forEach((element) => observer.observe(element));
  } else { $$('.reveal').forEach((element) => element.classList.add('visible')); }
})();
