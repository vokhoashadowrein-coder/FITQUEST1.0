import * as THREE from './vendor/three.module.min.js';
import {GUIDES as BASE_GUIDES,poseAt,phaseAt,movementLabel} from './motion/poses.js';
import {BAND_GUIDES,bandPoseAt,helperPoseAt,bandMovementLabel} from './motion/band-poses.js';
import {BandVisual} from './motion/band-visual.js';
const GUIDES={...BASE_GUIDES,...BAND_GUIDES};
const STAGES=['Chuẩn bị tư thế','Quan sát chậm · 0.5x','Thực hiện nhịp thường · 1x','Kết thúc'];
const duration=90;
class MotionGuide extends HTMLElement {
 static observedAttributes=['variant'];
 connectedCallback(){
  this.key=this.getAttribute('exercise');this.config=GUIDES[this.key];if(!this.config)return;
  this.elapsed=0;this.playing=false;this.rate=1;this.loop=false;this.angle=this.config[5]==='side'?Math.PI/2:0;this.orbit=false;this.last=0;
  this.innerHTML=`<section class="motion-guide" aria-label="Hướng dẫn mô phỏng ${this.config[0]}"><div class="motion-heading"><span>🧍 DUMMY MOTION GUIDE</span><b>01:30</b></div><div class="motion-viewport"><canvas aria-label="Nhân vật 3D mô phỏng ${this.config[0]}"></canvas><span class="motion-badge">${this.key.startsWith('warmup')?'KHỞI ĐỘNG NHẸ':this.key.startsWith('main')?'KHỞI ĐỘNG CHÍNH':this.isBand?'DÂY KHÁNG LỰC':'THỂ CHẤT & THANG DÂY'}</span><span class="motion-view-name"></span><div class="motion-failure" hidden>Trình duyệt chưa hỗ trợ hiển thị 3D. Hãy bật tăng tốc đồ họa hoặc mở bằng trình duyệt có WebGL 2. Hướng dẫn bằng chữ vẫn ở bên cạnh.</div></div><div class="motion-body"><div class="motion-title">${this.config[0]}</div><ol class="motion-stages">${STAGES.map((s,i)=>`<li data-stage="${i}">${i+1}. ${s}</li>`).join('')}</ol><p class="motion-action" aria-live="polite"></p><div class="motion-timeline"><input type="range" min="0" max="90" step="0.1" value="0" aria-label="Vị trí trong hướng dẫn 90 giây"><span class="motion-time">00:00 / 01:30</span></div><div class="motion-controls"><button type="button" data-control="play">▶ Play</button><button type="button" data-control="pause">⏸ Pause</button>${this.isBand?'<button type="button" data-control="replay">↶ Xem lại từ đầu</button>':''}<button type="button" data-control="loop" aria-pressed="false">🔁 Lặp lại</button><button type="button" data-control="slow" aria-pressed="false">🐢 Chậm 0.5x</button><button type="button" data-control="normal" aria-pressed="true">▶ Bình thường 1x</button></div><div class="motion-views"><span>🔍 Góc nhìn</span><button type="button" data-control="front">👤 Chính diện</button><button type="button" data-control="side">↔ Góc bên</button><button type="button" data-control="orbit" aria-pressed="false">🔄 Xoay 360°</button></div><div class="motion-cues"><span>✅ ${this.config[2]}</span><span>✅ ${this.config[3]}</span><span>⚠ ${this.config[4]}</span></div><p class="motion-note">Mô phỏng tham khảo, không đo hay chấm động tác. ${this.key.startsWith('strength-')&&Number(this.key.split('-')[1])>=6?'Nhịp bước thang dây cần đối chiếu mẫu giáo viên. ':''}${this.isBand?'Dây được minh họa theo vị trí đặt, không theo tỉ lệ chiều dài hoặc lực cản. ':''}${this.key==='band-5'?'Nhân vật màu xám là người hỗ trợ. ':''}Xem hướng dẫn không cộng XP hoặc số lần tập.</p><p class="motion-status" role="status"></p></div></section>`;
  this.canvas=this.querySelector('canvas');this.status=this.querySelector('.motion-status');
  try{this.initScene();}catch(error){this.fail();return;}
  this.handleClick=e=>{const button=e.target.closest('[data-control]');if(!button)return;const kind=button.dataset.control;
   if(kind==='play'){if(this.elapsed>=duration)this.elapsed=0;this.playing=true;this.status.textContent='Đang phát hướng dẫn.';}
   if(kind==='replay'){this.elapsed=0;this.playing=true;this.drawPose();this.status.textContent='Đang xem lại từ đầu.';}
   if(kind==='pause'){this.playing=false;this.status.textContent='Đã tạm dừng hướng dẫn.';}
   if(kind==='loop'){this.loop=!this.loop;button.setAttribute('aria-pressed',String(this.loop));}
   if(kind==='slow'||kind==='normal'){this.rate=kind==='slow'?.5:1;this.querySelector('[data-control="slow"]').setAttribute('aria-pressed',String(this.rate===.5));this.querySelector('[data-control="normal"]').setAttribute('aria-pressed',String(this.rate===1));}
   if(kind==='front'||kind==='side'){this.orbit=false;this.angle=kind==='front'?0:Math.PI/2;}
   if(kind==='orbit'){this.orbit=!this.orbit;}
   this.updateUI();
  };
  this.addEventListener('click',this.handleClick);
  this.querySelector('input').addEventListener('input',e=>{this.elapsed=Number(e.target.value);this.drawPose();this.updateUI();});
  this.visibility=()=>{if(document.hidden){this.playing=false;this.orbit=false;this.status.textContent='Đã tạm dừng khi rời trang.';this.updateUI();}};
  document.addEventListener('visibilitychange',this.visibility);
  this.contextLost=e=>{e.preventDefault();this.playing=false;this.orbit=false;this.fail();};this.canvas.addEventListener('webglcontextlost',this.contextLost);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.querySelector('.motion-viewport'));
  this.resize();this.updateUI();this.drawPose();
  this.frame=requestAnimationFrame(t=>this.animate(t));
 }
 attributeChangedCallback(){if(this.scene){this.drawPose();this.updateUI();}}
 get isBand(){return this.key?.startsWith('band-');}
 get hold(){return this.getAttribute('variant')==='time';}
 fail(){const notice=this.querySelector('.motion-failure');if(notice)notice.hidden=false;this.querySelectorAll('button,input').forEach(b=>b.disabled=true);this.failed=true;}
 initScene(){
  this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:false});
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#edf3fa');
  this.camera=new THREE.PerspectiveCamera(37,1,.05,30);
  this.scene.add(new THREE.HemisphereLight(0xffffff,0x7186a4,2.3));
  const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,5,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-3;light.shadow.camera.right=3;light.shadow.camera.top=3;light.shadow.camera.bottom=-3;light.shadow.normalBias=.035;this.scene.add(light);
  const fill=new THREE.DirectionalLight(0xb8d5ff,1.5);fill.position.set(-3,2,-3);this.scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.MeshStandardMaterial({color:0xeaf0f7,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.015;floor.receiveShadow=true;this.scene.add(floor);
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.30,1.315,80),new THREE.MeshBasicMaterial({color:0xc8d8eb,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.001;this.scene.add(ring);
  const topColor=this.key.startsWith('warmup')?0x1fa880:this.key.startsWith('main')?0x2868d8:this.isBand?0x8050d6:Number(this.key.split('-')[1])>=6?0x2868d8:0xdf4d57;
  this.materials={top:new THREE.MeshStandardMaterial({color:topColor,roughness:.66}),skin:new THREE.MeshStandardMaterial({color:0xe0c1a2,roughness:.75}),pants:new THREE.MeshStandardMaterial({color:0x263d59,roughness:.8}),shoe:new THREE.MeshStandardMaterial({color:0xf9fbff,roughness:.6}),stripe:new THREE.MeshStandardMaterial({color:0xf7a343,roughness:.6})};
  this.rig=new THREE.Group();this.scene.add(this.rig);this.parts={};
  this.sphere=new THREE.SphereGeometry(1,20,14);this.cylinder=new THREE.CylinderGeometry(1,1,1,14);
  const sphere=(name,mat)=>{const mesh=new THREE.Mesh(this.sphere,this.materials[mat]);mesh.castShadow=true;this.rig.add(mesh);this.parts[name]=mesh;return mesh;};
  const segment=(name,mat)=>{const mesh=new THREE.Mesh(this.cylinder,this.materials[mat]);mesh.castShadow=true;this.rig.add(mesh);this.parts[name]=mesh;return mesh;};
  sphere('torso','top');sphere('pelvis','pants');sphere('head','skin');sphere('hair','pants');segment('neck','skin');
  for(const side of ['left','right']){segment(side+'UpperArm','top');segment(side+'Forearm','skin');segment(side+'Thigh','pants');segment(side+'Shin','skin');sphere(side+'Knee','skin');sphere(side+'Elbow','skin');sphere(side+'Hand','skin');sphere(side+'Foot','shoe');sphere(side+'Shoulder','top');}
  this.up=new THREE.Vector3(0,1,0);this.vectorA=new THREE.Vector3();this.vectorB=new THREE.Vector3();this.makeProps();
 }
 makeProps(){
  this.props=new THREE.Group();this.scene.add(this.props);const type=this.config[1];
  if(type==='band-sprint'){
   this.helperRig=this.rig.clone(true);this.helperParts={};const materials=new Map();
   Object.keys(this.parts).forEach((name,i)=>{const mesh=this.helperRig.children[i],original=mesh.material;if(!materials.has(original)){const material=original.clone();if(original===this.materials.top)material.color.set(0x6a8498);materials.set(original,material);}mesh.material=materials.get(original);this.helperParts[name]=mesh;});
   this.scene.add(this.helperRig);
  }
  if(this.isBand)this.band=new BandVisual(this.rig,this.key);
  const box=(x,y,z,w,h,d,color)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.8}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;this.props.add(m);};
  if(['scissors','shuffle','inout','forwardback'].includes(type)){for(const x of [-.35,.35])box(x,.012,0,.025,.016,2.4,0x285e9e);for(let i=0;i<9;i++)box(0,.025,-1.2+i*.3,.72,.018,.035,0xf5b64e);}
  if(type==='dips')box(0,.04,-.31,.85,.08,.40,0x647e9f);
  if(type==='hurdle')box(0,.04,0,.6,.08,.06,0xf1a238);
  if(['pushup','plank'].includes(type))box(0,.005,0,.85,.012,2.2,0xa6c4df);
  if(type==='rope'){
   const points=[];for(let i=0;i<=100;i++){const a=i/100*Math.PI*2;points.push(new THREE.Vector3(.48*Math.cos(a),.92*Math.sin(a),0));}
   this.rope=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xf09022}));this.rope.position.y=.95;this.scene.add(this.rope);
  }
 }
 segment(name,a,b,width){const m=this.parts[name];this.vectorA.fromArray(a);this.vectorB.fromArray(b);m.position.copy(this.vectorA).add(this.vectorB).multiplyScalar(.5);this.vectorB.sub(this.vectorA);m.scale.set(width,this.vectorB.length(),width);m.quaternion.setFromUnitVectors(this.up,this.vectorB.normalize());}
 joint(name,p,x,y=x,z=x){const m=this.parts[name];m.position.fromArray(p);m.scale.set(x,y,z);}
 drawPose(){
  if(!this.scene||this.failed)return;
  const p=this.isBand?bandPoseAt(this.key,this.elapsed):poseAt(this.key,this.elapsed,this.hold);
  this.paintRig(p,this.rig,this.parts);
  const helper=this.helperRig?helperPoseAt(this.elapsed,p):null;
  if(helper)this.paintRig(helper,this.helperRig,this.helperParts);
  if(this.band)this.band.update(p,helper);
  if(this.rope){this.rope.visible=this.elapsed>=8&&this.elapsed<80;this.rope.rotation.x=p.ropeAngle||0;}
 }
 paintRig(p,rig,parts){
  const originalParts=this.parts;this.parts=parts;rig.position.fromArray(p.travel);rig.rotation.y=p.yaw;
  const center=p.hip.map((v,i)=>(v+p.shoulder[i])/2);this.joint('torso',center,.235,Math.hypot(...p.shoulder.map((v,i)=>v-p.hip[i]))*.56,.14);this.vectorB.fromArray(p.shoulder).sub(this.vectorA.fromArray(p.hip)).normalize();this.parts.torso.quaternion.setFromUnitVectors(this.up,this.vectorB);
  this.joint('pelvis',p.hip,.20,.13,.14);this.joint('head',p.head,.12,.155,.125);this.parts.head.quaternion.copy(this.parts.torso.quaternion);
  const hair=p.head.map((v,i)=>v+this.vectorB.getComponent(i)*.105);this.joint('hair',hair,.121,.067,.123);this.parts.hair.quaternion.copy(this.parts.torso.quaternion);
  this.segment('neck',p.shoulder,p.head,.065);
  for(const side of ['left','right']){
   this.segment(side+'UpperArm',p[side+'Shoulder'],p[side+'Elbow'],.069);this.segment(side+'Forearm',p[side+'Elbow'],p[side+'Hand'],.05);
   this.segment(side+'Thigh',p[side+'Hip'],p[side+'Knee'],.093);this.segment(side+'Shin',p[side+'Knee'],p[side+'Foot'],.060);
   this.joint(side+'Shoulder',p[side+'Shoulder'],.079);this.joint(side+'Elbow',p[side+'Elbow'],.051);this.joint(side+'Knee',p[side+'Knee'],.068);this.joint(side+'Hand',p[side+'Hand'],.052,.072,.045);
   const foot=[...p[side+'Foot']];foot[2]+=.055;this.joint(side+'Foot',foot,.071,.062,.14);this.parts[side+'Foot'].rotation.x=p.footTilt||0;
  }
  this.parts=originalParts;
 }
 resize(){if(!this.renderer)return;const rect=this.querySelector('.motion-viewport').getBoundingClientRect();const w=Math.max(1,rect.width),h=Math.max(1,rect.height);this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 animate(time){
  if(!this.isConnected||this.failed)return;const delta=this.last?Math.min((time-this.last)/1000,.1):0;this.last=time;
  if(this.playing){this.elapsed+=delta*this.rate;if(this.elapsed>=duration){if(this.loop)this.elapsed%=duration;else{this.elapsed=duration;this.playing=false;this.status.textContent='Đã hết hướng dẫn 90 giây. Bấm Play để xem lại.';}}this.drawPose();this.updateUI();}
  if(this.orbit)this.angle+=delta*.45;
  const sprint=this.key==='band-5',radius=sprint?5.1:4.65,center=sprint?-.4:0;this.camera.position.set(Math.sin(this.angle)*radius,2.25,center+Math.cos(this.angle)*radius);this.camera.lookAt(0,.98,center);this.renderer.render(this.scene,this.camera);this.frame=requestAnimationFrame(t=>this.animate(t));
 }
 updateUI(){
  if(!this.config)return;const phase=phaseAt(this.elapsed);
  this.querySelectorAll('[data-stage]').forEach(el=>el.classList.toggle('current',Number(el.dataset.stage)===phase));
  const action=this.isBand?bandMovementLabel(this.key,this.elapsed):movementLabel(this.key,this.elapsed,this.hold),el=this.querySelector('.motion-action');if(el.textContent!==action)el.textContent=action;
  const seconds=Math.floor(this.elapsed);this.querySelector('.motion-time').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')} / 01:30`;
  this.querySelector('input').value=this.elapsed;this.querySelector('[data-control="orbit"]').setAttribute('aria-pressed',String(this.orbit));
  this.querySelector('[data-control="play"]').setAttribute('aria-pressed',String(this.playing));
  this.querySelector('.motion-view-name').textContent=this.orbit?'Góc nhìn 360°':Math.abs(this.angle-Math.PI/2)<.1?'Góc bên':'Góc chính diện';
 }
 disconnectedCallback(){
  cancelAnimationFrame(this.frame);this.resizeObserver?.disconnect();document.removeEventListener('visibilitychange',this.visibility);this.removeEventListener('click',this.handleClick);
  if(this.scene){const geometries=new Set(),materials=new Set();this.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
  if(this.renderer){this.canvas.removeEventListener('webglcontextlost',this.contextLost);this.renderer.dispose();this.renderer.forceContextLoss();}
 }
}
customElements.define('motion-guide',MotionGuide);
