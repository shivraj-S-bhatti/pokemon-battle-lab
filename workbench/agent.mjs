// Agent-facing client: reads the same graph and analysis history as the workbench UI.
const [command='cases',caseId,...args]=process.argv.slice(2);
const base=process.env.WORKBENCH_URL||'http://127.0.0.1:4318';
let path,options;
switch(command){
 case 'cases':path='/api/cases';break;
 case 'context':path='/api/context?case='+encodeURIComponent(caseId);break;
 case 'affected':path='/api/affected?case='+encodeURIComponent(caseId)+'&member='+encodeURIComponent(args[0]);break;
 case 'catalog':path='/api/catalog?'+new URLSearchParams({[caseId]:args[0]});break;
 case 'analyze':{
  let raw='';for await(const chunk of process.stdin)raw+=chunk;
  const input=raw.trim()?JSON.parse(raw):{};path='/api/analyze';options={method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...input,caseId})};break;
 }
 default:throw Error('Use cases, context CASE, affected CASE MEMBER_OR_SET, catalog move|ability ID, or analyze CASE < request.json');
}
const response=await fetch(base+path,options);const payload=await response.json();
if(!response.ok){console.error(JSON.stringify(payload));process.exitCode=1;}else console.log(JSON.stringify(payload,null,2));
