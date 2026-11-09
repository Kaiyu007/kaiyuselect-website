import { matchesConcept, nextSlide, previewMessage } from '../lib/demo-state.js';
document.querySelectorAll<HTMLDetailsElement>('.demo-mobile-nav').forEach(menu => {
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.open=false));
  menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;menu.querySelector('summary')?.focus();}});
});
document.querySelectorAll<HTMLElement>('[data-demo-enquiry]').forEach(root=>{
  const button=root.querySelector<HTMLButtonElement>('[data-preview-request]')!;
  button.disabled=false;
  root.addEventListener('input',event=>{
    if(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement)event.target.setCustomValidity('');
    root.querySelector('[data-demo-result]')!.textContent='';
  });
  button.addEventListener('click',()=>{
    const fields=[...root.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('[data-field]')];
    fields.forEach(field=>field.setCustomValidity(field.required&&!field.value.trim()?'Please complete this sample field.':''));
    const invalid=fields.find(field=>!field.checkValidity());
    if(invalid){root.querySelector('[data-demo-result]')!.textContent='Please complete the required sample fields.';invalid.reportValidity();invalid.focus();return;}
    const values=Object.fromEntries(fields.map(field=>[field.dataset.field,field.value.trim()]));
    root.querySelector('[data-demo-result]')!.textContent=previewMessage(values,root.dataset.kind);
  });
});
document.querySelectorAll<HTMLElement>('[data-comparison]').forEach(root=>{
  const range=root.querySelector('input')!;
  range.addEventListener('input',()=>{
    root.querySelector<HTMLElement>('.comparison-images')!.style.setProperty('--reveal',`${range.value}%`);
    root.querySelector('output')!.textContent=`${range.value}% after`;
    range.setAttribute('aria-valuetext',`${range.value}% after`);
  });
});
document.querySelectorAll<HTMLElement>('[data-catalog]').forEach(root=>{
  const items=JSON.parse(root.dataset.items!);let category='all';let selected=items[0];
  const filter=()=>{
    const beds=Number(root.querySelector<HTMLSelectElement>('[data-bed-filter]')?.value||0);
    let count=0;
    root.querySelectorAll<HTMLElement>('[data-catalog-card]').forEach(card=>{card.hidden=!matchesConcept({category:card.dataset.category,beds:Number(card.dataset.beds)},category,beds);if(!card.hidden)count++;});
    root.querySelector('[data-filter-count]')!.textContent=`${count} ${count===1?'concept':'concepts'}`;
    root.querySelector<HTMLElement>('[data-filter-empty]')!.hidden=count>0;
    root.querySelector<HTMLElement>('.catalog-detail')!.hidden=count===0;
    if(count&&!matchesConcept(selected,category,beds))selectItem(items.find((item:{category:string;beds?:number})=>matchesConcept(item,category,beds)));
  };
  root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.filter!;root.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filter();
  }));
  root.querySelector('[data-bed-filter]')?.addEventListener('change',filter);
  const showImage=(index:number)=>{
    const image=root.querySelector<HTMLImageElement>('[data-detail-image]')!;
    const photo=selected.photos[index];
    image.srcset=photo.srcset; image.src=photo.src; image.width=photo.width; image.height=photo.height;
    image.alt=`AI-generated fictional concept: ${selected.title}, view ${index+1}`;
    root.querySelectorAll<HTMLElement>('[data-image-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.imageView)===index)));
  };
  const selectItem=(item:typeof selected)=>{
    selected=item;
    root.querySelector('[data-detail-title]')!.textContent=selected.title;
    root.querySelector('[data-detail-description]')!.textContent=selected.description;
    root.querySelector('[data-detail-facts]')!.textContent=selected.facts||'Concept only. Materials and production details would be agreed with a real business.';
    showImage(0);
  };
  root.querySelectorAll<HTMLButtonElement>('[data-image-view]').forEach(button=>button.addEventListener('click',()=>showImage(Number(button.dataset.imageView))));
  root.querySelectorAll<HTMLButtonElement>('[data-select-item]').forEach(button=>button.addEventListener('click',()=>{
    selectItem(items.find((item:{id:string})=>item.id===button.dataset.selectItem));
    root.querySelector<HTMLElement>('.catalog-detail')!.focus({preventScroll:true});root.querySelector('.catalog-detail')!.scrollIntoView({behavior:'instant',block:'start'});
  }));
});
document.querySelectorAll<HTMLElement>('[data-filter-gallery]').forEach(root=>{
  root.querySelectorAll<HTMLButtonElement>('[data-gallery-filter]').forEach(button=>button.addEventListener('click',()=>{
    const category=button.dataset.galleryFilter;let count=0;
    root.querySelectorAll<HTMLElement>('[data-gallery-item]').forEach(card=>{card.hidden=category!=='all'&&card.dataset.galleryItem!==category;if(!card.hidden)count++;});
    root.querySelectorAll('[data-gallery-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    root.querySelector('[data-gallery-count]')!.textContent=`${count} ${count===1?'concept':'concepts'} shown`;
  }));
});
document.querySelectorAll<HTMLElement>('[data-switcher]').forEach(root=>{
  root.querySelectorAll<HTMLButtonElement>('[data-switch]').forEach(button=>button.addEventListener('click',()=>{
    root.querySelectorAll<HTMLElement>('[data-panel]').forEach(panel=>panel.hidden=panel.dataset.panel!==button.dataset.switch);
    root.querySelectorAll('[data-switch]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }));
});
document.querySelectorAll<HTMLElement>('[data-lookbook]').forEach(root=>{
  const slides=[...root.querySelectorAll<HTMLElement>('[data-slide]')];let index=0;
  root.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button=>button.addEventListener('click',()=>{
    index=nextSlide(index,Number(button.dataset.direction),slides.length);
    slides.forEach((s,i)=>s.hidden=i!==index);root.querySelector('[data-slide-count]')!.textContent=`${index+1} / ${slides.length}`;
  }));
});
document.querySelectorAll<HTMLButtonElement>('[data-open-dialog]').forEach(button=>{
  const dialog=document.getElementById(button.dataset.openDialog!) as HTMLDialogElement;
  button.addEventListener('click',()=>dialog.showModal());
  dialog.querySelector('[data-close-dialog]')?.addEventListener('click',()=>dialog.close());
});
