/* StockFuerte - capa de datos: localStorage. Para usar una BD real, reemplazar load()/save(). */
const K='stockfuerte_db',UN=['unidad','metro','kilo','galón'],MOT=['Venta','Merma','Ajuste'];
const NAME={inicio:'Inicio',productos:'Productos',proveedores:'Proveedores',movimientos:'Registrar movimiento',historial:'Historial',reportes:'Reportes',usuarios:'Usuarios'};
const ROLES={Propietario:Object.keys(NAME),Encargado:['inicio','productos','proveedores','movimientos','historial','reportes'],Vendedor:['inicio','productos']};
const $=s=>document.querySelector(s),h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const r2=x=>Math.round(x*100)/100,pad=n=>String(n).padStart(6,'0'),fdt=s=>new Date(s).toLocaleString('es-PE');
const load=()=>{try{return JSON.parse(localStorage.getItem(K))}catch(e){return null}},save=()=>localStorage.setItem(K,JSON.stringify(db));
let db=load(),me=JSON.parse(sessionStorage.getItem('me')||'null'),F={};
function seed(){db={seq:{c:0,m:0,p:0,pv:0,u:0,k:0},cat:[],prov:[],usr:[],prod:[],mov:[]};
 ['Herramientas','Materiales de construcción','Plomería','Eléctricos','Pinturas','Ferretería general'].forEach(n=>db.cat.push({id:++db.seq.k,nombre:n}));
 ['Importaciones Eléctricas Perú S.A.C.','Distribuidora Ferretera Norte S.A.C.','Pinturas y Acabados del Norte S.A.C.'].forEach(n=>db.prov.push({id:++db.seq.pv,nombre:n,tel:''}));
 [['Propietario','Propietario Casa Fuerte','propietario@casafuerte.pe'],['Encargado','Encargado de Almacén','encargado@casafuerte.pe'],['Vendedor','Vendedor','vendedor@casafuerte.pe']].forEach(u=>db.usr.push({id:++db.seq.u,rol:u[0],nombres:u[1],correo:u[2],clave:'1234'}));
 [['ELE-001','Cable THW 14 AWG',4,0,'metro',100],['CON-001','Cemento Sol 42.5 kg',2,0,'unidad',20],['PIN-001','Pintura látex blanco 1 gal',5,0,'galón',10],['PLO-001','Tubo PVC 2" desagüe',3,0,'unidad',15],['HER-001','Martillo carpintero 16 oz',1,0,'unidad',5]]
 .forEach(p=>db.prod.push({id:++db.seq.p,codigo:p[0],nombre:p[1],cat:p[2],unidad:p[4],stock:0,min:p[5],activo:1}));
 db.usr[0].id==1&&(me={...db.usr[1]});[['ELE-001',250,1],['CON-001',40,2],['PIN-001',8,3],['PLO-001',30,2],['HER-001',12,2]].forEach(e=>mov('ENTRADA',e[0],e[1],e[2]));me=null;save()}
db||seed();
function mov(tipo,code,q,prov,mot){code=String(code).trim().toUpperCase();const p=db.prod.find(x=>x.codigo===code&&x.activo);q=+q;
 if(!p)return{err:'Producto no existe'};if(!(q>0))return{err:'La cantidad debe ser un número mayor que 0'};
 if(tipo=='ENTRADA'&&!prov)return{err:'Seleccione el proveedor de origen'};
 if(tipo=='SALIDA'){if(!mot)return{err:'Seleccione el motivo'};if(q>p.stock)return{err:'Stock insuficiente. Disponible: '+p.stock}}
 p.stock=r2(p.stock+(tipo=='ENTRADA'?q:-q));const c=++db.seq.c;db.mov.push({id:++db.seq.m,c,fecha:new Date().toISOString(),tipo,pid:p.id,prov:+prov||null,mot:mot||'',q,uid:me?me.id:2,anulado:0});save();return{c}}
