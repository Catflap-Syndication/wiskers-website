import * as THREE from 'three';
import './style.css';
import './themes.css';
import './themes.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const mobileInput=matchMedia('(hover: none), (pointer: coarse)');
let paused=reducedMotion.matches;
const motionButtons=new Set();
function syncMotionButtons(){
 for(const button of motionButtons){button.textContent=paused?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(paused));}
}
reducedMotion.addEventListener('change',event=>{if(event.matches)paused=true;syncMotionButtons();});
// Both scenes share the compact source asset and textures. Vertex buffers and
// cloth remain independent so each cat can respond to its own viewport position.
let catPromise;
function loadCat(){return catPromise??=new GLTFLoader().loadAsync('/assets/cat.glb');}
function createCatScene({mount,status,motionButton,surfaceToken='--surface-page',variant='hero'}){
const scene=new THREE.Scene();scene.background=null;
const camera=new THREE.PerspectiveCamera(32,mount.clientWidth/mount.clientHeight,.01,20);camera.position.set(0,.305,1.18);camera.lookAt(0,.27,.08);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio, mobileInput.matches ? 1.5 : 2));renderer.setSize(mount.clientWidth,mount.clientHeight);renderer.localClippingEnabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;mount.appendChild(renderer.domElement);
const ambient=new THREE.HemisphereLight(0xffffff,0x091540,2.3);scene.add(ambient);const light=new THREE.DirectionalLight(0xfff0dc,3);light.position.set(-1,2,3);scene.add(light);const fill=new THREE.DirectionalLight(0xffffff,1.1);fill.position.set(2,.5,2);scene.add(fill);
const mat=new THREE.MeshBasicMaterial({color:'#f3f0e9',toneMapped:false});const dark=new THREE.MeshStandardMaterial({color:'#15060d',roughness:1});
function box(w,h,d,x,y,z,material=mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);scene.add(m);return m;}
// The surrounding surface physically occludes the shoulders and body behind the aperture.
const opening={left:-.115,right:.115,bottom:.19,top:.437},wallZ=.24;
box(3,2,.015,-1.615,.3,wallZ);box(3,2,.015,1.615,.3,wallZ);
box(.23,2,.015,0,1.437,wallZ);box(.23,2,.015,0,-.782,wallZ);
// Rounded molded housing and recessed lip, following the supplied frame reference.
function roundedOutline(w,h,r,cx,cy,Type=THREE.Shape){
 const path=new Type(),x=cx-w/2,y=cy-h/2;
 path.moveTo(x+r,y);path.lineTo(x+w-r,y);path.quadraticCurveTo(x+w,y,x+w,y+r);
 path.lineTo(x+w,y+h-r);path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
 path.lineTo(x+r,y+h);path.quadraticCurveTo(x,y+h,x,y+h-r);
 path.lineTo(x,y+r);path.quadraticCurveTo(x,y,x+r,y);return path;
}
function frameRing(w,h,r,holeW,holeH,holeR,cy,holeCy,z,depth,material,bevel){
 const shape=roundedOutline(w,h,r,0,cy);
 shape.holes.push(roundedOutline(holeW,holeH,holeR,0,holeCy,THREE.Path));
 const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,steps:1,curveSegments:16});
 const mesh=new THREE.Mesh(geo,material);mesh.position.z=z;scene.add(mesh);return mesh;
}
const housingMat=new THREE.MeshStandardMaterial({color:'#091540',roughness:.56,metalness:.12});
const gasketMat=new THREE.MeshStandardMaterial({color:'#15060d',roughness:.84});
const rimMat=new THREE.MeshStandardMaterial({color:'#2f97c1',roughness:.34,metalness:.38});
frameRing(.302,.305,.029,.232,.223,.020,.3285,.3275,.249,.016,housingMat,.0035);
frameRing(.242,.233,.024,.228,.219,.017,.3275,.3275,.270,.007,gasketMat,.001);
frameRing(.235,.226,.021,.228,.219,.017,.3275,.3275,.279,.002,rimMat,.0008);
function faceDisc(x,y,z,r,material){
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.0025,24),material);
 mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,z);scene.add(mesh);return mesh;
}
for(const x of [-.13,.13])for(const y of [.195,.462])faceDisc(x,y,.269,.005,dark);
// The small recessed selector in the lower housing adds the reference's hardware detail.
faceDisc(.062,.194,.271,.012,gasketMat);faceDisc(.062,.194,.273,.0085,housingMat);
const selector=box(.003,.012,.003,.062,.194,.275,dark);selector.rotation.z=-.45;
box(.050,.001,.001,-.035,.461,.269,rimMat);
box(.23,.247,.006,0,.3135,-.045,dark);
// Molded vinyl: fine grain, subtle ribs and a reinforced perimeter.
function flapTextures(){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#f3f0e9';ctx.fillRect(0,0,1024,512);
 let seed=17;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<85000;i++){const shade=random()>.5?'255,255,255':'35,38,32';ctx.fillStyle=`rgba(${shade},${.025+random()*.045})`;ctx.fillRect(random()*1024,random()*512,1+random()*2,1+random()*2);}
 for(let x=60;x<1000;x+=48){ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(x,30,2,450);ctx.fillStyle='rgba(35,38,32,.035)';ctx.fillRect(x+2,30,2,450);}
 function outline(inset){const r=55;ctx.beginPath();ctx.moveTo(inset,inset);ctx.lineTo(1024-inset,inset);ctx.lineTo(1024-inset,512-r);ctx.quadraticCurveTo(1024-inset,512-inset,1024-r,512-inset);ctx.lineTo(r,512-inset);ctx.quadraticCurveTo(inset,512-inset,inset,512-r);ctx.closePath();}
 ctx.strokeStyle='#15060d';ctx.lineWidth=12;outline(8);ctx.stroke();
 ctx.strokeStyle='rgba(230,231,210,.5)';ctx.lineWidth=2;outline(19);ctx.stroke();
 ctx.fillStyle='#091540';ctx.fillRect(0,477,1024,35);
 ctx.fillStyle='#2f97c1';ctx.fillRect(0,477,1024,3);
 // A quiet recessed panel catches light without introducing a logo.
 ctx.strokeStyle='rgba(65,70,57,.17)';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(410,402,204,40,12);ctx.stroke();
 const color=new THREE.CanvasTexture(canvas);color.colorSpace=THREE.SRGBColorSpace;color.anisotropy=renderer.capabilities.getMaxAnisotropy();
 const grain=document.createElement('canvas');grain.width=grain.height=256;const g=grain.getContext('2d');
 const pixels=g.createImageData(256,256);for(let i=0;i<pixels.data.length;i+=4){const v=110+Math.floor(random()*36);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}g.putImageData(pixels,0,0);
 const bump=new THREE.CanvasTexture(grain);bump.wrapS=bump.wrapT=THREE.RepeatWrapping;bump.repeat.set(4,2);
 return {color,bump};
}
const vinyl=flapTextures();
const hingeMat=new THREE.MeshStandardMaterial({color:'#2f97c1',roughness:.4,metalness:.3});
box(.228,.009,.006,0,.438,.264,hingeMat);
for(const x of [-.094,0,.094]){
 const screw=new THREE.Mesh(new THREE.CylinderGeometry(.0026,.0026,.0015,16),new THREE.MeshStandardMaterial({color:'#f3f0e9',metalness:.65,roughness:.3}));
 screw.rotation.x=Math.PI/2;screw.position.set(x,.438,.268);scene.add(screw);
 box(.0034,.00045,.0003,x,.438,.269,dark);
}
const headLift=.009;
// Independent cloth particles. Only the top row is fixed to the flap frame.
// Gravity and distance constraints drape the sheet; head contact pushes it outward.
const clothCols=24,clothRows=18,clothWidth=.222,clothLength=.11;
const flapGeometry=new THREE.PlaneGeometry(clothWidth,clothLength,clothCols,clothRows);
const flap=new THREE.Mesh(flapGeometry,new THREE.MeshStandardMaterial({
 color:'#ffffff',map:vinyl.color,bumpMap:vinyl.bump,bumpScale:.00018,roughness:.61,metalness:0,side:THREE.DoubleSide
}));flap.frustumCulled=false;scene.add(flap);
// Match the occluding wall to the page so the canvas blends in for every theme.
function applySceneTheme(){
 const style=getComputedStyle(document.documentElement);
 const token=name=>style.getPropertyValue(name).trim();
 mat.color.set(token(surfaceToken));
 housingMat.color.set(token('--scene-frame'));
 rimMat.color.set(token('--scene-rim'));hingeMat.color.set(token('--scene-rim'));
 gasketMat.color.set('#15060d');
 flap.material.color.set(token('--scene-flap'));
 const day=document.documentElement.dataset.theme==='day';
 ambient.intensity=day?2.3:1.8;light.intensity=day?3:2.6;fill.intensity=day?1.1:1.4;
 light.color.set(day?'#ffffff':'#f3f0e9');
}
window.addEventListener('wiskers:themechange',applySceneTheme);
applySceneTheme();

