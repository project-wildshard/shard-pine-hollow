import { lead } from './stag';
import { shelter } from './shelter';
import { Signal, Field, Channel, Read, Do } from './generated/pineLife';
@inline function get(field:i32):f64 { return Read.field(0,field); }
// The page owns objects and frame poses; this guest owns the forest's rules that the server also runs (the quest's lead,
// its hollow-log secret and the rain shelter). The page's ambient rules are ambient.as, a view row (SERVER-PARITY SS11).
@inline export function onSignal(signal:i32,value:f64,source:i32):void {
  if(signal==Signal.lead) { lead(); } else if(signal==Signal.secret) {
    const dx=get(Field.playerX)-get(Field.atX),dy=get(Field.floorY)-get(Field.atY),dz=get(Field.playerZ)-get(Field.atZ);
    Do.channel(Channel.accept,get(Field.taken)==0&&dx*dx+dy*dy+dz*dz<2.2*2.2&&Math.abs(get(Field.playerY)-get(Field.floorY))<.8?1:0);
  } else shelter(signal);
}
