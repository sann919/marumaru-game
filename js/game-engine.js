// All entry points share recovery and state guards; invalid content never silently skips a stage.
function safely(action){try{return action();}catch(error){showRecovery();return false;}}
function stopSpeech(){try{window.speechSynthesis?.cancel();}catch{}}
function showRecovery(){
 timers.forEach(clearTimeout);timers.clear();guideTimer=null;stopSpeech();phase='error';
 let panel=document.getElementById('gameRecovery');
 if(!panel){panel=document.createElement('section');panel.id='gameRecovery';panel.className='recovery-panel';
  const text=document.createElement('p');text.textContent='うまく よみこめなかったよ。もういちど あそぼう！';
  const button=document.createElement('button');button.textContent='はじめから あそぶ';button.type='button';
  button.addEventListener('click',()=>{panel.hidden=true;loadStage(0);});panel.appendChild(text);panel.appendChild(button);
  (document.getElementById('game')||document.body).appendChild(panel);
 }
 panel.hidden=false;
}
function bookIsOpen(){return !!$('cardBook')?.open;}
function setPhase(value){
 phase=value;const game=$('game');if(!game)return;
 game.setAttribute('data-phase',value);
 $('monsterLayer')?.setAttribute('aria-hidden',value==='playing'?'false':'true');
 if($('monsterLayer'))$('monsterLayer').inert=value!=='playing';
 if($('repeatGuide'))$('repeatGuide').disabled=value!=='playing';
 if($('nextStage'))$('nextStage').disabled=!['complete','questionComplete'].includes(value);
 if($('fromStart'))$('fromStart').disabled=value!=='complete';
 if($('again'))$('again').disabled=!['complete','questionComplete'].includes(value);
 if($('bossContinue'))$('bossContinue').disabled=value!=='bossComplete';
 if($('bossStart'))$('bossStart').disabled=value!=='bossIntro';
 if($('skipFriend'))$('skipFriend').disabled=value!=='befriending';
 if($('restart'))$('restart').disabled=['celebrating','befriending','bossComplete'].includes(value);
 if($('openBook'))$('openBook').disabled=['celebrating','befriending'].includes(value);
}
function loadStage(index,announce=true){
 if(!Number.isInteger(index)||index<0||index>=STAGES.length)return false;
 return safely(()=>{loadStageUnsafe(index,announce);setPhase(phase);return true;});
}
function closeBook(){
 const book=$('cardBook');if(!book)return;
 if(typeof book.close==='function')book.close();else{book.open=false;book.removeAttribute('open');}
 if($('game'))$('game').inert=false;
 if(phase==='playing')guide((step===0?'まずは、':'つぎは、')+answer[step]+'を みつけよう！',150);
}
function repeatCurrentGuide(){if(phase!=='playing'||bookIsOpen())return;cancelGuide();say((step===0?'まずは、':'つぎは、')+answer[step]+'を みつけよう！');}
function bind(id,action){$(id)?.addEventListener('click',()=>safely(action));}
function initGame(){
 bind('bossStart',beginBoss);bind('openBook',openBook);bind('bossBook',openBook);
 bind('bookClose',closeBook);bind('bookBack',()=>{renderBook();$('cardDetail').hidden=true;$('bookList').hidden=false;$('bookBack').hidden=true;});
 bind('bossContinue',()=>{if(!bookIsOpen()&&phase==='bossComplete')loadStage(stageIndex<STAGES.length-1?stageIndex+1:0);});
 bind('restart',()=>{if(!bookIsOpen()&&!['celebrating','befriending','bossComplete'].includes(phase))restart();});
 bind('again',()=>{if(!bookIsOpen()&&['complete','questionComplete'].includes(phase))restart();});
 bind('nextStage',nextStage);bind('fromStart',()=>{if(!bookIsOpen()&&phase==='complete')loadStage(0);});
 bind('repeatGuide',repeatCurrentGuide);bind('skipFriend',completeFriendship);
 $('cardBook')?.addEventListener('close',()=>{if($('game'))$('game').inert=false;});
 // Broken images are replaced locally without changing the saved card record.
 document.addEventListener?.('error',event=>{const img=event.target;if(img?.tagName?.toLowerCase()!=='img'||img.dataset?.fallback)return;img.dataset.fallback='true';img.src=FALLBACK_IMAGE;},true);
 if(loadStage(0,false))guide('まずは、'+answer[0]+'を みつけよう！',700);
}
const FALLBACK_IMAGE='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" rx="40" fill="#ffe4af"/><text x="80" y="110" text-anchor="middle" font-size="90">★</text></svg>');


