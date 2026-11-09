import test from 'node:test';
import assert from 'node:assert/strict';
import { createSubmissionState, sendEnquiry } from '../src/lib/contact-state.js';
import { createTurnstileController } from '../src/lib/turnstile.js';

const fields = {name:'Review',email:'review@example.com',type:'general',subject:'Test',message:'Synthetic local test.'};
test('pending submission blocks duplicates and captures an immutable snapshot',()=>{
  const state=createSubmissionState(()=> 'first-id');
  const data={...fields}; const payload=state.begin(data,'proof','');
  data.subject='Changed outside the request';
  assert.equal(payload.subject,'Test'); assert.ok(Object.isFrozen(payload));
  assert.equal(state.phase,'pending'); state.edit(); assert.equal(state.phase,'pending');
  assert.equal(state.begin(fields,'second-proof'),null);
  state.finish(false); assert.equal(state.phase,'idle');
});
test('failed unchanged retry keeps idempotency; changed validated content gets a new key',()=>{
  let n=0; const state=createSubmissionState(()=>`request-${++n}`);
  const first=state.begin(fields,'proof-1'); state.finish(false); state.edit();
  const retry=state.begin({...fields},'proof-2');
  assert.equal(first.requestId,retry.requestId); assert.equal(retry.token,'proof-2');
  state.finish(false);state.edit();
  assert.notEqual(state.begin({...fields,subject:'Different'},'proof-3').requestId,first.requestId);
});
test('accepted content stays protected against repeat submission even after a no-op edit',()=>{
  const state=createSubmissionState(()=> 'one-id');
  state.begin(fields,'proof'); state.finish(true);
  assert.equal(state.phase,'sent'); assert.equal(state.begin(fields,'proof'),null);
  state.edit(); assert.equal(state.phase,'idle'); assert.equal(state.begin({...fields},'new-proof'),null);
  assert.equal(state.phase,'sent');
});
function fixture(width=300) {
  const element={dataset:{sitekey:'public-test'},getBoundingClientRect:()=>({width})};
  const rendered=[],removed=[],reset=[],tokens=[],errors=[];
  const api={render:(el,options)=>{rendered.push(options);return `widget-${rendered.length}`;},remove:id=>removed.push(id),reset:id=>reset.push(id)};
  const controller=createTurnstileController(element,api,t=>tokens.push(t),()=>errors.push('unavailable'));
  return {controller,rendered,removed,reset,tokens,errors,element,api,setWidth:n=>width=n};
}
test('container width chooses compact below 300 and flexible at 300; same size does not duplicate',()=>{
  const f=fixture(286); f.controller.resize(); assert.equal(f.rendered[0].size,'compact');
  f.setWidth(271);f.controller.resize();assert.equal(f.rendered.length,1);
  f.setWidth(300);f.controller.resize();assert.equal(f.rendered[1].size,'flexible');assert.deepEqual(f.removed,['widget-1']);
  f.setWidth(600);f.controller.resize();assert.equal(f.rendered.length,2);
  assert.equal(f.rendered[1].tabindex,0);
});
test('resizing invalidates old tokens and ignores late callbacks from removed widgets',()=>{
  const f=fixture();f.controller.resize();f.rendered[0].callback('first-token');
  f.setWidth(280);f.controller.resize();assert.equal(f.tokens.at(-1),'');
  f.rendered[0].callback('stale-token');assert.equal(f.tokens.at(-1),'');
  f.rendered[1].callback('current-token');assert.equal(f.tokens.at(-1),'current-token');
  f.rendered[1]['expired-callback']();assert.equal(f.tokens.at(-1),'');
  f.rendered[1].callback('new-token');f.rendered[1]['timeout-callback']();assert.equal(f.tokens.at(-1),'');
});
test('reset, error and lifecycle cleanup invalidate tokens without duplicate removal',()=>{
  const f=fixture();f.controller.resize();f.controller.reset();assert.deepEqual(f.reset,['widget-1']);
  f.rendered[0]['error-callback']();assert.equal(f.errors.length,1);assert.equal(f.tokens.at(-1),'');
  f.controller.destroy();f.controller.destroy();f.controller.resize();
  assert.deepEqual(f.removed,['widget-1']);assert.equal(f.rendered.length,1);
  f.rendered[0].callback('late');assert.equal(f.tokens.at(-1),'');
});
test('hidden container waits for a usable width; rendering failure is recoverable',()=>{
  const f=fixture(0);f.controller.resize();assert.equal(f.rendered.length,0);
  f.setWidth(301);f.api.render=()=>{throw Error('Unavailable');};f.controller.resize();assert.equal(f.errors.length,1);
  f.api.render=(el,options)=>{f.rendered.push(options);return 'recovered';};f.controller.resize();assert.equal(f.rendered.length,1);
});
test('client transport safely handles HTML edge blocks and malformed success responses',async()=>{
  for(const response of [new Response('<html>edge block</html>',{status:429}),new Response('<html>upstream unavailable</html>',{status:503}),new Response('<html>not JSON</html>'),Response.json({ok:'true'}),Response.json(null)]) {
    const result=await sendEnquiry({...fields},async()=>response);
    assert.equal(result.ok,false);assert.ok(!result.message.includes('html'));assert.ok(!result.message.includes('SyntaxError'));
    assert.match(result.message,response.status===429?/Please wait/:/could not be confirmed/);
  }
});
test('client transport keeps JSON payload stable and reports only explicit acceptance',async()=>{
  let sent;const payload={...fields,requestId:'stable',token:'dummy'};
  assert.equal((await sendEnquiry(payload,async(url,options)=>{sent={url,options};return Response.json({ok:true});})).ok,true);
  assert.equal(sent.url,'/api/enquiry');assert.equal(sent.options.body,JSON.stringify(payload));assert.equal(sent.options.headers['Content-Type'],'application/json');
  assert.equal((await sendEnquiry(payload,async()=>{throw new Error('private provider detail');})).ok,false);
});
