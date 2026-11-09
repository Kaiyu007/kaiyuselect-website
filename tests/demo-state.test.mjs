import test from 'node:test';
import assert from 'node:assert/strict';
import {matchesConcept,nextSlide,previewMessage} from '../src/lib/demo-state.js';

test('property filters combine type and minimum bedrooms, including an empty result',()=>{
  const items=[{category:'House',beds:3},{category:'House',beds:4},{category:'Apartment',beds:2}];
  assert.equal(items.filter(i=>matchesConcept(i,'all',0)).length,3);
  assert.equal(items.filter(i=>matchesConcept(i,'House',4)).length,1);
  assert.equal(items.filter(i=>matchesConcept(i,'Apartment',3)).length,0);
  assert.equal(items.filter(i=>matchesConcept(i,'all',3)).length,2);
  assert.equal(matchesConcept({category:'Rings'},'Rings'),true);
  assert.equal(matchesConcept({category:'Rings'},'Earrings'),false);
});
test('lookbook navigation wraps in both directions and handles an empty collection',()=>{
  assert.equal(nextSlide(0,-1,3),2);assert.equal(nextSlide(2,1,3),0);
  assert.equal(nextSlide(0,1,3),1);assert.equal(nextSlide(0,1,0),0);
});
test('local preview cannot be mistaken for a confirmed or sent booking',()=>{
  const message=previewMessage({name:'Alex Sample',choice:'General care',date:'2026-12-01'},'appointment enquiry');
  assert.match(message,/Preview only/);assert.match(message,/has not been sent, confirmed or booked/);
  assert.match(message,/No information has been stored/);assert.match(message,/2026-12-01/);
  assert.doesNotMatch(previewMessage({name:'Sample',choice:'Concept'},'brief'),/undefined|null/);
});
