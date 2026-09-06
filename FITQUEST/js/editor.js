'use strict';
(() => {
  const STORAGE_KEY = 'fitquest-home-design-v1';
  const fields = [
    ['heading','Tiêu đề trang','.page-heading h1'],
    ['eyebrow','Dòng giới thiệu','.page-heading .eyebrow'],
    ['greeting','Lời chào','#welcome-title'],
    ['intro','Lời mời tập luyện','.welcome-copy > p'],
    ['motivation','Lời động viên','.welcome-note'],
    ['startButton','Chữ nút bắt đầu tập','.welcome .button-label'],
    ['workoutButton','Chữ nút buổi tập','.workout-button .button-label'],
    ['workout','Tiêu đề buổi tập','#workout-title'],
    ['program','Tên chương trình','.workout-main h3'],
    ['today','Tiêu đề tiến độ hôm nay','#today-title'],
    ['encouragement','Thông điệp tiến độ','.today-message h3'],
    ['encouragementDetail','Nội dung tiến độ','.today-message p'],
    ['achievements','Tiêu đề thành tích','#achievements-title'],
    ['chart','Tiêu đề biểu đồ','#chart-title'],
    ['chartSubtitle','Chú thích biểu đồ','.chart-subtitle'],
    ['footer','Lời cuối trang','#home footer']
  ];
  const sections = [
    ['heading','Tiêu đề trang','.page-heading'],
    ['welcome','Lời chào & hình minh họa','.welcome'],
    ['mainLink','Liên kết Khởi động chính','.module-entry:not(.strength-entry):not(.resistance-entry)'],
    ['strengthLink','Liên kết Thể chất & Thang dây','.strength-entry'],
    ['bandLink','Liên kết Dây kháng lực','.resistance-entry'],
    ['training','Buổi tập & tiến độ hôm nay','.training-grid'],
    ['achievements','Thành tích','#achievements'],
    ['chart','Biểu đồ tuần','#progress']
  ];
  const palettes = [
    ['accent','Màu chính / nút','#2463eb'], ['background','Nền trang','#f7f9fc'],
    ['surface','Nền thẻ','#ffffff'], ['ink','Chữ chính','#182b47'],
    ['hero','Nền khu vực lời chào','#edf5ff'], ['buttonText','Chữ trên nút','#ffffff']
  ];
  const defaults = () => ({version:1,colors:Object.fromEntries(palettes.map(([k,,v])=>[k,v])),font:'system',scale:1,radius:19,texts:{},order:sections.map(([k])=>k)});
  const fontOptions={system:'"Segoe UI",Arial,sans-serif',arial:'Arial,sans-serif',serif:'Georgia,"Times New Roman",serif'};
  const home=document.querySelector('#home');
  const originals=new Map(fields.map(([id,,selector])=>[id,{node:document.querySelector(selector),html:document.querySelector(selector).innerHTML,text:document.querySelector(selector).textContent.trim()}]));
  const blocks=new Map(sections.map(([id,,selector])=>[id,document.querySelector(selector)]));
  let design=defaults(),saved=JSON.stringify(design),open=false,selected='greeting',undo=[],redo=[],dragged=null;
  let storageMessage='';
  try {const raw=localStorage.getItem(STORAGE_KEY);if(raw){design=validate(JSON.parse(raw));saved=JSON.stringify(design);storageMessage='Đã mở thiết kế lưu trên trình duyệt này.';}}catch{storageMessage='Không đọc được bản lưu. Đang dùng giao diện mặc định.';}
  const style=document.createElement('style');style.id='fitquest-design-styles';document.head.append(style);
  const button=document.createElement('button');button.id='design-toggle';button.type='button';button.textContent='✎ Chỉnh sửa giao diện';button.setAttribute('aria-controls','design-panel');button.setAttribute('aria-expanded','false');document.body.append(button);
  const panel=document.createElement('aside');panel.id='design-panel';panel.hidden=true;panel.setAttribute('aria-label','Chỉnh sửa giao diện trang chủ');panel.innerHTML=`
    <div class="ed-heading"><div><span>FITQUEST DESIGN</span><h2>Tự thiết kế trang chủ</h2></div><button type="button" id="ed-close" aria-label="Đóng bảng chỉnh sửa">×</button></div>
    <p class="ed-intro">Bấm vào chữ có khung trên trang để sửa. Mọi thay đổi được xem ngay trên giao diện.</p>
    <div class="ed-history"><button id="ed-undo" type="button">↶ Hoàn tác</button><button id="ed-redo" type="button">↷ Làm lại</button></div>
    <fieldset><legend>1. Nội dung</legend><label>Chọn phần chữ<select id="ed-field">${fields.map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label>Nội dung hiển thị<textarea id="ed-text" maxlength="400" rows="3"></textarea></label><p class="ed-help">Chỉ sửa chữ; các nút tập và dữ liệu tiến độ vẫn hoạt động như trước.</p></fieldset>
    <fieldset><legend>2. Màu sắc</legend><div class="ed-colors">${palettes.map(([id,label])=>`<label><span>${label}</span><input type="color" data-color="${id}" aria-label="${label}"></label>`).join('')}</div></fieldset>
    <fieldset><legend>3. Kiểu chữ & thẻ</legend><label>Phông chữ<select id="ed-font"><option value="system">Hiện đại (mặc định)</option><option value="arial">Arial</option><option value="serif">Georgia / Times New Roman</option></select></label><label>Cỡ chữ <output id="ed-scale-output"></output><input id="ed-scale" type="range" min="85" max="130" step="5"></label><label>Độ bo góc <output id="ed-radius-output"></output><input id="ed-radius" type="range" min="8" max="32" step="1"></label></fieldset>
    <fieldset><legend>4. Thứ tự các khu vực</legend><p class="ed-help">Kéo hàng để đổi vị trí trên máy tính, hoặc dùng nút ↑ ↓ trên mọi thiết bị.</p><ol id="ed-order"></ol></fieldset>
    <div class="ed-files"><button id="ed-export" type="button">↓ Xuất thiết kế</button><button id="ed-import" type="button">↑ Nhập thiết kế</button><input type="file" id="ed-file" accept=".json,application/json" hidden></div>
    <button id="ed-reset" type="button" class="ed-reset">Khôi phục giao diện mặc định</button>
    <div class="ed-save-area"><button id="ed-save" type="button">Lưu trên trình duyệt này</button><p id="ed-status" role="status" aria-live="polite"></p><p class="ed-help">Bản lưu chỉ áp dụng trên trình duyệt này, chưa thay đổi website cho người khác. Xuất tệp để sao lưu hoặc gửi lại thiết kế.</p></div>`;
  document.body.append(panel);
  const $=s=>panel.querySelector(s);
  function validate(value){
    if(!value||typeof value!=='object'||value.version!==1)throw Error('Tệp không đúng định dạng thiết kế FITQUEST.');
    const result=defaults();
    if(value.colors){for(const [id] of palettes){if(value.colors[id]!==undefined){if(!/^#[0-9a-f]{6}$/i.test(value.colors[id]))throw Error('Màu sắc trong tệp không hợp lệ.');result.colors[id]=value.colors[id];}}}
    if(value.font!==undefined){if(!Object.hasOwn(fontOptions,value.font))throw Error('Phông chữ không hợp lệ.');result.font=value.font;}
    if(value.scale!==undefined){if(typeof value.scale!=='number'||!Number.isFinite(value.scale)||value.scale<.85||value.scale>1.3)throw Error('Cỡ chữ ngoài phạm vi hỗ trợ.');result.scale=value.scale;}
    if(value.radius!==undefined){if(typeof value.radius!=='number'||!Number.isFinite(value.radius)||value.radius<8||value.radius>32)throw Error('Độ bo góc không hợp lệ.');result.radius=value.radius;}
    if(value.texts){for(const [id] of fields){if(Object.hasOwn(value.texts,id)){if(typeof value.texts[id]!=='string'||value.texts[id].length>400)throw Error('Nội dung quá dài hoặc không hợp lệ.');result.texts[id]=value.texts[id];}}}
    if(value.order!==undefined){
      if(!Array.isArray(value.order))throw Error('Thứ tự khu vực không hợp lệ.');
      const order=[...value.order];
      // Preserve designs saved before the resistance-band link was introduced.
      if(order.length===sections.length-1&&!order.includes('bandLink')&&order.includes('strengthLink'))order.splice(order.indexOf('strengthLink')+1,0,'bandLink');
      if(order.length!==sections.length||new Set(order).size!==sections.length||order.some(k=>!sections.some(([id])=>id===k)))throw Error('Thứ tự khu vực không hợp lệ.');
      result.order=order;
    }
    return result;
  }
  function apply(){
    const c=design.colors;
    style.textContent=`:root{--blue:${c.accent};--ink:${c.ink}}body{background:${c.background};color:${c.ink}}#home{font-family:${fontOptions[design.font]}}#home .card{background:${c.surface};border-radius:${design.radius}px}#home .welcome{background:${c.hero};border-radius:${design.radius}px}#home .achievement{border-radius:${design.radius}px}#home .primary{background:${c.accent};color:${c.buttonText}}#home .primary:hover{filter:brightness(.93)}#home h1{font-size:${26*design.scale}px}#home .welcome h2{font-size:${35*design.scale}px}#home .section-heading h2{font-size:${18*design.scale}px}#home .workout-main h3{font-size:${21*design.scale}px}#home .today-message h3{font-size:${17*design.scale}px}#home .welcome-copy>p{font-size:${16*design.scale}px}#home .today-message p{font-size:${14*design.scale}px}#home .primary{font-size:${13*design.scale}px}#home .chart-subtitle,#home .welcome-note,#home footer{font-size:${12*design.scale}px}#home .bar.selected{background:${c.accent}}@media(max-width:700px){#home .welcome h2{font-size:${30*design.scale}px}#home .workout-main h3{font-size:${19*design.scale}px}}`;
    for(const [id] of fields){const original=originals.get(id);if(Object.hasOwn(design.texts,id))original.node.textContent=design.texts[id];else original.node.innerHTML=original.html;}
    const footer=home.querySelector('footer');design.order.forEach(id=>home.insertBefore(blocks.get(id),footer));
    for(const [id] of fields){const node=originals.get(id).node;node.classList.toggle('ed-editable',open);node.classList.toggle('ed-selected',open&&id===selected);}
  }
  function orderUI(){
    $('#ed-order').innerHTML=design.order.map((id,i)=>`<li draggable="true" data-section="${id}"><span aria-hidden="true">⠿</span><b>${sections.find(([k])=>id===k)[1]}</b><button type="button" data-move="-1" data-id="${id}" aria-label="Đưa ${sections.find(([k])=>id===k)[1]} lên" ${i===0?'disabled':''}>↑</button><button type="button" data-move="1" data-id="${id}" aria-label="Đưa ${sections.find(([k])=>id===k)[1]} xuống" ${i===design.order.length-1?'disabled':''}>↓</button></li>`).join('');
  }
  function controls(){
    $('#ed-field').value=selected;$('#ed-text').value=design.texts[selected]??originals.get(selected).text;
    palettes.forEach(([id])=>panel.querySelector(`[data-color="${id}"]`).value=design.colors[id]);
    $('#ed-font').value=design.font;$('#ed-scale').value=Math.round(design.scale*100);$('#ed-scale-output').textContent=`${Math.round(design.scale*100)}%`;
    $('#ed-radius').value=design.radius;$('#ed-radius-output').textContent=`${design.radius}px`;
    $('#ed-undo').disabled=!undo.length;$('#ed-redo').disabled=!redo.length;orderUI();
  }
  function status(text){$('#ed-status').textContent=text;}
  function commit(next,updateControls=true){const before=JSON.stringify(design);if(JSON.stringify(next)===before)return;undo.push(before);if(undo.length>60)undo.shift();redo=[];design=next;apply();if(updateControls)controls();else{$('#ed-undo').disabled=false;$('#ed-redo').disabled=true;}status('Chưa lưu · Đang xem thay đổi trực tiếp.');}
  function change(edit,updateControls=true){const next=structuredClone(design);edit(next);commit(next,updateControls);}
  function setOpen(value){open=value;panel.hidden=!open;button.hidden=open;button.setAttribute('aria-expanded',String(open));document.body.classList.toggle('design-editing',open);apply();if(open){controls();status(JSON.stringify(design)===saved?(storageMessage||'Sẵn sàng chỉnh sửa.'):'Chưa lưu · Thiết kế chỉ đang được xem thử.');$('#ed-field').focus();}else button.focus();}
  button.addEventListener('click',()=>setOpen(true));$('#ed-close').addEventListener('click',()=>setOpen(false));
  for(const [id] of fields){originals.get(id).node.addEventListener('click',event=>{if(!open)return;event.preventDefault();event.stopPropagation();selected=id;controls();apply();$('#ed-text').focus();});}
  $('#ed-field').addEventListener('change',e=>{selected=e.target.value;controls();apply();originals.get(selected).node.scrollIntoView({behavior:'smooth',block:'center'});});
  $('#ed-text').addEventListener('input',e=>change(d=>{d.texts[selected]=e.target.value;},false));
  panel.querySelectorAll('[data-color]').forEach(input=>input.addEventListener('input',e=>change(d=>{d.colors[e.target.dataset.color]=e.target.value;},false)));
  $('#ed-font').addEventListener('change',e=>change(d=>{d.font=e.target.value;}));
  $('#ed-scale').addEventListener('input',e=>{const n=Number(e.target.value);change(d=>{d.scale=n/100;},false);$('#ed-scale-output').textContent=`${n}%`;});
  $('#ed-radius').addEventListener('input',e=>{const n=Number(e.target.value);change(d=>{d.radius=n;},false);$('#ed-radius-output').textContent=`${n}px`;});
  $('#ed-order').addEventListener('click',e=>{const b=e.target.closest('[data-move]');if(!b||b.disabled)return;change(d=>{const i=d.order.indexOf(b.dataset.id),j=i+Number(b.dataset.move);[d.order[i],d.order[j]]=[d.order[j],d.order[i]];});blocks.get(b.dataset.id).scrollIntoView({behavior:'smooth',block:'center'});});
  $('#ed-order').addEventListener('dragstart',e=>{const row=e.target.closest('[data-section]');if(!row)return;dragged=row.dataset.section;e.dataTransfer.setData('text/plain',dragged);e.dataTransfer.effectAllowed='move';});
  $('#ed-order').addEventListener('dragover',e=>{if(dragged)e.preventDefault();});
  $('#ed-order').addEventListener('drop',e=>{e.preventDefault();const row=e.target.closest('[data-section]');if(row&&dragged&&row.dataset.section!==dragged){change(d=>{const i=d.order.indexOf(dragged),j=d.order.indexOf(row.dataset.section);d.order.splice(i,1);d.order.splice(j,0,dragged);});}dragged=null;});
  $('#ed-order').addEventListener('dragend',()=>{dragged=null;});
  $('#ed-undo').addEventListener('click',()=>{if(!undo.length)return;redo.push(JSON.stringify(design));design=JSON.parse(undo.pop());apply();controls();status('Đã hoàn tác. Bấm Lưu để giữ thay đổi.');});
  $('#ed-redo').addEventListener('click',()=>{if(!redo.length)return;undo.push(JSON.stringify(design));design=JSON.parse(redo.pop());apply();controls();status('Đã làm lại. Bấm Lưu để giữ thay đổi.');});
  $('#ed-reset').addEventListener('click',()=>{commit(defaults());status('Đã khôi phục mặc định. Có thể Hoàn tác hoặc Lưu để giữ.');});
  $('#ed-save').addEventListener('click',()=>{try{const raw=JSON.stringify(design);localStorage.setItem(STORAGE_KEY,raw);saved=raw;storageMessage='Đã lưu trên trình duyệt này.';status(storageMessage);}catch{status('Không lưu được trên trình duyệt. Hãy chọn Xuất thiết kế để giữ bản chỉnh sửa.');}});
  $('#ed-export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(design,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='FITQUEST-thiet-ke-trang-chu.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Đã yêu cầu tải tệp thiết kế. Giữ tệp này để sao lưu hoặc gửi lại.');});
  $('#ed-import').addEventListener('click',()=>$('#ed-file').click());
  $('#ed-file').addEventListener('change',async e=>{const input=e.target;const file=input.files[0];if(!file)return;try{if(file.size>100000)throw Error('Tệp quá lớn. Chọn tệp JSON đã xuất từ FITQUEST.');const next=validate(JSON.parse(await file.text()));commit(next);status('Đã nhập thiết kế. Bấm Lưu để giữ trên trình duyệt này.');}catch(error){status(error instanceof SyntaxError?'Tệp không phải JSON hợp lệ.':error.message);}finally{input.value='';}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)setOpen(false);});
  window.addEventListener('beforeunload',e=>{if(JSON.stringify(design)!==saved){e.preventDefault();e.returnValue='';}});
  apply();
})();
