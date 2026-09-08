const fs=require('node:fs'),path=require('node:path');
function build(){
 const folder=path.resolve(__dirname,'../supabase/functions/clever-processor');
 const prompt=fs.readFileSync(path.join(folder,'prompt.mjs'),'utf8').replace(/^export const /gm,'const ');
 const handler=fs.readFileSync(path.join(folder,'handler.mjs'),'utf8').replace(/^export function /gm,'function ');
 return '// Função Gemini ESF: arquivo único para o editor do Supabase.\n// Instalar a cota e atualizar o cliente autenticado antes de usar.\n'+prompt+'\n'+handler+'\nDeno.serve(createCleverProcessor({env:key=>Deno.env.get(key)||"",prompt:PROMPT_SOAP,log:event=>console.info(JSON.stringify(event))}));\n';
}
module.exports={build};
if(require.main===module){const target=path.resolve(process.argv[2]||path.join(__dirname,'../test-results/clever-processor.ts'));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,build());console.log('Arquivo único gerado: '+target);}