const toast=(t,e)=>{const x=$('#toast');x.textContent=t;x.style.background=e?'#dc2626':'#16a34a';x.style.display='block';setTimeout(()=>x.style.display='none',3200)};
const can=()=>me.rol!='Vendedor',cat=id=>(db.cat.find(c=>c.id==id)||{}).nombre,pv=id=>(db.prov.find(c=>c.id==id)||{}).nombre||'',pr=id=>db.prod.find(p=>p.id==id);
const opts=(a,v)=>a.map(o=>`<option value="${h(o[0])}" ${o[0]==v?'selected':''}>${h(o[1])}</option>`).join('');
const tbl=(hd,rows)=>`<div class="tw"><table><tr>${hd.map(x=>`<th>${x}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${hd.length}">Sin registros</td></tr>`}</table></div>`;
const est=p=>p.stock<=p.min?'<span class="bd x">Stock bajo</span>':'<span class="bd">Normal</span>';
const btn=(a,i,t,c='')=>`<button class="btn s ${c}" data-a="${a}" data-i="${i}">${t}</button>`;
function modal(title,fs,ok){const d=$('#dlg');d.innerHTML=`<form><h3>${title}</h3>${fs.map(f=>`<label>${f.l}${f.t=='select'?`<select name="${f.n}">${opts(f.o,f.v)}</select>`:`<input name="${f.n}" type="${f.t||'text'}" step="any" value="${h(f.v??'')}" ${f.ro?'readonly':''}>`}</label>`).join('')}<p class="err"></p><div class="row"><button class="btn">Guardar</button><button type="button" class="btn g" id="x">Cerrar</button></div></form>`;
 d.querySelector('form').onsubmit=e=>{e.preventDefault();const r=ok(Object.fromEntries(new FormData(e.target)));if(r)d.querySelector('.err').textContent=r;else{save();d.close();go()}};$('#x').onclick=()=>d.close();d.showModal()}
/* ---- acciones ---- */
const prodForm=(p)=>{const n=!p;modal(n?'Registrar producto':'Modificar producto',[{n:'codigo',l:'Código',v:p&&p.codigo,ro:!n},{n:'nombre',l:'Nombre',v:p&&p.nombre},{n:'cat',l:'Categoría',t:'select',o:db.cat.map(c=>[c.id,c.nombre]),v:p&&p.cat},{n:'unidad',l:'Unidad de medida',t:'select',o:UN.map(u=>[u,u]),v:p&&p.unidad},{n:'min',l:'Stock mínimo',t:'number',v:p?p.min:0}],v=>{
 const code=(v.codigo||'').trim().toUpperCase(),nom=v.nombre.trim();if(!/^[A-Z0-9-]{3,20}$/.test(code))return'El código debe tener de 3 a 20 letras, números o guiones';if(!nom)return'Complete el nombre del producto';if(!(+v.min>=0)||v.min==='')return'El stock mínimo debe ser un número mayor o igual a 0';
 if(n){const x=db.prod.find(q=>q.codigo==code);if(x&&x.activo)return'PRODUCTO YA SE ENCUENTRA REGISTRADO';
  if(x){Object.assign(x,{nombre:nom,cat:+v.cat,unidad:v.unidad,min:+v.min,activo:1});toast('Producto reactivado')}else{db.prod.push({id:++db.seq.p,codigo:code,nombre:nom,cat:+v.cat,unidad:v.unidad,stock:0,min:+v.min,activo:1});toast('Producto registrado correctamente')}}
 else{Object.assign(p,{nombre:nom,cat:+v.cat,unidad:v.unidad,min:+v.min});toast('Producto modificado correctamente')}})};
