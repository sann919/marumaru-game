// 通常3ステージごとにボスを挿入。挑戦する言葉は直前に遊んだ3語です。
function buildJourney(areas,words,bosses){
  const route=[];
  for(const area of areas.filter(a=>a.enabled)){
    const played=[];
    area.normalStageIds.forEach((id,i)=>{
      const word=words.find(w=>w.id===id);if(!word){route.push({id,type:'invalid',areaId:area.id});return;}
      route.push({...word,type:'normal',areaId:area.id,background:area.background||word.background});played.push(id);
      if((i+1)%3===0){
        const bossId=area.bossIds[Math.floor(i/3)];const boss=bosses.find(b=>b.id===bossId);
        if(!boss||boss.areaId!==area.id){route.push({id:bossId,type:'invalid',areaId:area.id});return;}
        route.push({id:area.id+'-boss-'+Math.floor(i/3),type:'boss',areaId:area.id,bossId,challengeIds:played.slice(-Math.min(boss.challengeCount||3,played.length))});
      }
    });
  }
  return route;
}
const STAGES=buildJourney(AREAS,WORD_STAGES,BOSSES);