const cloth=[],clothLinks=[],flapCorner=.012;
for(let row=0;row<=clothRows;row++)for(let col=0;col<=clothCols;col++){
 const t=row/clothRows;
 const down=t*clothLength,cornerY=Math.max(0,down-(clothLength-flapCorner));
 const halfWidth=clothWidth/2-flapCorner+Math.sqrt(Math.max(0,flapCorner*flapCorner-cornerY*cornerY));
 const x=(col/clothCols-.5)*2*halfWidth;
 const position=new THREE.Vector3(x,.438-t*.095,.258+.065*Math.sin(t*Math.PI*.5));
 cloth.push({position,previous:position.clone(),rest:new THREE.Vector3(x,-down,0),fixed:row===0});
 flapGeometry.attributes.uv.setXY(row*(clothCols+1)+col,x/clothWidth+.5,1-t);
}
function linkCloth(a,b,length,strength=1){clothLinks.push({a,b,length:cloth[a].rest.distanceTo(cloth[b].rest),strength});}
const dx=clothWidth/clothCols,dy=clothLength/clothRows;
for(let row=0;row<=clothRows;row++)for(let col=0;col<=clothCols;col++){
 const i=row*(clothCols+1)+col;
 if(col<clothCols)linkCloth(i,i+1,dx);
 if(row<clothRows)linkCloth(i,i+clothCols+1,dy);
 if(col<clothCols&&row<clothRows){linkCloth(i,i+clothCols+2,Math.hypot(dx,dy),.7);linkCloth(i+1,i+clothCols+1,Math.hypot(dx,dy),.7);}
 if(row<clothRows-1)linkCloth(i,i+2*(clothCols+1),dy*2,.9);
 if(col<clothCols-1)linkCloth(i,i+2,dx*2,.9);
 if(row<clothRows-2)linkCloth(i,i+3*(clothCols+1),dy*3,.7);
 if(col<clothCols-2)linkCloth(i,i+3,dx*3,.7);
 if(col<clothCols-5)linkCloth(i,i+6,dx*6,.55);
 if(row<clothRows-4)linkCloth(i,i+5*(clothCols+1),dy*5,.55);
}
const clothDelta=new THREE.Vector3(),clothLocal=new THREE.Vector3(),clothOld=new THREE.Vector3();
const inverseHead=new THREE.Quaternion(),headHullCenter=new THREE.Vector3(0,.32,.17);
const headHullRadii=new THREE.Vector3(.105,.10,.14);
function collideCloth(particle,rotation){
 clothLocal.copy(particle.position);clothLocal.y-=headLift;clothLocal.sub(pivot).applyQuaternion(inverseHead).add(pivot).sub(headHullCenter);
 const radius=Math.sqrt((clothLocal.x/headHullRadii.x)**2+(clothLocal.y/headHullRadii.y)**2+(clothLocal.z/headHullRadii.z)**2);
 if(radius<1){
  clothLocal.multiplyScalar(1/Math.max(radius,.001)).add(headHullCenter).sub(pivot).applyQuaternion(rotation).add(pivot);
  particle.position.copy(clothLocal);particle.position.y+=headLift;
 }
}
let clothTime=0;
function updateFlap(rotation,dt){
 inverseHead.copy(rotation).invert();clothTime+=Math.min(dt,.04);
 const step=1/120;
 while(clothTime>=step){
  clothTime-=step;
  for(const particle of cloth){if(particle.fixed)continue;
   clothOld.copy(particle.position);
   clothDelta.copy(particle.position).sub(particle.previous).multiplyScalar(.90);
   particle.position.add(clothDelta);particle.position.y-=1.8*step*step;
   particle.previous.copy(clothOld);
  }
  for(let pass=0;pass<10;pass++){
   for(const link of clothLinks){
    const a=cloth[link.a],b=cloth[link.b];clothDelta.copy(b.position).sub(a.position);
    const length=clothDelta.length();if(length<1e-8)continue;
    clothDelta.multiplyScalar((length-link.length)/length*link.strength);
    if(a.fixed&&!b.fixed)b.position.sub(clothDelta);
    else if(b.fixed&&!a.fixed)a.position.add(clothDelta);
    else if(!a.fixed&&!b.fixed){a.position.addScaledVector(clothDelta,.5);b.position.addScaledVector(clothDelta,-.5);}
   }
   for(const particle of cloth)if(!particle.fixed)collideCloth(particle,rotation);
  }
 }
 const positions=flapGeometry.attributes.position;
 cloth.forEach((particle,i)=>positions.setXYZ(i,particle.position.x,particle.position.y,particle.position.z));
 positions.needsUpdate=true;flapGeometry.computeVertexNormals();
}
const pivot=new THREE.Vector3(0,.245,.115), records=[], eyes=[];
let loaded=false,targetX=0,targetY=0,yaw=0,pitch=0,eyeYaw=0,eyePitch=0;
if(motionButton){motionButtons.add(motionButton);syncMotionButtons();motionButton.addEventListener('click',()=>{paused=!paused;syncMotionButtons();});}
const v=new THREE.Vector3(),n=new THREE.Vector3(),q=new THREE.Quaternion(),eyeQ=new THREE.Quaternion(),euler=new THREE.Euler(0,0,0,'YXZ');
loadCat().then(gltf=>{
 gltf.scene.updateMatrixWorld(true);
 gltf.scene.traverse(m=>{if(!m.isMesh||!m.isSkinnedMesh)return;
  const geo=m.geometry.clone(),pos=geo.attributes.position,norm=geo.attributes.normal;
  // Bake the exported neutral pose, retaining the supplied geometry, UVs and textures.
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);m.applyBoneTransform(i,v);m.localToWorld(v);pos.setXYZ(i,v.x,v.y,v.z);}
  // Discard body/tail triangles in the neutral pose, before any head rotation.
  // Leave a short neck below the sill, where the surface hides its cut edge.
  if(m.name==='Object_13'){
   const original=geo.index.array,kept=[];
   for(let i=0;i<original.length;i+=3){
    const ids=[original[i],original[i+1],original[i+2]];
    if(ids.every(j=>pos.getY(j)>.205&&pos.getZ(j)>.04&&(pos.getY(j)>.275||pos.getZ(j)>.14)))kept.push(...ids);
   }
   geo.setIndex(kept);
  }
  geo.deleteAttribute('skinIndex');geo.deleteAttribute('skinWeight');geo.computeVertexNormals();
  const material=m.material.clone();material.metalness=0;material.roughness=.72;material.side=THREE.DoubleSide;
  const mesh=new THREE.Mesh(geo,material);mesh.frustumCulled=false;mesh.position.y=headLift;scene.add(mesh);
  const base=new Float32Array(pos.array),normals=new Float32Array(geo.attributes.normal.array);
  const eye=m.name==='Object_9'||m.name==='Object_11';
  geo.computeBoundingBox();const center=new THREE.Vector3();geo.boundingBox.getCenter(center);
  const weights=new Float32Array(pos.count);for(let i=0;i<pos.count;i++){const y=base[i*3+1];weights[i]=THREE.MathUtils.smoothstep(y,.20,.255);}
  const rec={mesh,base,normals,weights,center,eye};records.push(rec);if(eye)eyes.push(rec);
 });
 loaded=true;status.hidden=true;
 const diagnostics={loaded:true,meshes:records.length,eyeMeshes:eyes.length,setTarget:(x,y)=>{targetX=x;targetY=y;},getPose:()=>({yaw,pitch,eyeYaw,eyePitch}),getInputMode:()=>mobileInput.matches?'scroll':'pointer'};
 window.wiskersScenes??={};window.wiskersScenes[variant]=diagnostics;
 if(variant==='hero')window.wiskersPrototype=diagnostics;
}).catch(error=>{status.textContent='The cat could not load. Please refresh.';console.error(error);});
function pointer(x,y){const rect=mount.getBoundingClientRect(),face=new THREE.Vector3(0,.31+headLift,.23).project(camera);const cx=rect.left+(face.x+1)*rect.width/2,cy=rect.top+(1-face.y)*rect.height/2;targetX=THREE.MathUtils.clamp((x-cx)/(innerWidth*.45),-1,1);targetY=THREE.MathUtils.clamp((y-cy)/(innerHeight*.4),-1,1);}
// Fine pointers retain the original page-wide tracking. Coarse pointers get a
// gentle gaze based on this scene's viewport position, without intercepting scroll.
let scrollDirty=true,scrollX=0,scrollY=0,tapUntil=0,tapX=0,tapY=0,touchStart=null;
function updateScrollGaze(){
 const rect=mount.getBoundingClientRect();
 const progress=THREE.MathUtils.clamp((innerHeight-rect.top)/(innerHeight+rect.height),0,1);
 scrollX=Math.sin(progress*Math.PI*2)*(variant==='contact'?.24:.30);
 scrollY=(progress-.5)*(variant==='contact'?1.05:1.25);
 scrollDirty=false;
}
window.addEventListener('scroll',()=>{scrollDirty=true;},{passive:true});
mobileInput.addEventListener('change',()=>{scrollDirty=true;tapUntil=0;targetX=targetY=0;});
window.addEventListener('pointermove',ev=>{if(ev.pointerType==='mouse'&&!mobileInput.matches)pointer(ev.clientX,ev.clientY);},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>{targetX=targetY=0;});
window.addEventListener('blur',()=>{targetX=targetY=0;tapUntil=0;});
// A tap is optional. Pointer movement or page movement cancels it, so a normal
// swipe through the cat never turns into a tap or blocks the browser's gestures.
mount.addEventListener('pointerdown',ev=>{
 if(ev.pointerType!=='touch'&& !mobileInput.matches)return;
 if(!ev.isPrimary)return;
 touchStart={id:ev.pointerId,x:ev.clientX,y:ev.clientY,scroll:window.scrollY,time:performance.now()};
},{passive:true});
mount.addEventListener('pointercancel',()=>{touchStart=null;},{passive:true});
mount.addEventListener('pointerup',ev=>{
 const start=touchStart;touchStart=null;
 if(!start||start.id!==ev.pointerId||paused)return;
 if(performance.now()-start.time>500||Math.hypot(ev.clientX-start.x,ev.clientY-start.y)>12||Math.abs(window.scrollY-start.scroll)>8)return;
 pointer(ev.clientX,ev.clientY);tapX=targetX*.75;tapY=targetY*.75;tapUntil=performance.now()+1300;
},{passive:true});
function resize(){scrollDirty=true;camera.aspect=mount.clientWidth/mount.clientHeight;camera.position.z=camera.aspect<.65?1.38:1.18;camera.updateProjectionMatrix();renderer.setSize(mount.clientWidth,mount.clientHeight);}window.addEventListener('resize',resize);new ResizeObserver(resize).observe(mount);resize();
let sceneVisible=true;new IntersectionObserver(([entry])=>{sceneVisible=entry.isIntersecting;scrollDirty=true;},{rootMargin:'100px'}).observe(mount);
let previous=performance.now();renderer.setAnimationLoop(now=>{const dt=Math.min((now-previous)/1000,.05);previous=now;if(document.hidden||!sceneVisible)return;
 if(mobileInput.matches&&!paused){if(scrollDirty)updateScrollGaze();targetX=now<tapUntil?tapX:scrollX;targetY=now<tapUntil?tapY:scrollY;}
 const x=paused?0:targetX,y=paused?0:targetY;yaw=THREE.MathUtils.damp(yaw,x*(mobileInput.matches?.27:.34),9,dt);pitch=THREE.MathUtils.damp(pitch,y*(mobileInput.matches?.15:.19),9,dt);eyeYaw=THREE.MathUtils.damp(eyeYaw,x*.12,18,dt);eyePitch=THREE.MathUtils.damp(eyePitch,y*.08,18,dt);q.setFromEuler(euler.set(pitch+.075,yaw,0));eyeQ.setFromEuler(euler.set(eyePitch,eyeYaw,0));
 if(loaded)for(const r of records){const p=r.mesh.geometry.attributes.position,normal=r.mesh.geometry.attributes.normal;for(let i=0;i<p.count;i++){const j=i*3;v.fromArray(r.base,j);n.fromArray(r.normals,j);if(r.eye){v.sub(r.center).applyQuaternion(eyeQ).add(r.center);n.applyQuaternion(eyeQ);v.sub(pivot).applyQuaternion(q).add(pivot);n.applyQuaternion(q);}else{const w=r.weights[i];if(w>0){const bx=v.x,by=v.y,bz=v.z;v.sub(pivot).applyQuaternion(q).add(pivot);v.set(THREE.MathUtils.lerp(bx,v.x,w),THREE.MathUtils.lerp(by,v.y,w),THREE.MathUtils.lerp(bz,v.z,w));const nx=n.x,ny=n.y,nz=n.z;n.applyQuaternion(q);n.set(THREE.MathUtils.lerp(nx,n.x,w),THREE.MathUtils.lerp(ny,n.y,w),THREE.MathUtils.lerp(nz,n.z,w)).normalize();}}p.setXYZ(i,v.x,v.y,v.z);normal.setXYZ(i,n.x,n.y,n.z);}p.needsUpdate=normal.needsUpdate=true;}
 updateFlap(q,dt);
 renderer.render(scene,camera);
});

}
function mountCatScene(options){
 try{createCatScene(options);}catch(error){
  options.status.hidden=false;options.status.textContent='The cat preview is unavailable on this device.';
  if(options.motionButton)options.motionButton.hidden=true;
  console.error(error);
 }
}
mountCatScene({mount:document.querySelector('#scene'),status:document.querySelector('#status'),motionButton:document.querySelector('#motion')});
const returnMount=document.querySelector('#scene-return');
if(returnMount){
 // Allocate the return scene only when someone approaches it.
 const observer=new IntersectionObserver(entries=>{
  if(!entries.some(entry=>entry.isIntersecting))return;
  observer.disconnect();
  mountCatScene({mount:returnMount,status:document.querySelector('#status-return'),motionButton:document.querySelector('#motion-return'),surfaceToken:'--surface-page',variant:'return'});
 },{rootMargin:'250px'});
 observer.observe(returnMount);
}

