import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/enquiry.js';
import { validateEnquiry, normaliseType, emailLink } from '../src/lib/enquiry.js';
const valid = {name:'Test Visitor',email:'test@example.com',type:'product',subject:'Pink ripple case',message:'Please confirm the available phone models.',website:'',token:'mock-token',requestId:'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'};
const env = () => ({CONTACT_ONLINE_ENABLED:'true',TURNSTILE_SECRET_KEY:'test-only',RESEND_API_KEY:'test-only',CONTACT_FROM_EMAIL:'test@example.com',ENQUIRY_LIMITS:{get:async()=>null,put:async()=>{}}});
const req = (body=valid, headers={}, method='POST') => new Request('https://kaiyuselect.com.au/api/enquiry',{method,headers:{Origin:'https://kaiyuselect.com.au','Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...headers},...(method==='POST'?{body:JSON.stringify(body)}:{})});
test('legacy links map correctly; validation rejects empty, malformed and injected fields',()=>{
 assert.equal(normaliseType('Product availability'),'product'); assert.equal(normaliseType('project'),'project'); assert.equal(normaliseType('wholesale'),'wholesale');
 assert.equal(validateEnquiry(valid).valid,true);
 for(const data of [{...valid,email:'not-email'},{...valid,subject:'Title\r\nBcc: other@example.com'},{...valid,name:' '},{...valid,message:'short'},{...valid,type:'unknown'}]) assert.equal(validateEnquiry(data).valid,false);
 assert.match(emailLink(valid),/^mailto:contact@kaiyuselect\.com\.au\?subject=Pink%20ripple%20case/);
});
test('disabled configuration fails closed; no requests leave the test process',async()=>{
 const old=globalThis.fetch; globalThis.fetch=async()=>{throw Error('Unexpected network call');};
 try {assert.equal((await onRequest({request:req(),env:{}})).status,503);} finally {globalThis.fetch=old;}
});
test('method, origin, content type, oversized body and malformed JSON are rejected',async()=>{
 const settings=env();
 assert.equal((await onRequest({request:req(valid,{},'GET'),env:settings})).status,405);
 assert.equal((await onRequest({request:req(valid,{Origin:'https://evil.example'}),env:settings})).status,403);
 assert.equal((await onRequest({request:req(valid,{'Content-Type':'text/plain'}),env:settings})).status,415);
 assert.equal((await onRequest({request:req({...valid,message:'x'.repeat(21000)}),env:settings})).status,413);
 const broken=new Request(req(),{body:'{'}); assert.equal((await onRequest({request:broken,env:settings})).status,400);
});
test('spam, field limits and rate limit prevent delivery',async()=>{
 const settings=env();
 for(const data of [{...valid,website:'spam'},{...valid,token:''},{...valid,email:'bad'},{...valid,requestId:'bad'}]) assert.equal((await onRequest({request:req(data),env:settings})).status,400);
 settings.ENQUIRY_LIMITS.get=async()=>'3'; assert.equal((await onRequest({request:req(),env:settings})).status,429);
});
test('mocked Turnstile failure, hostname and action mismatch never send email',async()=>{
 const old=globalThis.fetch;
 try {for(const proof of [{success:false},{success:true,hostname:'elsewhere.example',action:'enquiry'},{success:true,hostname:'kaiyuselect.com.au',action:'other'}]) {
 let calls=0;globalThis.fetch=async()=>{calls++;return Response.json(proof);};
 assert.equal((await onRequest({request:req(),env:env()})).status,400);assert.equal(calls,1);
 }} finally {globalThis.fetch=old;}
});
test('mocked provider acceptance, provider error and network failure are handled truthfully',async()=>{
 const old=globalThis.fetch;
 try {
 let calls=[];globalThis.fetch=async(url,options)=>{calls.push({url,options});return url.includes('siteverify')?Response.json({success:true,hostname:'kaiyuselect.com.au',action:'enquiry'}):Response.json({id:'mock-only'});};
 assert.equal((await onRequest({request:req(),env:env()})).status,200);
 const email=JSON.parse(calls[1].options.body);assert.deepEqual(email.to,['contact@kaiyuselect.com.au']);assert.equal(email.reply_to,valid.email);assert.ok(!email.html);assert.match(calls[1].options.headers['Idempotency-Key'],/^enquiry\//);
 globalThis.fetch=async(url)=>url.includes('siteverify')?Response.json({success:true,hostname:'kaiyuselect.com.au',action:'enquiry'}):new Response('{}',{status:500});
 assert.equal((await onRequest({request:req(),env:env()})).status,502);
 globalThis.fetch=async()=>{throw Error('offline');};assert.equal((await onRequest({request:req(),env:env()})).status,503);
 } finally {globalThis.fetch=old;}
});