const A={
 newProd:()=>prodForm(),editProd:i=>prodForm(pr(i)),
 delProd:i=>{if(confirm('¿Dar de baja este producto? Se conserva su historial.')){pr(i).activo=0;save();toast('Producto dado de baja');go()}},
 newCat:()=>{const n=(prompt('Nombre de la nueva categoría')||'').trim();if(!n)return;if(db.cat.some(c=>c.nombre.toLowerCase()==n.toLowerCase()))return toast('La categoría ya existe',1);db.cat.push({id:++db.seq.k,nombre:n});save();go()},
 newProv:()=>provForm(),editProv:i=>provForm(db.prov.find(x=>x.id==i)),
 delProv:i=>{if(db.mov.some(m=>m.prov==i))return toast('NO SE PUEDE: el proveedor tiene movimientos',1);if(confirm('¿Eliminar proveedor?')){db.prov=db.prov.filter(x=>x.id!=i);save();go()}},
 editMov:i=>{const m=db.mov.find(x=>x.id==i);modal('Modificar entrada N.º '+pad(m.c),[{n:'prov',l:'Proveedor',t:'select',o:db.prov.map(x=>[x.id,x.nombre]),v:m.prov},{n:'q',l:'Cantidad',t:'number',v:m.q}],v=>{const q=+v.q,p=pr(m.pid);if(!(q>0))return'La cantidad debe ser un número mayor que 0';
  if(p.stock+q-m.q<0)return'NO SE PUEDE: el stock quedaría negativo';p.stock=r2(p.stock+q-m.q);m.q=q;m.prov=+v.prov;toast('Entrada modificada y stock ajustado')})},
 anMov:i=>{const m=db.mov.find(x=>x.id==i),p=pr(m.pid),d=m.tipo=='ENTRADA'?-m.q:m.q;if(p.stock+d<0)return toast('NO SE PUEDE: ya se usó parte de esa mercadería y el stock quedaría negativo',1);
  if(confirm('¿Anular el movimiento? Se revierte el stock.')){p.stock=r2(p.stock+d);m.anulado=1;save();toast('Movimiento anulado y stock revertido');go()}},
 newUsr:()=>usrForm(),editUsr:i=>usrForm(db.usr.find(x=>x.id==i)),
 delUsr:i=>{if(i==me.id)return toast('No puede eliminar su propio usuario',1);if(db.mov.some(m=>m.uid==i))return toast('NO SE PUEDE: el usuario tiene movimientos',1);db.usr=db.usr.filter(x=>x.id!=i);save();go()},
 csv:t=>{const [hd,rows]=rep(t);const s=[hd,...rows].map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+s],{type:'text/csv'}));a.download='reporte_'+t+'.csv';a.click()},
 print:()=>print(),
 bak:()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(db)],{type:'application/json'}));a.download='stockfuerte_respaldo.json';a.click()},
 rst:()=>{if(confirm('Se borrarán todos los datos y se restauran los de ejemplo. ¿Continuar?')){seed();me=null;sessionStorage.removeItem('me');go()}}};
const provForm=p=>modal(p?'Modificar proveedor':'Registrar proveedor',[{n:'nombre',l:'Razón social',v:p&&p.nombre},{n:'tel',l:'Teléfono',v:p&&p.tel}],v=>{if(!v.nombre.trim())return'Complete la razón social';p?Object.assign(p,{nombre:v.nombre.trim(),tel:v.tel}):db.prov.push({id:++db.seq.pv,nombre:v.nombre.trim(),tel:v.tel});toast('Proveedor guardado')});
const usrForm=u=>modal(u?'Modificar usuario':'Registrar usuario',[{n:'nombres',l:'Nombres',v:u&&u.nombres},{n:'correo',l:'Correo',v:u&&u.correo},{n:'rol',l:'Rol',t:'select',o:Object.keys(ROLES).map(r=>[r,r]),v:u&&u.rol},{n:'clave',l:'Contraseña',v:u&&u.clave}],v=>{if(!v.nombres.trim()||!/^\S+@\S+$/.test(v.correo)||v.clave.length<4)return'Complete nombres, un correo válido y una contraseña de 4+ caracteres';if(db.usr.some(x=>x.correo==v.correo&&x!==u))return'El correo ya está registrado';
 u?Object.assign(u,v):db.usr.push({id:++db.seq.u,...v});toast('Usuario guardado')});
function rep(t){return t=='stock'?[['Código','Producto','Categoría','Unidad','Stock','Mínimo','Estado'],db.prod.filter(p=>p.activo).map(p=>[p.codigo,p.nombre,cat(p.cat),p.unidad,p.stock,p.min,p.stock<=p.min?'Stock bajo':'Normal'])]
 :[['Constancia','Fecha','Tipo','Código','Producto','Cantidad','Proveedor/Motivo','Usuario','Estado'],db.mov.slice().reverse().map(m=>[pad(m.c),fdt(m.fecha),m.tipo,pr(m.pid).codigo,pr(m.pid).nombre,m.q,pv(m.prov)||m.mot,(db.usr.find(u=>u.id==m.uid)||{}).nombres,m.anulado?'Anulado':'Vigente'])]}
