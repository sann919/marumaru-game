
// 背景・隠れ場所はエリア単位で管理します。座標は画面に対する百分率です。
const BACKGROUNDS = {
 jungle:{image:ASSETS.jungle,filter:'none',color:'#173e28',spots:[[8,39,15,'木'],[30,33,15,'岩'],[73,24,16,'草むら'],[26,57,16,'遺跡'],[72,56,16,'切り株']]},
 ocean:{image:ASSETS.oceanBG,filter:'none',color:'#123b53',spots:[[8,40,15,'サンゴ'],[30,34,15,'岩'],[73,29,16,'海草'],[26,57,16,'貝'],[72,56,16,'沈没船']]},
 snow:{image:ASSETS.snowBG,filter:'none',color:'#253d60',spots:[[8,39,15,'雪の木'],[30,36,15,'氷'],[73,29,16,'洞窟'],[26,57,16,'雪だるま'],[72,56,16,'雪の岩']]}
};
const AREAS = [
 {id:'jungle',name:'ジャングルエリア',enabled:true,background:BACKGROUNDS.jungle,normalStageIds:['ice','bear','cat'],bossIds:['jungle-gorilla']},
 {id:'ocean',name:'海エリア',enabled:true,background:BACKGROUNDS.ocean,normalStageIds:['fish','crab','octopus'],bossIds:['ocean-king']},
 {id:'snow',name:'雪山エリア',enabled:true,background:BACKGROUNDS.snow,normalStageIds:['snow','sled','gloves'],bossIds:['snow-mammoth']}
];
const BOSSES = [
 {id:'jungle-gorilla',name:'ジャングルゴリラ',areaId:'jungle',image:ASSETS.gorilla,friendImage:ASSETS.gorillaHappy,cardId:'jungle-gorilla-card',challengeCount:3,introduction:'ことばが だいすきな もりの まもりやく。\n３つの ことばで なかよく なろう！',description:'おおきな からだと、やさしい こころ。もりの ともだちを まもってくれるよ。'},
 {id:'ocean-king',name:'うみの タコキング',areaId:'ocean',image:ASSETS.octopus,friendImage:ASSETS.octopusHappy,cardId:'ocean-king-card',challengeCount:3,introduction:'あそぶのが だいすきな うみの おうさま。\n３つの ことばで なかよく なろう！',description:'きらきらの おうかんが じまん。うみの なかまたちと、かくれんぼを するのが だいすき！'},
 {id:'snow-mammoth',name:'ゆきやま マンモス',areaId:'snow',image:ASSETS.mammoth,friendImage:ASSETS.mammothHappy,cardId:'snow-mammoth-card',challengeCount:3,introduction:'ゆきやまを みまもる おおきな ともだち。\n３つの ことばで なかよく なろう！',description:'ふわふわの けと、こおりの かざり。のんびり やさしく、こまった なかまを たすけてくれるよ。'}
].map(b=>({...b,background:{...BACKGROUNDS[b.areaId],filter:'saturate(1.08) brightness(.92)'}}));
const CARD_DEFINITIONS = BOSSES.map((b,i)=>({id:b.cardId,name:['もりの ともだち','うみの ともだち','ゆきの ともだち'][i],bossId:b.id,bossName:b.name,image:b.friendImage,areaId:b.areaId,acquired:false,acquiredArea:null}));
// ことばと出現文字だけを設定。描画や正誤判定は game-engine にあります。
const WORD_STAGES = [
 ['ice','あいす','🍦','jungle','あかいめす'],['bear','くま','🐻','jungle','まきくむも'],['cat','ねこ','🐱','jungle','ぬこめねの'],
 ['fish','さかな','🐟','ocean','なさちにか'],['crab','かに','🦀','ocean','くにけかこ'],['octopus','たこ','🐙','ocean','とこたつて'],
 ['snow','ゆき','❄️','snow','よきゆやけ'],['sled','そり','🛷','snow','りるそろれ'],['gloves','てぶくろ','🧤','snow','ろてくふぶ']
].map(([id,answer,emoji,areaId,chars])=>({id,answer,displayName:answer,completion:{emoji},areaId,background:BACKGROUNDS[areaId],monsters:Array.from(chars).map((char,i)=>{const [x,y,width,hideBehind]=BACKGROUNDS[areaId].spots[i];return {char,x,y,width,hideBehind};})}));

