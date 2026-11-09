// Local review adapter only. Never deployed as a Pages Function.
// No real credentials are read and ALL outbound server fetches are mocked.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { onRequest } from '../functions/api/enquiry.js';
const args=process.argv.slice(2);
const root=path.resolve(args.find(a=>a.startsWith('--dir='))?.slice(6)||'dist');
const port=Number(args.find(a=>a.startsWith('--port='))?.slice(7)||4392);
// Explicit local-only switch: inspect a synthetic mail draft without opening an email app.
const captureEmail=args.includes('--capture-email');
const testSitekey='1x00000000000000000000AA';
const contact=await fs.readFile(path.join(root,'contact/index.html'),'utf8');
if(contact.includes('data-online="true"')&&!contact.includes(`data-sitekey="${testSitekey}"`))throw Error('Online local review requires the official public test sitekey. Never use a production key.');
const metrics={requests:0,verification:0,providerCalls:0,acceptedMessages:0,requestIds:[]};
const accepted=new Map();
globalThis.fetch=async(url,options)=>{
  if(url==='https://challenges.cloudflare.com/turnstile/v0/siteverify') {metrics.verification++;return Response.json({success:true,hostname:'kaiyuselect.com.au',action:'enquiry'});}
  if(url!=='https://api.resend.com/emails')throw Error('Outbound network blocked in local review');
  metrics.providerCalls++;
  const body=JSON.parse(options.body);const key=options.headers['Idempotency-Key'];metrics.requestIds.push(key);
  if(body.subject.includes('[test:slow]'))await new Promise(r=>setTimeout(r,4000));
  if(body.subject.includes('[test:failure]'))return new Response('{}',{status:503});
  if(accepted.has(key)&&accepted.get(key)!==options.body)return new Response('{}',{status:409});
  if(!accepted.has(key)){accepted.set(key,options.body);metrics.acceptedMessages++;}
  return Response.json({id:'mock-accepted-'+key});
};
http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,`http://127.0.0.1:${port}`);
  if(captureEmail&&url.pathname.startsWith('/_review/email-draft/')){
    res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});
    return res.end(`LOCAL EMAIL DRAFT CAPTURE — NOT SENT\nTo: ${decodeURIComponent(url.pathname.slice('/_review/email-draft/'.length))}\nSubject: ${url.searchParams.get('subject')||''}\n\n${url.searchParams.get('body')||''}`);
  }
  if(url.pathname==='/_review/metrics'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(metrics));}
  if(url.pathname==='/api/enquiry'){
    metrics.requests++;let body='';for await(const chunk of req){body+=chunk;if(body.length>22000){res.writeHead(413);return res.end();}}
    if(body.includes('[test:edge]')){res.writeHead(429,{'Content-Type':'text/html'});return res.end('<html>Local simulated edge block</html>');}
    const response=await onRequest({request:new Request('https://kaiyuselect.com.au/api/enquiry',{method:req.method,headers:{Origin:'https://kaiyuselect.com.au','Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1'},...(req.method==='POST'?{body}:{})}),env:{CONTACT_ONLINE_ENABLED:contact.includes('data-online="true"')?'true':'false',TURNSTILE_SECRET_KEY:'test-only',RESEND_API_KEY:'test-only',CONTACT_FROM_EMAIL:'review@example.com',ENQUIRY_LIMITS:{get:async()=>null,put:async()=>{}}}});
    res.writeHead(response.status,Object.fromEntries(response.headers));return res.end(await response.text());
  }
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(file!==root&&!file.startsWith(root+path.sep))throw Error('Invalid path');
  if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
  const type=path.extname(file);let bytes=await fs.readFile(file);
  if(captureEmail&&['.html','.js'].includes(type))bytes=Buffer.from(bytes.toString().replaceAll('mailto:',`http://127.0.0.1:${port}/_review/email-draft/`));
  if(type==='.html')bytes=Buffer.from(bytes.toString().replace(/<body([^>]*)>/,'<body$1><aside style="padding:12px 20px;background:#f4eabf;color:#172727;font:14px sans-serif">LOCAL REVIEW ONLY — all email delivery is simulated. No email is sent.</aside>'));
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.xml':'application/xml'})[type]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(bytes);
}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Isolated review: http://127.0.0.1:${port}/contact — no real email delivery.`));