/* ---- vistas ---- */
const V={
inicio:()=>{const a=db.prod.filter(p=>p.activo),b=a.filter(p=>p.stock<=p.min);return`<h2>Menú principal</h2><p class="hint">Ferretería Casa Fuerte · Control de almacén</p><div class="grid"><div class="card"><div class="k">${a.length}</div>Productos activos</div><div class="card"><div class="k">${b.length}</div>Con stock bajo</div><div class="card"><div class="k">${db.mov.filter(m=>!m.anulado).length}</div>Movimientos vigentes</div><div class="card"><div class="k">${db.prov.length}</div>Proveedores</div></div>
<div class="card"><b>Productos con stock bajo</b>${tbl(['Código','Producto','Stock','Mínimo'],b.map(p=>[p.codigo,h(p.nombre),p.stock,p.min]))}</div>
${me.rol=='Propietario'?`<div class="card"><b>Datos</b> <span class="hint">(se guardan en este navegador)</span><div class="bar">${btn('bak','','Exportar respaldo','g')}${btn('rst','','Restablecer datos de ejemplo','r')}</div></div>`:''}`},
productos:()=>{const q=(F.q||'').toLowerCase(),l=db.prod.filter(p=>p.activo&&(!F.cat||p.cat==F.cat)&&(p.codigo.toLowerCase().includes(q)||p.nombre.toLowerCase().includes(q)));
 return`<h2>Productos</h2><div class="bar"><input class="s" data-f="q" placeholder="Buscar por código o nombre" value="${h(F.q)}"><select data-f="cat"><option value="">Todas las categorías</option>${opts(db.cat.map(c=>[c.id,c.nombre]),F.cat)}</select>${can()?btn('newProd','','Registrar producto')+btn('newCat','','+ Categoría','g'):''}</div>
 <div class="card">${tbl(['Código','Producto','Categoría','Unidad','Stock','Mínimo','Estado',...(can()?['Acciones']:[])],l.map(p=>[p.codigo,h(p.nombre),h(cat(p.cat)),p.unidad,p.stock,p.min,est(p),...(can()?[btn('editProd',p.id,'Modificar','g')+' '+btn('delProd',p.id,'Eliminar','r')]:[])]))}</div>`},
proveedores:()=>`<h2>Proveedores</h2><div class="bar">${btn('newProv','','Registrar proveedor')}</div><div class="card">${tbl(['Razón social','Teléfono','Acciones'],db.prov.map(x=>[h(x.nombre),h(x.tel),btn('editProv',x.id,'Modificar','g')+' '+btn('delProv',x.id,'Eliminar','r')]))}</div>`,
movimientos:()=>`<h2>Registrar movimiento</h2><div class="card" style="max-width:480px"><form id="mf"><label>Tipo<select name="t"><option>ENTRADA</option><option>SALIDA</option></select></label><label>Código del producto<input name="c" autocomplete="off" placeholder="Ej. ELE-001"></label><div class="info" id="inf">Ingrese un código</div>
<label id="lp">Proveedor de origen<select name="p"><option value="">— Seleccione —</option>${opts(db.prov.map(x=>[x.id,x.nombre]))}</select></label><label id="lm" style="display:none">Motivo<select name="m"><option value="">— Seleccione —</option>${MOT.map(x=>`<option>${x}</option>`).join('')}</select></label><label>Cantidad<input name="q" type="number" step="any" min="0"></label><p class="err" id="er"></p><button class="btn">Grabar movimiento</button></form></div>`,
historial:()=>{const q=(F.hq||'').toLowerCase(),l=db.mov.slice().reverse().filter(m=>(!F.tt||m.tipo==F.tt)&&pr(m.pid).codigo.toLowerCase().includes(q));
 return`<h2>Historial de movimientos</h2><div class="bar"><input class="s" data-f="hq" placeholder="Filtrar por código" value="${h(F.hq)}"><select data-f="tt"><option value="">Todos</option><option ${F.tt=='ENTRADA'?'selected':''}>ENTRADA</option><option ${F.tt=='SALIDA'?'selected':''}>SALIDA</option></select></div><div class="card">${tbl(['Constancia','Fecha','Tipo','Código','Producto','Cant.','Proveedor / Motivo','Usuario','Estado','Acciones'],l.map(m=>[pad(m.c),fdt(m.fecha),m.tipo,pr(m.pid).codigo,h(pr(m.pid).nombre),m.q,h(pv(m.prov)||m.mot),h((db.usr.find(u=>u.id==m.uid)||{}).nombres),m.anulado?'<span class="bd a">Anulado</span>':'<span class="bd">Vigente</span>',m.anulado?'':(m.tipo=='ENTRADA'?btn('editMov',m.id,'Modificar','g')+' ':'')+btn('anMov',m.id,'Anular','r')]))}</div>`},
reportes:()=>['stock','mov'].map(t=>{const[hd,r]=rep(t);return`<div class="card"><h2>${t=='stock'?'Reporte de stock':'Reporte de movimientos'}</h2><div class="bar">${btn('csv',t,'Descargar CSV')}${btn('print','','Imprimir','g')}</div>${tbl(hd,r.map(x=>x.map(h)))}</div>`}).join(''),
usuarios:()=>`<h2>Usuarios y roles</h2><div class="bar">${btn('newUsr','','Registrar usuario')}</div><div class="card">${tbl(['Nombres','Correo','Rol','Acciones'],db.usr.map(u=>[h(u.nombres),h(u.correo),u.rol,btn('editUsr',u.id,'Modificar','g')+' '+btn('delUsr',u.id,'Eliminar','r')]))}</div>`};
const B={movimientos:()=>{const f=$('#mf'),inf=$('#inf'),sync=()=>{const t=f.t.value;$('#lp').style.display=t=='ENTRADA'?'':'none';$('#lm').style.display=t=='SALIDA'?'':'none';const c=f.c.value.trim().toUpperCase(),p=db.prod.find(x=>x.codigo==c&&x.activo);inf.innerHTML=!c?'Ingrese un código':p?`<b>${h(p.nombre)}</b> · ${h(cat(p.cat))} · Stock actual: <b>${p.stock}</b> ${p.unidad}`:'Producto no existe'};
 f.oninput=sync;f.onsubmit=e=>{e.preventDefault();const r=mov(f.t.value,f.c.value,f.q.value,f.p.value,f.m.value);if(r.err){$('#er').textContent=r.err;return}toast('Constancia N.º '+pad(r.c)+': movimiento registrado correctamente');go()}}};
