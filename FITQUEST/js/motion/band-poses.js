// Resistance-band demonstrations. Joint coordinates describe a simplified rig,
// not the stretch rating of a particular product.
import {standing, mix, phaseAt} from './poses.js';

export const BAND_GUIDES = {
 'band-0':['Side Kicks','band-side','Dây ở đùi, trên gối khoảng 5 cm','Giữ thân thẳng, chân trụ vững','Không đeo dây ngay khớp gối','front'],
 'band-1':['Hip Flexion','band-flex','Dây nằm chắc ở vùng mu giày','Nâng và hạ gối có kiểm soát','Không ngả lưng hoặc để dây tuột','side'],
 'band-2':['Nhón gót chân với dây','band-calf','Nhón gót chậm, giữ hướng gối','Vòng dây ở trên gối khoảng 5 cm','Không nhún bật hoặc đổ cổ chân','side'],
 'band-3':['Nâng cao đùi với dây','band-high','Phối hợp tay đối bên với chân nâng','Giữ thân người thẳng, lực dây nhẹ','Không giật chân làm dây tuột','side'],
 'band-4':['Squat gánh dây kháng lực','band-squat','Hai chân giữ đoạn giữa dây','Tay giữ dây thấp, ngang hông','Không vắt dây qua vai hoặc cổ','side'],
 'band-5':['Band-Resisted Sprint','band-sprint','Người hỗ trợ theo cùng và giữ lực nhẹ','Đai ở vùng hông; dùng dụng cụ phù hợp','Không thả tay khi dây đang căng','side']
};
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const scale=(a,n)=>a.map(v=>v*n);
const length=a=>Math.hypot(...a);
const norm=a=>scale(a,1/(length(a)||1));
const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
const smooth=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n);};
const motionTime=t=>t<8?0:t<38?(t-8)*.5:15+Math.min(t,80)-38;
function limb(root,end,pole,l){
 const v=sub(end,root),d=Math.max(.02,Math.min(length(v),l*2-.001)),axis=norm(v);
 const target=add(root,scale(axis,d));
 const bend=norm(sub(pole,scale(axis,dot(pole,axis))));
 return [add(add(root,scale(axis,d/2)),scale(bend,Math.sqrt(l*l-d*d/4))),target];
}
function solve(p){
 p.travel=p.travel||[0,0,0];
 p.head=add(p.shoulder,scale(norm(sub(p.shoulder,p.hip)),.245));
 for(const [side,sign] of [['left',-1],['right',1]]){
  p[side+'Hip']=add(p.hip,[sign*.14,0,0]);p[side+'Shoulder']=add(p.shoulder,[sign*.215,0,0]);
  [p[side+'Knee'],p[side+'Foot']]=limb(p[side+'Hip'],p[side+'Foot'],[0,0,1],.46);
  [p[side+'Elbow'],p[side+'Hand']]=limb(p[side+'Shoulder'],p[side+'Hand'],[sign*.7,0,-.4],.32);
 }
 return p;
}
function basePose(){const p=standing();p.hip[1]=.98;p.shoulder[1]=1.52;return p;}
function rawPose(type,time){
 const p=basePose(),w=(1-Math.cos(time*2*Math.PI/3))/2;
 if(['band-side','band-flex','band-high'].includes(type)){
  const period=type==='band-high'?2:3;
  const cycle=time/period,side=Math.floor(cycle/5)%2===0?'left':'right',sign=side==='left'?-1:1;
  const lift=(1-Math.cos(cycle*2*Math.PI))/2;
  p.activeSide=side;p.lift=lift;
  if(type==='band-side'){
   p.hip[0]=p.shoulder[0]=-sign*.035*lift;
   p[side+'Foot']=[sign*(.16+.30*lift),.09+.15*lift,.04];
   p.leftHand=[-.32,1.05,.02];p.rightHand=[.32,1.05,.02];
  }else{
   p[side+'Foot']=[sign*.16,.09+lift*(type==='band-high'?.38:.32),.04+lift*.26];
   p.leftHand=[-.29,1.13,.12];p.rightHand=[.29,1.13,.12];
   if(type==='band-high'){
    p[side+'Hand'][2]-=lift*.20;
    p[(side==='left'?'right':'left')+'Hand'][2]+=lift*.27;
   }
  }
 }else if(type==='band-calf'){
  const rise=w*.05;p.hip[1]+=rise;p.shoulder[1]+=rise;
  for(const side of ['left','right']){p[side+'Foot'][1]+=rise;p[side+'Hand'][1]+=rise;}
  p.footTilt=w*.48;p.lift=w;
 }else if(type==='band-squat'){
  p.hip=[0,.98-w*.30,-w*.20];p.shoulder=[0,1.52-w*.32,-w*.02];
  for(const [side,sign] of [['left',-1],['right',1]]){
   p[side+'Foot']=[sign*.23,.09,.04];
   p[side+'Hand']=[sign*.31,p.hip[1]+.02,p.hip[2]+.03];
  }
  p.lift=w;
 }else if(type==='band-sprint'){
  const stride=Math.sin(time*Math.PI*2/1.2);
  p.shoulder[2]=.13;p.hip[1]=.96;p.shoulder[1]=1.49;
  for(const [side,sign] of [['left',1],['right',-1]]){
   const n=Math.max(0,stride*sign),x=side==='left'?-.16:.16;
   p[side+'Foot']=[x,.09+n*.26,.04+stride*sign*.21];
   p[side+'Hand']=[x*1.8,1.18,.16-stride*sign*.27];
  }
  p.travel=[0,0,.18*Math.sin(time*.5)];
 }
 return p;
}
export function bandPoseAt(key,t){
 const type=BAND_GUIDES[key][1],phase=phaseAt(t),time=motionTime(t);
 const p=rawPose(type,time),base=basePose();
 const blend=phase===0?smooth(t/6):phase===3?1-smooth((t-80)/10):1;
 for(const name of ['hip','shoulder','leftFoot','rightFoot','leftHand','rightHand'])p[name]=mix(base[name],p[name],blend);
 p.footTilt*=blend;p.travel=(p.travel||[0,0,0]).map(v=>v*blend);
 return {...solve(p),phase,type};
}
export function helperPoseAt(t,main){
 const p=basePose(),phase=phaseAt(t),blend=phase===0?smooth(t/6):phase===3?1-smooth((t-80)/10):1;
 const stride=Math.sin(motionTime(t)*Math.PI*2/1.2)*blend;
 p.shoulder[2]=.06;
 p.leftHand=[-.23,1.06,.50];p.rightHand=[.23,1.06,.50];
 for(const [side,sign] of [['left',1],['right',-1]])p[side+'Foot']=[side==='left'?-.16:.16,.09+Math.max(0,stride*sign)*.06,.04+stride*sign*.07];
 p.travel=add(main.travel,[0,0,-1.05]);
 return solve(p);
}
export function bandAnchors(key,p){
 const index=Number(key.split('-')[1]);
 if(index===0||index===2)return ['left','right'].map(side=>add(p[side+'Knee'],scale(norm(sub(p[side+'Hip'],p[side+'Knee'])),.05)));
 if(index===1||index===3)return ['left','right'].map(side=>add(p[side+'Foot'],[0,.04,.07]));
 return [add(p.hip,[-.19,.01,0]),add(p.hip,[.19,.01,0])];
}
export function bandMovementLabel(key,t){
 const phase=phaseAt(t);if(phase===0)return '1. Chuẩn bị · Kiểm tra vị trí dây';
 if(phase===3)return '4. Thu lực từ từ · Trở về tư thế ban đầu';
 const p=bandPoseAt(key,t),time=motionTime(t);
 if(p.activeSide)return `${Math.sin(time*2*Math.PI/(p.type==='band-high'?2:3))>=0?'Nâng chân':'Thu chân có kiểm soát'} ${p.activeSide==='left'?'trái':'phải'} · ${phase===1?'Nhịp chậm':'Lặp lại'}`;
 if(p.type==='band-squat')return Math.sin(time*2*Math.PI/3)>=0?'Hạ hông · Giữ tay thấp':'Đứng lên · Kiểm soát lực dây';
 if(p.type==='band-calf')return Math.sin(time*2*Math.PI/3)>=0?'Nhón gót · Gối hướng theo mũi chân':'Hạ gót từ từ';
 return 'Chạy có kiểm soát · Người hỗ trợ theo cùng';
}
