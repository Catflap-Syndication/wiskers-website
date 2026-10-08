const systemTheme=()=>matchMedia('(prefers-color-scheme: dark)').matches?'night':'day';
try{const theme=localStorage.getItem('wiskers-theme');document.documentElement.dataset.theme=['day','night','twilight'].includes(theme)?theme:systemTheme()}catch{document.documentElement.dataset.theme=systemTheme()}
document.addEventListener('DOMContentLoaded',()=>{
 const meta=document.querySelector('meta[name="theme-color"]');
 const theme=document.documentElement.dataset.theme;
 if(meta)meta.content=theme==='day'?'#f3f0e9':theme==='night'?'#000000':'#160f24';
 document.querySelector('[data-forget-theme]')?.addEventListener('click',()=>{
  try{localStorage.removeItem('wiskers-theme')}catch{}
  document.documentElement.dataset.theme=systemTheme();
  if(meta)meta.content=systemTheme()==='day'?'#f3f0e9':'#000000';
  const status=document.querySelector('#preference-status');
  if(status)status.textContent='Saved theme removed. The site now follows your device preference.';
 });
});