/* ---- arranque ---- */
function go(){const app=$('#app');if(!me){app.innerHTML=`<div class="card login"><h2>Stock<span style="color:var(--o)">Fuerte</span></h2><form id="lf"><label>Correo<input name="e" value="encargado@casafuerte.pe"></label><label>Contraseña<input name="k" type="password" value="1234"></label><p class="err" id="er"></p><button class="btn">Ingresar</button></form><p class="hint">Demo: propietario@, encargado@ o vendedor@casafuerte.pe · clave 1234</p></div>`;
  $('#lf').onsubmit=e=>{e.preventDefault();const f=e.target,u=db.usr.find(x=>x.correo==f.e.value.trim()&&x.clave==f.k.value);if(!u){$('#er').textContent='Correo o contraseña incorrectos';return}me=u;sessionStorage.setItem('me',JSON.stringify(u));go()};return}
 const ok=ROLES[me.rol],pg=location.hash.slice(2),page=ok.includes(pg)?pg:'inicio';
 app.innerHTML=`<header><b>Stock<span>Fuerte</span></b><nav>${ok.map(x=>`<a href="#/${x}" class="${x==page?'on':''}">${NAME[x]}</a>`).join('')}</nav><small>${h(me.nombres)} · ${me.rol} · <a href="#" id="out">Salir</a></small></header><main>${V[page]()}</main>`;
 $('#out').onclick=e=>{e.preventDefault();me=null;sessionStorage.removeItem('me');go()};(B[page]||(()=>{}))()}
document.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(a)A[a.dataset.a](a.dataset.i)});
document.addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.f;if(!k)return;F[k]=e.target.value;const p=e.target.selectionStart;go();const n=document.querySelector(`[data-f="${k}"]`);n.focus();try{n.setSelectionRange(p,p)}catch(x){}});
addEventListener('hashchange',go);go();
