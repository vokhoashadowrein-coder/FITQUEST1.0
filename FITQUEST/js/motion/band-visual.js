import * as THREE from '../vendor/three.module.min.js';
import {bandAnchors} from './band-poses.js';

// A flat, double-sided ribbon is updated from the animated joints every frame.
// It is illustrative geometry, not a material or tensile-force simulation.
export class BandVisual {
 constructor(rig,key){
  this.key=key;this.index=Number(key.split('-')[1]);
  this.material=new THREE.MeshStandardMaterial({color:this.index<4?0x14a780:0x9b5be2,roughness:.7,side:THREE.DoubleSide});
  this.group=new THREE.Group();rig.add(this.group);
  if(this.index!==4){
   const count=64;this.positions=new Float32Array((count+1)*6);
   const indices=[];for(let i=0;i<count;i++){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(this.positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setIndex(indices);
   this.ribbon=new THREE.Mesh(geometry,this.material);this.ribbon.castShadow=true;this.group.add(this.ribbon);
  }
  this.lines=[];
  if(this.index>=4){
   const geometry=new THREE.CylinderGeometry(1,1,1,8);
   for(let i=0;i<(this.index===4?3:2);i++){const line=new THREE.Mesh(geometry,this.material);line.castShadow=true;this.group.add(line);this.lines.push(line);}
  }
 }
 connect(mesh,a,b){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),axis=end.clone().sub(start);
  mesh.position.copy(start).add(end).multiplyScalar(.5);mesh.scale.set(.014,axis.length(),.014);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axis.normalize());
 }
 update(p,helper){
  if(this.ribbon){
   const [a,b]=bandAnchors(this.key,p).map(v=>new THREE.Vector3(...v));
   const axis=b.clone().sub(a).normalize(),center=a.clone().add(b).multiplyScalar(.5);
   const normal=new THREE.Vector3(0,1,0).addScaledVector(axis,-axis.y).normalize();
   const depth=new THREE.Vector3().crossVectors(axis,normal).normalize();
   const radius=a.distanceTo(b)/2+(this.index===5?.035:.083),zRadius=this.index===5?.155:.10;
   const halfWidth=this.index===5?.047:this.index===1||this.index===3?.021:.026;
   for(let i=0;i<=64;i++){
    const angle=i/64*Math.PI*2;
    const point=center.clone().addScaledVector(axis,Math.cos(angle)*radius).addScaledVector(depth,Math.sin(angle)*zRadius);
    for(let edge=0;edge<2;edge++)point.clone().addScaledVector(normal,(edge?1:-1)*halfWidth).toArray(this.positions,i*6+edge*3);
   }
   this.ribbon.geometry.attributes.position.needsUpdate=true;this.ribbon.geometry.computeVertexNormals();this.ribbon.geometry.computeBoundingSphere();
  }
  if(this.index===4){
   const left=[p.leftFoot[0],.014,p.leftFoot[2]+.02],right=[p.rightFoot[0],.014,p.rightFoot[2]+.02];
   this.connect(this.lines[0],p.leftHand,left);this.connect(this.lines[1],left,right);this.connect(this.lines[2],right,p.rightHand);
  }
  if(this.index===5&&helper){
   for(const [i,side,sign] of [[0,'left',-1],[1,'right',1]]){
    const grip=helper[side+'Hand'].map((v,j)=>v+helper.travel[j]-p.travel[j]);
    this.connect(this.lines[i],[p.hip[0]+sign*.18,p.hip[1]+.01,p.hip[2]-.07],grip);
   }
  }
 }
}
