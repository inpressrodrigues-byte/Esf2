import { createCleverProcessor } from './handler.mjs';
import { PROMPT_SOAP } from './prompt.mjs';
Deno.serve(createCleverProcessor({env:(key:string)=>Deno.env.get(key)||'',prompt:PROMPT_SOAP,log:event=>console.info(JSON.stringify(event))}));
