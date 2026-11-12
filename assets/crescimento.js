(()=>{
'use strict';
// WHO Child Growth Standards, anthro b776d8a12b1c97369c748b561159fd2ec4f4db58.
// Daily LMS by sex and age (days 0–1826), from data-raw/growthstandards.
const byId=id=>document.getElementById(id),value=id=>byId(id)?.value||'';
let tables,loading;
function reference([l,m,s],z){return l===0?m*Math.exp(s*z):m*(1+l*s*z)**(1/l);}
function score(row,x,restricted){
 if(!row||!(x>0))return null;
 const [l,m,s]=row;
 const z=l===0?Math.log(x/m)/s:Math.expm1(l*Math.log(x/m))/(l*s);
 if(!restricted||Math.abs(z)<=3)return z;
 const sign=Math.sign(z),third=reference(row,sign*3),second=reference(row,sign*2);
 return sign*(3+(x-third)/(third-second));
}
function age(birth,date){if(!birth||!date)return NaN;return (Date.parse(date)-Date.parse(birth))/86400000;}
function chart(series,rows,unit){
 const canvas=byId('growthChart');if(!canvas)return;
 const width=canvas.width=720,height=canvas.height=280,ctx=canvas.getContext('2d');
 canvas.style.width='100%';canvas.style.height='100%';ctx.clearRect(0,0,width,height);
 if(!series)return;
 const curves=[-2,0,2].map(z=>series.flatMap((r,d)=>d%15===0||d===1826?[{day:d,v:reference(r,z)}]:[]));
 const values=[...curves.flat(),...rows].map(p=>p.v);
 const min=Math.floor(Math.min(...values)),max=Math.ceil(Math.max(...values))+1;
 const X=d=>48+d/1826*648,Y=v=>235-(v-min)/(max-min)*200;
 function line(points,color,dots=false){ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;ctx.beginPath();points.forEach(({day,v},i)=>i?ctx.lineTo(X(day),Y(v)):ctx.moveTo(X(day),Y(v)));ctx.stroke();if(dots)for(const {day,v} of points){ctx.beginPath();ctx.arc(X(day),Y(v),4,0,2*Math.PI);ctx.fill();}}
 curves.forEach((curve,i)=>line(curve,['#966420','#287254','#966420'][i]));line(rows,'#234da4',true);
 ctx.fillStyle='#283c35';ctx.font='13px sans-serif';ctx.fillText(unit+' · OMS −2, mediana e +2 Z   |   Azul: medidas registradas',8,15);
 for(let m=0;m<=60;m+=12)ctx.fillText(m+' m',X(m*30.4375)-8,260);
 for(let i=0;i<=4;i++){const v=min+(max-min)*i/4;ctx.fillText(v.toFixed(1),5,Y(v));}
}
function render(){
 if(!byId('pu-peso'))return;
 const p=Number(value('pu-peso')),h=Number(value('pu-alt')),pc=Number(value('pu-pc'));
 const day=age(value('pu-nasc'),value('pu-data')),sex=['Menino','Menina'].indexOf(value('pu-sexo')),pos=value('pu-posicao-medida');
 const gest=Number(value('pu-ig')),pre=gest>0&&gest<37&&day<731;
 const eligible=Number.isInteger(day)&&day>=0&&day<=1826&&sex>=0&&!pre;
 const length=h>10&&pos&&eligible?h+(day<731&&pos==='H'?0.7:day>=731&&pos==='L'?-0.7:0):null;
 const rawBmi=p>0&&h>10?p/(h/100)**2:null;
 const vals={peso:p,alt:length,pc,imc:length&&p>0?p/(length/100)**2:null};
 byId('pu-imc').value=rawBmi?rawBmi.toFixed(1)+' kg/m²':'';
 for(const [key,v] of Object.entries(vals)){
   const out=byId('st-pu-'+key);if(!out)continue;
   const z=eligible&&tables&&score(tables[key][sex][day],v,['peso','imc'].includes(key));
   out.textContent=typeof z==='number'&&Number.isFinite(z)?'OMS Z '+z.toFixed(2).replace('.',','):!p&&!h&&!pc?'':pre?'Prematuridade: avaliar referência e idade corrigida.':!eligible?'Conferir sexo, datas e faixa da curva (0–5 anos).':!pos&&h>10&&['alt','imc'].includes(key)?'Informe a posição da medida.':'';
 }
 if(!tables&&eligible&&!loading){loading=fetch('assets/oms-lms.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{tables=data;render();}).catch(()=>{byId('st-pu-peso').textContent='Referência da OMS indisponível.';}).finally(()=>loading=null);}
 const metric=value('pu-chart-type')||'peso',points=[];
 if(eligible&&tables){
  for(const a of window.FluxoAPS?.registros('pu')||[]){const d=a.dados;if(a.tipo!=='Puericultura'||d['pu-nasc']!==value('pu-nasc')||d['pu-sexo']!==value('pu-sexo')||a.id===ATENDIMENTO_EM_EDICAO)continue;
   const n=age(d['pu-nasc'],d['pu-data']);if(!Number.isInteger(n)||n<0||n>day)continue;
   let v=Number(d['pu-'+metric]);if(metric==='alt'){const pos=d['pu-posicao-medida'];if(!pos)continue;v+=n<731&&pos==='H'?0.7:n>=731&&pos==='L'?-0.7:0;}
   if(v>0)points.push({day:n,v});
  }
  if(vals[metric]>0)points.push({day,v:vals[metric]});
 }
 chart(eligible&&tables?tables[metric][sex]:null,points.sort((a,b)=>a.day-b.day),metric==='peso'?'Peso (kg)':'Medida (cm)');
}
window.CrescimentoOMS={render,score};
document.addEventListener('change',e=>{if(['pu-posicao-medida','pu-data','pu-ig','pu-sexo','pu-nasc','pu-cpf'].includes(e.target.id))render();});
})();