const $ = id => document.getElementById(id);
let stageIndex=0,step=0,phase='playing',audioCtx=null,guideTimer=null;
let answer=[],monsters=[];
const timers=new Set(),activeSounds=new Set();let generation=0;
function later(fn,delay){const version=generation;const id=setTimeout(()=>{timers.delete(id);if(version===generation)safely(fn);},delay);timers.add(id);return id;}
function cancelGuide(){if(guideTimer!==null){clearTimeout(guideTimer);timers.delete(guideTimer);guideTimer=null;}}
function guide(text,delay){cancelGuide();guideTimer=later(()=>{guideTimer=null;say(text);},delay);}
function say(text){if(!text||bookIsOpen())return;try{stopSpeech();if('speechSynthesis' in window&&typeof SpeechSynthesisUtterance==='function'){const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.84;window.speechSynthesis.speak(u);}}catch{}}
function beep(ok){try{audioCtx ||=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=ok?730:240;g.gain.setValueAtTime(.07,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.18);activeSounds.add(o);o.onended=()=>activeSounds.delete(o);o.start();o.stop(audioCtx.currentTime+.18);}catch(e){}}
function cleanup(){
  generation++;timers.forEach(clearTimeout);timers.clear();guideTimer=null;activeSounds.forEach(o=>{try{o.stop();o.disconnect();}catch{}});activeSounds.clear();
  stopSpeech();
  document.querySelectorAll('.toast,.sparkle').forEach(el=>el.remove());
  if($('game').getAnimations)$('game').getAnimations({subtree:true}).forEach(a=>a.cancel());
  $('friendScene').hidden=true;$('friendScene').classList.remove('glowing','happy','forming');$('message').classList.remove('show','revealed','ready');$('bossWin').classList.remove('arrived');
}
function renderPrize(host,prize,name){
  host.replaceChildren();
  if(prize.image){const img=document.createElement('img');img.src=prize.image;img.alt=prize.alt||name;host.appendChild(img);}
  else host.textContent=prize.emoji;
  host.setAttribute('aria-label',prize.alt||name);
}
function validateStage(stage){
  const available=stage.monsters.map(m=>m.char);
  for(const char of Array.from(stage.answer)){
    const i=available.indexOf(char);if(i<0)throw new Error(stage.id+': 答えの「'+char+'」に対応するモンスターが足りません');available.splice(i,1);
  }
  if(!stage.answer||!(stage.completion.emoji||stage.completion.image))throw new Error('ステージ設定を確認してください');
}
function renderWord(stage,index,announce=true){
  if(index<0||index>=STAGES.length)return;
  validateStage(stage);stage={...stage,background:stage.background?.image?stage.background:(BACKGROUNDS[stage.areaId]||BACKGROUNDS.jungle)};cleanup();stageIndex=index;step=0;setPhase('playing');
  answer=Array.from(stage.answer);
  $('bg').style.backgroundImage='url('+JSON.stringify(stage.background.image)+')';
  $('bg').style.filter=stage.background.filter||'none';
  $('stageNumber').textContent='ステージ '+(index+1)+' / '+STAGES.length;
  $('stageName').textContent=stage.displayName+'をつくろう！';
  renderPrize($('stagePrize'),stage.completion,stage.displayName);
  renderPrize($('rewardIce'),stage.completion,stage.displayName);
  $('resultWord').textContent=answer.join('・')+'！';
  $('resultDetail').textContent='できあがり！';
  $('message').setAttribute('aria-label',stage.displayName+'のできあがり');
  $('steps').replaceChildren();$('fusionLetters').replaceChildren();
  answer.forEach((char,i)=>{
    const slot=document.createElement('div');slot.className='step';slot.id='step'+i;slot.textContent=char;$('steps').appendChild(slot);
    const letter=document.createElement('span');letter.className='fusion-letter';letter.id='fusion'+i;letter.textContent=char;letter.setAttribute('aria-hidden','true');$('fusionLetters').appendChild(letter);
  });
  $('monsterLayer').replaceChildren();
  monsters=stage.monsters.map((spec,i)=>{
    const m={...spec,id:'monster-'+i};const el=document.createElement('button');el.type='button';el.id=m.id;el.className='mon letter-mon';el.setAttribute('aria-label',m.char+' モンスター');
    el.style.left=m.x+'%';el.style.top=m.y+'%';el.style.width=(m.width||16)+'%';if(m.height)el.style.height=m.height+'%';
    const art=document.createElement('span');art.className='monster-art';
    drawMonster(art,m.char);
    el.appendChild(art);el.addEventListener('click',()=>pick(m));$('monsterLayer').appendChild(el);return m;
  });
  renderFoliage(stage);$('nextStage').textContent='つぎのステージ ▶';$('nextStage').hidden=index===STAGES.length-1;$('fromStart').hidden=index!==STAGES.length-1;
  updateUI();if(announce)say('ステージ'+(index+1)+'。'+stage.displayName+'をつくろう！ まずは、'+answer[0]+'を みつけよう！');
}
function updateUI(){
  $('instruction').classList.toggle('complete',step>=answer.length);
  $('targetWord').textContent=step<answer.length?'「'+answer[step]+'」':'やったね！';
  $('guideLead').textContent=step===0?'まずは':step<answer.length?'つぎは':'';
  $('guideEnd').textContent=step<answer.length?'をみつけよう！':'';
  answer.forEach((char,i)=>$('step'+i).classList.toggle('done',i<step));
}
function toast(text){const el=document.createElement('div');el.className='toast';el.textContent=text;$('game').appendChild(el);later(()=>el.remove(),900);}
function sparkleAround(el){const gr=$('game').getBoundingClientRect(),r=el.getBoundingClientRect();['✨','⭐','✨','✦','✨','⭐'].forEach((mark,i)=>{const s=document.createElement('div');s.className='sparkle';s.textContent=mark;s.style.left=(r.left-gr.left+r.width/2)+'px';s.style.top=(r.top-gr.top+r.height/2)+'px';s.style.setProperty('--dx',(Math.cos(i*Math.PI/3)*60)+'px');s.style.setProperty('--dy',(Math.sin(i*Math.PI/3)*60-18)+'px');$('game').appendChild(s);later(()=>s.remove(),760);});}
function captureMonster(m){const el=$(m.id);el.disabled=true;el.classList.add('catching');sparkleAround(el);later(()=>{el.classList.remove('catching');el.classList.add('found');},500);}
function pick(m){
  if(!m||bookIsOpen())return;const el=$(m.id);if(phase!=='playing'||!el||el.disabled||!monsters.includes(m))return;
  cancelGuide();
  if(m.char===answer[step]){beep(true);captureMonster(m);toast('みつけた！ '+m.char+'！');step++;updateUI();
    if(step===answer.length){setPhase('celebrating');monsters.forEach(mon=>$(mon.id).disabled=true);later(celebrate,520);}
    else guide('つぎは、'+answer[step]+'を みつけよう！',220);
  }else{beep(false);toast('ちがうよ。「'+answer[step]+'」を さがそう！');guide(answer[step]+'を みつけよう！',220);if(el.animate)el.animate([{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:250});}
}
function celebrate(){
  if(phase!=='celebrating')return;
  document.querySelectorAll('.toast,.sparkle').forEach(el=>el.remove());const box=$('game').getBoundingClientRect();
  answer.forEach((char,i)=>{const r=$('step'+i).getBoundingClientRect(),letter=$('fusion'+i),offset=i-(answer.length-1)/2;
    letter.style.setProperty('--from-x',(r.left+r.width/2-box.left-box.width*.5)+'px');letter.style.setProperty('--from-y',(r.top+r.height/2-box.top-box.height*.46)+'px');
    letter.style.setProperty('--orbit-x',(offset*box.width*Math.min(.2,.65/answer.length))+'px');letter.style.setProperty('--orbit-y',(-box.height*(Math.abs(offset)<.1?.2:.02))+'px');letter.style.setProperty('--tilt',(offset*18)+'deg');
  });
  $('message').classList.add('show');say(answer.join('、')+'！');
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  later(()=>{$('message').classList.add('revealed');beep(true);},reduced?150:1700);
  later(finishWord,reduced?350:2700);
}
function restart(){loadStage(stageIndex);}

// 獲得記録だけを保存。ゲームをやりなおしてもカードは消えません。
const CARD_SAVE_KEY='aiueo-monsters.cards.v1';
let cardRecords={},saveNotice='';
try{
  const raw=window.localStorage.getItem(CARD_SAVE_KEY);
  if(raw){const saved=JSON.parse(raw);if(saved.version!==1||!saved.cards||typeof saved.cards!=='object')throw new Error('Invalid save');
    CARD_DEFINITIONS.forEach(card=>{const record=saved.cards[card.id];if(record&&record.acquired===true&&record.acquiredArea===card.areaId)cardRecords[card.id]={acquired:true,acquiredArea:record.acquiredArea,acquiredAt:typeof record.acquiredAt==='string'?record.acquiredAt:''};});
  }
}catch(e){saveNotice='カードの保存を読み込めませんでした。いまのゲームではカードを集められます。';}
function getCard(id){const definition=CARD_DEFINITIONS.find(card=>card.id===id);if(!definition)throw new Error('Unknown card: '+id);return {...definition,...cardRecords[id]};}
function awardCard(id,areaId){
  const card=getCard(id);if(card.areaId!==areaId)throw new Error('Card area mismatch');
  const isNew=!card.acquired;
  if(isNew)cardRecords[id]={acquired:true,acquiredArea:areaId,acquiredAt:new Date().toISOString()};
  try{window.localStorage.setItem(CARD_SAVE_KEY,JSON.stringify({version:1,cards:cardRecords}));saveNotice='';}
  catch(e){saveNotice='このブラウザーでは保存できません。カードはこの画面を開いている間だけ残ります。';}
  return isNew;
}
function areaName(id){return AREAS.find(a=>a.id===id)?.name||id;}
function bossForStage(){return BOSSES.find(b=>b.id===STAGES[stageIndex].bossId);}
function isBossStage(){return STAGES[stageIndex]?.type==='boss';}
let bossQuestion=0,bossQuestions=[];
function melody(kind){
  const notes=kind==='friend'?[523,659,784,1047]:[392,523,659];
  notes.forEach((hz,i)=>later(()=>{try{audioCtx ||=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=hz;o.connect(g);g.connect(audioCtx.destination);g.gain.setValueAtTime(.065,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.3);activeSounds.add(o);o.onended=()=>activeSounds.delete(o);o.start();o.stop(audioCtx.currentTime+.3);}catch(e){}},i*160));
}
function loadStageUnsafe(index,announce=true){
  if(index<0||index>=STAGES.length)return;
  const target=STAGES[index];if(!target||target.type==='invalid')throw Error('Invalid stage');
  if(target.type==='boss'&&(!BOSSES.some(b=>b.id===target.bossId)||!target.challengeIds?.length||target.challengeIds.some(id=>!WORD_STAGES.some(w=>w.id===id))))throw Error('Invalid boss');
  stageIndex=index;bossQuestion=0;
  const stage=STAGES[index];$('areaName').textContent=areaName(stage.areaId);
  $('game').classList.toggle('boss-mode',stage.type==='boss');$('game').setAttribute('data-area',stage.areaId);$('game').style.setProperty('--area-dark',(BACKGROUNDS[stage.areaId]||BACKGROUNDS.jungle).color);
  $('bossIntro').hidden=true;$('bossWin').hidden=true;$('bossHud').hidden=stage.type!=='boss';
  if(stage.type==='boss'){
    const boss=bossForStage();boss.image ||= FALLBACK_IMAGE;boss.friendImage ||= boss.image;bossQuestions=stage.challengeIds.map(id=>WORD_STAGES.find(w=>w.id===id));
    renderBossQuestion(false);setPhase('bossIntro');
    $('bossIntroName').textContent=boss.name;$('bossIntroText').textContent=boss.introduction;
    $('bossIntroImage').src=boss.image;$('bossIntroImage').alt=boss.name;
    $('bossPortrait').src=boss.image;$('bossPortrait').alt=boss.name;
    $('bossIntro').hidden=false;
    if(announce)say(boss.name+'が あらわれた！ ことばを つくって、なかよく なろう！');
  }else{bossQuestions=[];renderWord(stage,index,announce);}
}
function renderBossQuestion(announce=true){
  const boss=bossForStage(),word=bossQuestions[bossQuestion];
  // ボスを中央に置くため、文字モンスターを周囲に配置します。
  const stage={...word,background:boss.background};
  renderWord(stage,stageIndex,false);
  $('stageNumber').textContent='ボスステージ '+(bossQuestion+1)+' / '+bossQuestions.length;
  $('nextStage').hidden=false;$('nextStage').textContent='つぎのことば ▶';$('fromStart').hidden=true;
  if(announce)say((bossQuestion+1)+'もんめ。'+word.displayName+'をつくろう！ まずは、'+answer[0]+'を みつけよう！');
}
function beginBoss(){if(phase!=='bossIntro')return;$('bossIntro').hidden=true;setPhase('playing');melody('intro');say('ことばで なかよく なろう！ '+bossQuestions[0].displayName+'をつくろう！ まずは、'+answer[0]+'を みつけよう！');}
function finishWord(){
  if(phase!=='celebrating')return;
  if(isBossStage()){
    if(bossQuestion===bossQuestions.length-1){finishBoss();return;}
    setPhase('questionComplete');$('message').classList.add('ready');$('resultDetail').textContent='なかよしパワーが ふえたよ！';say('できあがり！ なかよしパワーが ふえたよ！');
  }else{setPhase('complete');$('message').classList.add('ready');$('resultDetail').textContent='できあがり！';say('できあがり！');}
}
function nextStage(){
  if(bookIsOpen())return;
  if(isBossStage()&&phase==='questionComplete'&&bossQuestion<bossQuestions.length-1){bossQuestion++;renderBossQuestion();return;}
  if(phase==='complete'&&stageIndex<STAGES.length-1)loadStage(stageIndex+1);
}
function showBossCard(){
  if(phase!=='befriending')return;
  cleanup();setPhase('bossComplete');const boss=bossForStage(),fresh=awardCard(boss.cardId,STAGES[stageIndex].areaId),card=getCard(boss.cardId);
  $('bossWinImage').src=boss.friendImage||boss.image;$('bossWinImage').alt=boss.name+'が なかまになった';
  $('bossFriendName').textContent=boss.name+'が なかまになった！';
  $('bossCardNotice').textContent=fresh?'ボスカードをゲット！':'このカードは 登録済み！';
  $('bossCardName').textContent=card.name;
  $('bossDuplicate').textContent=fresh?'ずかんに あたらしい なかま！':'このカードは ずかんに とうろくずみだよ';
  $('bossSaveStatus').textContent=saveNotice;
  $('bossContinue').textContent=stageIndex<STAGES.length-1?'つぎのエリアへ ▶':'はじめから あそぶ';
  $('bossWin').hidden=false;$('bossWin').classList.add('arrived');melody('friend');
  say('ボスクリア！ '+boss.name+'が なかまになった！ ボスカードをゲット！');
}
function openBook(){
  if(['celebrating','befriending'].includes(phase))return;cancelGuide();stopSpeech();
  renderBook();$('cardDetail').hidden=true;$('bookList').hidden=false;$('bookBack').hidden=true;
  const book=$('cardBook');if(!book.open){if(typeof book.showModal==='function')book.showModal();else{book.setAttribute('open','');book.open=true;}}$('game').inert=true;
}
function renderBook(){
  $('bookCards').replaceChildren();let acquired=0;
  CARD_DEFINITIONS.forEach(def=>{
    const card=getCard(def.id);if(card.acquired)acquired++;
    const button=document.createElement('button');button.type='button';button.className='collection-card'+(card.acquired?' acquired':' locked');
    button.setAttribute('aria-label',card.acquired?card.name+'：'+card.bossName:'未獲得のカード：'+areaName(card.areaId));
    const art=document.createElement('img');art.src=card.image;art.alt=card.acquired?card.bossName:'未獲得のシルエット';
    const name=document.createElement('strong');name.textContent=card.acquired?card.name:'？？？';
    const area=document.createElement('span');area.textContent=areaName(card.acquired?card.acquiredArea:card.areaId);
    const status=document.createElement('small');status.textContent=card.acquired?'★ なかまになった！':'まだ であっていないよ';
    button.appendChild(art);button.appendChild(name);button.appendChild(area);button.appendChild(status);button.addEventListener('click',()=>showCard(card.id));$('bookCards').appendChild(button);
  });
  $('bookCount').textContent=acquired+' / '+CARD_DEFINITIONS.length+' まい';$('bookSaveStatus').textContent=saveNotice;
}
function showCard(id){
  if(!CARD_DEFINITIONS.some(c=>c.id===id))return;const card=getCard(id),boss=BOSSES.find(b=>b.id===card.bossId);
  $('bookList').hidden=true;$('cardDetail').hidden=false;$('bookBack').hidden=false;
  $('detailImage').src=card.image;$('detailImage').alt=card.acquired?card.bossName:'未獲得のシルエット';$('detailImage').classList.toggle('silhouette',!card.acquired);
  $('detailTitle').textContent=card.acquired?card.name:'？？？';$('detailBoss').textContent=card.acquired?card.bossName:'まだ であっていない なかま';
  $('detailArea').textContent=(card.acquired?'であった ばしょ：':'すんでいる ばしょ：')+areaName(card.acquired?card.acquiredArea:card.areaId);
  $('detailDescription').textContent=card.acquired?(boss?.description||'ことばで なかまに なったよ！'):'ことばを あつめて、このエリアの ボスと なかよく なろう！';
  $('bookBack').focus();
}
function validateContent(){
  WORD_STAGES.forEach(stage=>{validateStage(stage);if(stage.answer.length<2||stage.answer.length>4||stage.monsters.length!==5)throw Error('Invalid stage size');stage.monsters.forEach(m=>monsterDesign(m.char));});
  for(const boss of BOSSES){if(!AREAS.some(a=>a.id===boss.areaId)||!CARD_DEFINITIONS.some(c=>c.id===boss.cardId&&c.bossId===boss.id&&c.areaId===boss.areaId))throw new Error('Boss/card configuration mismatch');}
}
function finishBoss(){
  if(phase!=='celebrating'||!isBossStage()||bossQuestion!==bossQuestions.length-1)return;
  cleanup();setPhase('befriending');const boss=bossForStage();
  const scene=$('friendScene');scene.classList.remove('glowing','happy','forming');
  $('friendBefore').src=boss.image;$('friendBefore').alt=boss.name;
  $('friendAfter').src=boss.friendImage||boss.image;$('friendAfter').alt='えがおの '+boss.name;
  $('friendCardLabel').textContent=getCard(boss.cardId).name;
  $('friendCaption').textContent='ことばの ちからが あつまる…';
  $('orbitWords').replaceChildren();
  bossQuestions.forEach((word,i)=>{const label=document.createElement('span');label.className='orbit-word';label.textContent=word.answer;label.style.setProperty('--angle',(i*360/bossQuestions.length)+'deg');$('orbitWords').appendChild(label);});
  scene.hidden=false;$('skipFriend').focus();say('ことばの ちからで、なかよく なろう！');melody('intro');
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  later(()=>{scene.classList.add('glowing');$('friendCaption').textContent='ことばが こころに とどいた！';melody('friend');},reduced?100:2400);
  later(()=>{scene.classList.add('happy');$('friendCaption').textContent=boss.name+'が えがおに！';say('なかまになって くれて、ありがとう！');},reduced?200:3300);
  later(()=>{scene.classList.add('forming');$('friendCaption').textContent='なかまの カードに！';},reduced?300:4400);
  later(completeFriendship,reduced?650:5500);
}
function completeFriendship(){if(phase!=='befriending')return;$('friendScene').hidden=true;showBossCard();}

function monsterDesign(char){
 const base=String(char||'').normalize('NFD')[0];
 const design=MONSTER_DEFINITIONS[base];return design||null;
}
function drawMonster(art,char){
 const d=monsterDesign(char);if(!d||!ASSETS[d.sheet]){const label=document.createElement('span');label.className='fallback-monster';label.textContent=char;art.appendChild(label);return;}const [x,y,w,h]=d.rect,[bx,by,diameter]=d.badge;
 const scale=90/Math.max(w,h),pw=w*scale,ph=h*scale,left=(100-pw)/2,top=90-ph;
 const sprite=document.createElement('span');sprite.className='atlas-sprite';
 sprite.style.left=left+'%';sprite.style.top=top+'%';sprite.style.width=pw+'%';sprite.style.height=ph+'%';
 sprite.style.backgroundImage='url('+JSON.stringify(ASSETS[d.sheet])+')';
 sprite.style.backgroundSize=(1254/w*100)+'% '+(1254/h*100)+'%';
 sprite.style.backgroundPosition=(x/(1254-w)*100)+'% '+(y/(1254-h)*100)+'%';art.appendChild(sprite);
 const label=document.createElement('span');label.className='monster-letter';label.textContent=char;
 label.style.left=(left+pw*bx)+'%';label.style.top=(top+ph*by)+'%';
 label.style.fontSize=Math.min(28,Math.min(pw,ph)*diameter*.83)+'cqw';art.appendChild(label);
}
function renderFoliage(stage){
 $('foliageLayer').replaceChildren();
 stage.monsters.forEach(m=>{
  const width=m.width||16,height=width*1.5,left=m.x-1,right=m.x+width+1,y=m.y+height*.94,bottom=m.y+height+1;
  const cover=document.createElement('div');cover.className='foliage-cover';
  cover.style.backgroundImage='url('+JSON.stringify(stage.background.image)+')';cover.style.filter=stage.background.filter||'none';
  cover.style.clipPath=`polygon(${left}% ${y}%,${left+width*.2}% ${y-.4}%,${left+width*.45}% ${y+.3}%,${left+width*.7}% ${y-.3}%,${right}% ${y}%,${right}% ${bottom}%,${left}% ${bottom}%)`;
  $('foliageLayer').appendChild(cover);
 });
}


initGame();
