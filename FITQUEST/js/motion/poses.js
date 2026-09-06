// Pure movement data and 3D joint calculations. Coordinates are in metres, Y up.
export const GUIDES = {
 'warmup-0': ['Quay tay + quay vai','circles','Vai thả lỏng','Giữ thân người ổn định','Không xoay tay quá nhanh','front'],
 'warmup-1': ['Vươn người trái/phải','lean','Nghiêng thân nhẹ sang bên','Thở đều khi vươn người','Không giật hoặc gập lưng','front'],
 'warmup-2': ['Chạy bước nhỏ tại chỗ','jog','Bước nhỏ và tiếp đất nhẹ','Đánh tay tự nhiên','Không dậm chân mạnh','side'],
 'warmup-3': ['Tách 2 chân + xoay đầu gối','knees','Biên độ nhỏ, gối thả lỏng','Bàn chân giữ ổn định','Không vặn ép khớp gối','front'],
 'warmup-4': ['Vỗ tay qua háng','clap','Luân phiên nâng từng chân','Vỗ tay dưới đùi chân nâng','Không cúi gập lưng','side'],
 'warmup-5': ['Gót chạm mông','buttkick','Luân phiên co gối','Giữ thân người thẳng','Không ép gót chạm mông','side'],
 'main-0': ['Chạy quanh sân','run','Nhịp chạy vừa sức','Phối hợp tay và chân đối bên','Không gồng vai','side'],
 'main-1': ['Jumping Jack','jack','Tay chân mở–khép đồng thời','Tiếp đất với gối mềm','Không khóa cứng đầu gối','front'],
 'main-2': ['Tay chạm chân','kick','Đưa tay đối bên về phía chân','Nâng chân trong tầm thoải mái','Không cố gập lưng để chạm chân','side'],
 'main-3': ['Nhón gót chân','calf','Nâng gót có kiểm soát','Giữ thăng bằng','Không hạ gót đột ngột','side'],
 'main-4': ['Nâng cao đùi','highknee','Nâng gối luân phiên','Đánh tay đối bên','Không ngả người ra sau','side'],
 'main-5': ['Bật qua cọc/mốc','hurdle','Bật qua mốc thấp','Tiếp đất nhẹ với hai gối mềm','Không bật khi mất thăng bằng','side'],
 'strength-0': ['Nhảy bật cao','jump','Gập gối để chuẩn bị','Tiếp đất nhẹ, giữ gối mềm','Không khóa gối khi tiếp đất','side'],
 'strength-1': ['Hít đất / Chống đẩy','pushup','Giữ thân người thẳng','Hạ ngực rồi đẩy lên có kiểm soát','Không võng lưng','side'],
 'strength-2': ['Ngồi xổm (Squat)','squat','Giữ lưng thẳng','Đầu gối hướng theo mũi chân','Không cong lưng','side'],
 'strength-3': ['Plank khuỷu tay','plank','Khuỷu tay đặt dưới vai','Giữ đầu–thân–chân thẳng hàng','Không nâng hông hoặc võng lưng','side'],
 'strength-4': ['Bench dips','dips','Giữ hông sát bục thấp 8 cm','Hạ người với biên độ nhỏ','Không hạ sâu, ép vai','side'],
 'strength-5': ['Nhảy dây','rope','Bật thấp vừa đủ qua dây','Xoay dây bằng cổ tay','Không vung cả cánh tay','front'],
 'strength-6': ['Scissors taps','scissors','Đổi chân theo nhịp cắt kéo','Đặt chân vào ô, tránh dây','Không tăng tốc khi chưa đúng nhịp','front'],
 'strength-7': ['Shuffle forward','shuffle','Bước ngang kết hợp tiến dần','Giữ thân người ổn định','Không giẫm lên dây thang','front'],
 'strength-8': ['Xoay háng vào ra','inout','Hông xoay theo hướng bước','Bàn chân chuyển theo, gối mềm','Không vặn gối trên chân trụ','front'],
 'strength-9': ['Forward and 1 back','forwardback','Mẫu minh họa: tiến 2 ô, lùi 1 ô','Kiểm soát nhịp tiến–lùi','Không lùi khi chưa giữ thăng bằng','side']
};
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const mul=(a,s)=>a.map(v=>v*s);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const len=a=>Math.hypot(...a);
const norm=a=>mul(a,1/(len(a)||1));
export const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
// Two-bone IK: preserve limb lengths while aiming knees/elbows toward a pole.
function limb(root,end,pole,upper,lower){
 const direction=norm(sub(end,root)),distance=Math.max(.025,Math.min(len(sub(end,root)),upper+lower-.001));
 const target=add(root,mul(direction,distance));
 const along=(upper*upper-lower*lower+distance*distance)/(2*distance);
 let bend=sub(pole,mul(direction,dot(pole,direction)));
 if(len(bend)<.01)bend=sub([0,0,1],mul(direction,direction[2]));
 const joint=add(add(root,mul(direction,along)),mul(norm(bend),Math.sqrt(Math.max(0,upper*upper-along*along))));
 return [joint,target];
}
export function standing(){return {hip:[0,1,0],shoulder:[0,1.54,0],leftFoot:[-.16,.09,.04],rightFoot:[.16,.09,.04],leftHand:[-.27,.96,.03],rightHand:[.27,.96,.03],yaw:0,footTilt:0};}
function action(type,time,hold){
 const p=standing(),a=time*Math.PI*2/3,w=(1-Math.cos(a))/2,s=Math.sin(a),c=Math.cos(a);
 const raise=(y)=>{p.hip[1]+=y;p.shoulder[1]+=y;p.leftFoot[1]+=y;p.rightFoot[1]+=y;p.leftHand[1]+=y;p.rightHand[1]+=y;};
 if(type==='squat'||type==='jump'||type==='hurdle'){
  let depth=type==='squat'?(hold?.72:w*.72):Math.max(0,Math.cos(a))*.36;
  p.hip=[0,1-depth*.43,-depth*.29];p.shoulder=[0,1.54-depth*.46,-depth*.02];
  p.leftHand=[-.23,1.25-depth*.20,.52];p.rightHand=[.23,1.25-depth*.20,.52];
  if(type!=='squat'){let flight=Math.max(0,Math.sin(a));raise(flight*(type==='hurdle'?.20:.32));p.leftHand[1]+=flight*.6;p.rightHand[1]+=flight*.6;if(type==='hurdle'){p.travel=[0,0,-.36+.72*((time/3)%1)];}}
 }else if(type==='pushup'||type==='plank'){
  const d=type==='pushup'?w*.19:0;
  p.hip=[0,.43-d*.65,-.41];p.shoulder=[0,.54-d,.39];
  p.leftFoot=[-.12,.09,-.94];p.rightFoot=[.12,.09,-.94];p.leftHand=[-.28,.11,.49];p.rightHand=[.28,.11,.49];
  p.horizontal=true;
  if(type==='plank'){p.shoulder[1]=.44;p.hip[1]=.37;p.leftElbow=[-.22,.105,.36];p.rightElbow=[.22,.105,.36];p.leftHand=[-.22,.105,.66];p.rightHand=[.22,.105,.66];}
 }else if(type==='dips'){
  p.hip=[0,.22-w*.055,.01];p.shoulder=[0,.70-w*.055,.01];
  p.leftFoot=[-.16,.09,.76];p.rightFoot=[.16,.09,.76];p.leftHand=[-.28,.115,-.22];p.rightHand=[.28,.115,-.22];
 }else if(type==='calf'){
  raise(w*.10);p.footTilt=-w*.35;p.leftFoot[2]=.08;p.rightFoot[2]=.08;
 }else if(type==='jack'){
  p.leftFoot=[-.16-w*.30,.09+Math.sin(w*Math.PI)*.06,.04];p.rightFoot=[.16+w*.30,.09+Math.sin(w*Math.PI)*.06,.04];
  const angle=w*2.8;p.leftHand=[-.23-.62*Math.sin(angle),1.5-.62*Math.cos(angle),.02];p.rightHand=[.23+.62*Math.sin(angle),1.5-.62*Math.cos(angle),.02];
  p.hip[1]-=.06*w;p.shoulder[1]-=.06*w;
 }else if(type==='circles'){
  p.leftHand=[-.66,1.5+.32*Math.sin(a),.40*Math.cos(a)];p.rightHand=[.66,1.5+.32*Math.sin(a),.40*Math.cos(a)];
 }else if(type==='lean'){
  p.shoulder=[s*.25,1.50,0];p.leftHand=s>0?[.05+s*.35,2.04,0]:[-.4,1.04,0];p.rightHand=s<0?[s*.35-.05,2.04,0]:[.4,1.04,0];
 }else if(type==='knees'){
  p.hip=[Math.sin(a)*.015,.94,.005];p.shoulder=[Math.sin(a)*.015,1.47,.08];p.leftHand=[-.19,.88,.20];p.rightHand=[.19,.88,.20];p.kneePole=[Math.sin(a)*.08,0,1];
 }else if(['jog','run','highknee','buttkick','kick','clap'].includes(type)){
  const amplitude=type==='jog'?.10:type==='run'?.25:.45;
  for(const [side,sign] of [['left',1],['right',-1]]){
   const n=Math.max(0,s*sign),x=side==='left'?-.16:.16;
   p[side+'Foot']=[x,.09+n*amplitude,.04+n*.38];
   if(type==='buttkick')p[side+'Foot']=[x,.09+n*.55,.04-n*.44];
   if(type==='kick')p[side+'Foot']=[x,.09+n*.64,.04+n*.64];
   p[side+'Hand']=[x*1.8,1.1,.14-s*sign*.34];
  }
  if(type==='clap'){const n=Math.abs(s);p.leftHand=[-.06,1.03+n*.02,.15+n*.35];p.rightHand=[.06,1.03+n*.02,.15+n*.35];}
  if(type==='kick'){p.leftHand=[-.18,1.13,.54*Math.max(0,-s)];p.rightHand=[.18,1.13,.54*Math.max(0,s)];}
 }else if(type==='rope'){
  const y=Math.abs(Math.sin(time*Math.PI*1.3))*.13;raise(y);p.leftHand=[-.43,.93+y,.08];p.rightHand=[.43,.93+y,.08];p.ropeAngle=time*Math.PI*2*1.3;
 }else if(['scissors','shuffle','inout','forwardback'].includes(type)){
  // A pass is followed by a walk-back, never a teleport to the start.
  const passage=(time%12)/12,returning=passage>.65;
  let z=returning?.78-(passage-.65)/.35*1.56:-.78+passage/.65*1.56;
  const beat=time*Math.PI*3,step=Math.sin(beat),spread=type==='inout'?(1-Math.cos(beat))*.12:0;
  if(type==='forwardback'&&!returning){const cycle=(time%3)/3;z=-.78+Math.floor((time%7.8)/3)*.45+(cycle<.67?cycle/.67*.6:.6-(cycle-.67)/.33*.3);}
  p.travel=[type==='shuffle'&&!returning?Math.sin(time*Math.PI)*.23:0,0,z];
  p.leftFoot=[-.14-spread,.09+Math.max(0,step)*.09,type==='scissors'?step*.18:step*.08];p.rightFoot=[.14+spread,.09+Math.max(0,-step)*.09,type==='scissors'?-step*.18:-step*.08];
  p.yaw=returning?Math.PI:type==='inout'?Math.sin(beat)*.2:0;p.hip[1]-=.06;p.shoulder[1]-=.06;
  p.leftHand=[-.30,1.12,.2];p.rightHand=[.30,1.12,.2];p.returning=returning;
 }
 return p;
}
export function phaseAt(t){return t<8?0:t<38?1:t<80?2:3;}
export function poseAt(key,t,hold=false){
 const config=GUIDES[key]||GUIDES['strength-2'],type=config[1],phase=phaseAt(t);
 let pose,blend;
 if(phase===0){pose=action(type,0,hold);blend=smooth(t/6);}
 else if(phase===3){pose=action(type,57,hold);blend=1-smooth((t-80)/10);}
 else {const motionTime=t<38?(t-8)*.5:15+t-38;pose=action(type,motionTime,hold);blend=1;}
 const base=standing();for(const name of ['hip','shoulder','leftFoot','rightFoot','leftHand','rightHand'])pose[name]=mix(base[name],pose[name],blend);
 if(pose.leftElbow){pose.leftElbow=mix([-.24,1.2,0],pose.leftElbow,blend);pose.rightElbow=mix([.24,1.2,0],pose.rightElbow,blend);}
 pose.yaw*=blend;pose.travel=(pose.travel||[0,0,0]).map(v=>v*blend);
 const torso=norm(sub(pose.shoulder,pose.hip));pose.head=add(pose.shoulder,mul(torso,.245));
 for(const [side,sign] of [['left',-1],['right',1]]){
  const hip=add(pose.hip,[sign*.14,0,0]),shoulder=add(pose.shoulder,[sign*.215,0,0]);
  const [knee,foot]=limb(hip,pose[side+'Foot'],pose.kneePole||[0,0,1],.46,.46);
  const [elbow,hand]=limb(shoulder,pose[side+'Hand'],[sign*.7,0,-.4],.32,.32);
  pose[side+'Hip']=hip;pose[side+'Shoulder']=shoulder;pose[side+'Knee']=knee;pose[side+'Foot']=foot;
  pose[side+'Elbow']=pose[side+'Elbow']||elbow;pose[side+'Hand']=pose[side+'Elbow']&&type==='plank'?pose[side+'Hand']:hand;
 }
 return {...pose,phase,type};
}
export function movementLabel(key,t,hold=false){
 const type=GUIDES[key]?.[1],phase=phaseAt(t);
 if(phase===0)return '1. Chuẩn bị tư thế';
 if(phase===3)return '4. Trở về tư thế ban đầu';
 const time=t<38?(t-8)*.5:15+t-38;
 if(type==='plank'||(type==='squat'&&hold))return 'Giữ tư thế · Thở đều';
 if(type==='squat')return Math.sin(time*Math.PI*2/3)>=0?'Hạ trọng tâm':'Đẩy người đứng lên';
 if(type==='pushup')return Math.sin(time*Math.PI*2/3)>=0?'Hạ ngực có kiểm soát':'Đẩy thân người lên';
 if(['scissors','shuffle','inout','forwardback'].includes(type))return time%12>7.8?'Đi bộ về vạch xuất phát':'Thực hiện nhịp chân qua thang';
 return phase===1?'2. Quan sát động tác chậm':'3. Thực hiện và lặp lại';
}
