import { createHandler } from './handler.mjs';
const env=(key:string)=>Deno.env.get(key)||'';
const url=env('SUPABASE_URL'),anon=env('SUPABASE_ANON_KEY');
const users=new Set(env('ESF_AI_USER_IDS').split(',').map(s=>s.trim()).filter(Boolean));
const timeout=()=>AbortSignal.timeout(35000);
Deno.serve(createHandler({
 allowedOrigins:env('ESF_ALLOWED_ORIGINS').split(',').map(s=>s.trim()).filter(Boolean),
 authenticate:async(token:string)=>{
  const r=await fetch(url+'/auth/v1/user',{headers:{apikey:anon,Authorization:token},signal:timeout()});
  return r.ok?await r.json():null;
 },
 authorized:async(user:{id:string})=>users.has(user.id),
 consumeQuota:async(token:string)=>{
  const r=await fetch(url+'/rest/v1/rpc/esf_consumir_cota_ia',{method:'POST',headers:{apikey:anon,Authorization:token,'Content-Type':'application/json'},body:'{}',signal:timeout()});
  if(!r.ok)throw Error('Cota indisponível');return await r.json()===true;
 },
 complete:async({system,soap}:{system:string;soap:string})=>{
  const key=env('OPENAI_API_KEY'),model=env('ESF_OPENAI_MODEL');if(!key||!model)throw Error('Configuração ausente');
  const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model,store:false,max_completion_tokens:5000,response_format:{type:'json_object'},messages:[{role:'system',content:system},{role:'user',content:JSON.stringify({soap})}]}),signal:timeout()});
  if(!r.ok)throw Error('Provedor indisponível');const data=await r.json();return JSON.parse(data.choices?.[0]?.message?.content||'null');
 }
}));
