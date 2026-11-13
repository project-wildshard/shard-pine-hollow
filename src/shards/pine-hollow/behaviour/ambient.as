import { Signal, Field, Channel, Read, Do } from './generated/pineAmbient';
@inline function get(field:i32):f64 { return Read.field(0,field); }
// SERVER-PARITY SS11: the page's ambient rules (scavenger arrival, carcass sites, the guide bird), a view row (pine.ambient): it emits
// channels only, which the page shows. The rules the server also runs stay in life.as (the sim row pine.life).
@inline export function onSignal(signal:i32,value:f64,source:i32):void {
  if(signal==Signal.arrival) {
    const draw=Math.max(0,Math.min(1,get(Field.draw)));
    Do.channel(Channel.arrival,get(Field.now)+(get(Field.minimum)+draw*(get(Field.maximum)-get(Field.minimum)))*get(Field.scale));
  } else if(signal==Signal.carcass) {
    if(get(Field.present)==0) {Do.channel(Channel.remove,1);return;}
    const site=get(Field.site),now=get(Field.now),harvest=get(Field.harvest);
    if(site==-1&&now>=get(Field.arrival))Do.channel(Channel.gather,get(Field.distance)>get(Field.reach)?-2:1);
    const left=site==-2||(site>=0&&get(Field.visit)==3);
    if(harvest>=0) {
      Do.channel(Channel.dim,1);
      if(left||now-harvest>get(Field.giveUp)){Do.channel(Channel.fade,1);Do.channel(Channel.remove,1);}
    } else if(left&&now-get(Field.kill)>900)Do.channel(Channel.remove,1);
  } else if(signal==Signal.guide) {
    Do.channel(Channel.eligible,get(Field.night)<.5&&get(Field.combat)==0?1:0);
  }
}