// Accessible step exploration for the thesis diagram.
const journeyDetails=[
 ['Make starting easy','Start with one number the buyer already knows. Make the first step easy.'],
 ['Make it relevant','Their inputs shape the answer. A cost estimate or comparison becomes specific to their situation.'],
 ['Give the next step a purpose','Explore a scenario. Discuss a result. Give the buyer a next step that has a purpose.']
];
const journeyButtons=[...document.querySelectorAll('[data-journey]')];
journeyButtons.forEach(button=>button.addEventListener('click',()=>{
 journeyButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
 const [label,copy]=journeyDetails[Number(button.dataset.journey)],detail=document.querySelector('#journey-detail');
 detail.querySelector('span').textContent=label;detail.querySelector('p').textContent=copy;
}));

// Native modal supports Escape, keyboard focus containment and return to the opener.
const problemPanel=document.querySelector('#problem-panel');
document.querySelector('.problem-trigger').addEventListener('click',()=>{problemPanel.showModal();problemPanel.scrollTop=0;document.body.classList.add('panel-open');});
for(const button of problemPanel.querySelectorAll('.problem-close,.problem-done'))button.addEventListener('click',()=>problemPanel.close());
problemPanel.addEventListener('close',()=>document.body.classList.remove('panel-open'));
problemPanel.addEventListener('click',event=>{if(event.target===problemPanel){const rect=problemPanel.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)problemPanel.close();}});
