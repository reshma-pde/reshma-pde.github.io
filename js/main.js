/* theme */
(function(){
  var root=document.documentElement,btn=document.getElementById('theme');
  try{var s=localStorage.getItem('theme');if(s)root.dataset.theme=s;}catch(e){}
  function label(){btn.setAttribute('aria-label',root.dataset.theme==='dark'?'Switch to light theme':'Switch to dark theme');}
  label();
  btn.addEventListener('click',function(){
    root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
    try{localStorage.setItem('theme',root.dataset.theme);}catch(e){}
    label();
  });
})();

/* mobile menu */
(function(){
  var btn=document.getElementById('menu'),nav=document.getElementById('navlinks');
  function set(open){nav.classList.toggle('open',open);btn.setAttribute('aria-expanded',open);btn.setAttribute('aria-label',open?'Close menu':'Open menu');}
  btn.addEventListener('click',function(){set(!nav.classList.contains('open'));});
  nav.addEventListener('click',function(e){if(e.target.closest('a'))set(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){set(false);btn.focus();}});
  document.addEventListener('click',function(e){if(!e.target.closest('.nav'))set(false);});
  window.matchMedia('(min-width: 981px)').addEventListener('change',function(){set(false);});
})();

/* nav: mark the section in view */
(function(){
  var links=[].slice.call(document.querySelectorAll('.nav a.link'));
  var map={};links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a;});
  if(!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting)return;
      links.forEach(function(a){a.removeAttribute('aria-current');});
      var a=map[e.target.id];if(a)a.setAttribute('aria-current','true');
    });
  },{rootMargin:'-45% 0px -50% 0px'});
  Object.keys(map).forEach(function(id){var s=document.getElementById(id);if(s)io.observe(s);});
  io.observe(document.querySelector('.hero'));
})();

/* results: count up and fill bars when scrolled into view */
(function(){
  var cards=[].slice.call(document.querySelectorAll('.metric'));
  var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!('IntersectionObserver' in window)){cards.forEach(function(c){c.classList.add('in');});return;}
  cards.forEach(function(c){
    var b=c.querySelector('.big'),final=b.textContent;
    b.dataset.final=final;b.setAttribute('role','img');b.setAttribute('aria-label',final);
    if(!rm)b.textContent=final.replace(/\d+/g,'0');
  });
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;
    io.unobserve(e.target);e.target.classList.add('in');
    if(rm)return;
    var b=e.target.querySelector('.big'),final=b.dataset.final,t0=null;
    function step(t){
      if(t0===null)t0=t;
      var k=Math.min(1,(t-t0)/1200),v=1-Math.pow(1-k,3);
      b.textContent=final.replace(/\d+/g,function(m){return Math.round(m*v);});
      if(k<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });},{threshold:.35});
  cards.forEach(function(c){io.observe(c);});
})();

/* career timeline */
(function(){
  var now=new Date(),nowY=now.getFullYear()+now.getMonth()/12;
  var T0=2017.75,T1=nowY+.25,span=T1-T0;
  var roles=[
    ['Physical Design Engineer','Microchip · TSMC 40nm, UMC 65nm',2017.92,2021.67,'c-micro'],
    ['Physical Design Engineer','Intel · Intel 7, 3, 18A',2021.67,2025.25,'c-intel'],
    ['Physical Design Engineer','Samsung · N4, cHBM',2025.33,nowY,'c-sam']
  ];
  var axis=document.getElementById('axis'),rows=document.getElementById('rows');
  for(var y=2018;y<=Math.floor(nowY);y+=2){var el=document.createElement('span');el.textContent=y;el.style.left=((y-T0)/span*100)+'%';axis.appendChild(el);}
  roles.forEach(function(r,idx){
    var row=document.createElement('div');row.className='grow';row.style.setProperty('--i',idx);
    var left=(r[2]-T0)/span*100,w=(r[3]-r[2])/span*100;
    var lab=document.createElement('div');lab.className='lab';
    lab.innerHTML='<b>'+r[0]+'</b><i>'+r[1]+'</i>';
    if(left>60){lab.style.right=(100-left-w)+'%';}else{lab.style.left=left+'%';}
    var bar=document.createElement('div');bar.className='bar '+r[4];
    bar.style.left=left+'%';bar.style.width=w+'%';
    row.appendChild(lab);row.appendChild(bar);rows.appendChild(row);
  });
  var gt=document.querySelector('.gantt');
  if('IntersectionObserver' in window){
    var go=new IntersectionObserver(function(es){if(es[0].isIntersecting){gt.classList.add('in');go.disconnect();}},{threshold:.3});
    go.observe(gt);
  }else{gt.classList.add('in');}
})();

/* the die renders, shared by the hero and the flow section */
function buildDie(svg,uid){
  var NS='http://www.w3.org/2000/svg';
  function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e;}
  var seed=7;function rnd(){seed=(seed*9301+49297)%233280;return seed/233280;}
  function dl(v){return '--d:'+v.toFixed(2)+'s';}
  var FONT='IBM Plex Sans, sans-serif';
  var macros=[[62,62,130,72,'SRAM'],[288,62,130,72,'SRAM'],[62,190,100,56,'ROM'],[318,190,100,56,'SRAM']];
  function inMacro(x,y,pad){return macros.some(function(m){return x>m[0]-pad&&x<m[0]+m[2]+pad&&y>m[1]-pad&&y<m[1]+m[3]+pad;});}
  function runHits(xa,ya,xb,yb){var n=Math.ceil(Math.max(Math.abs(xb-xa),Math.abs(yb-ya))/4),i;for(i=0;i<=n;i++){if(inMacro(xa+(xb-xa)*i/n,ya+(yb-ya)*i/n,3))return true;}return false;}

  var defs=el('defs',{});
  var rg=el('radialGradient',{id:uid+'-ir'},defs);
  el('stop',{offset:0,'stop-color':'#ff5a3c','stop-opacity':.6},rg);
  el('stop',{offset:1,'stop-color':'#ff5a3c','stop-opacity':0},rg);
  el('rect',{x:16,y:16,width:448,height:268,rx:4,fill:'none',stroke:'var(--muted)','stroke-width':1.5});
  var g=[],gi,x,y,n;
  for(gi=0;gi<5;gi++)g.push(el('g',{}));

  /* 1 floorplan: IO pins, power ring, stripes, macros with halos */
  n=0;
  for(x=30;x<=450;x+=14){[16,278].forEach(function(py){el('rect',{x:x-2,y:py,width:4,height:6,fill:'var(--cu)','class':'f',style:dl(n*.01)},g[0]);});n++;}
  for(y=34;y<=270;y+=14){[16,458].forEach(function(px){el('rect',{x:px,y:y-2,width:6,height:4,fill:'var(--cu)','class':'f',style:dl(n*.01)},g[0]);});n++;}
  el('rect',{x:34,y:34,width:412,height:232,fill:'none',stroke:'var(--m1)','stroke-width':3,'class':'d',pathLength:1,style:dl(.25)},g[0]);
  el('rect',{x:42,y:42,width:396,height:216,fill:'none',stroke:'var(--via)','stroke-width':2,'class':'d',pathLength:1,style:dl(.45)},g[0]);
  for(x=82,n=0;x<=400;x+=36,n++){el('line',{x1:x,y1:48,x2:x,y2:252,stroke:'var(--m1)','stroke-width':1,opacity:.45,'class':'d',pathLength:1,style:dl(.7+n*.07)},g[0]);}
  macros.forEach(function(m,i){
    el('rect',{x:m[0]-6,y:m[1]-6,width:m[2]+12,height:m[3]+12,fill:'none',stroke:'var(--cu)','stroke-dasharray':'3 3',opacity:.6,'class':'f',style:dl(1.1+i*.12)+';--o:.6'},g[0]);
    el('rect',{x:m[0],y:m[1],width:m[2],height:m[3],rx:2,fill:'var(--panel)',stroke:'var(--muted)','class':'f',style:dl(1+i*.12)},g[0]);
    var t=el('text',{x:m[0]+m[2]/2,y:m[1]+m[3]/2+4,'text-anchor':'middle','font-size':11,fill:'var(--muted)','font-family':FONT,'class':'f',style:dl(1.2+i*.12)},g[0]);t.textContent=m[4];
  });

  /* 2 placement: standard cells in rows */
  var rn=0,w,c;
  for(y=62;y<=248;y+=7,rn++){x=52;while(x<428){
    w=4+Math.floor(rnd()*3)*3;
    if(!inMacro(x,y+2,9)&&!inMacro(x+w,y+2,9)&&rnd()>.12){
      c=rnd();
      el('rect',{x:x,y:y,width:w,height:5,rx:.8,fill:c>.7?'var(--m1)':'var(--via)',opacity:(.55+c*.3).toFixed(2),'class':'f',style:dl(rn*.035+rnd()*.3)+';--o:'+(.55+c*.3).toFixed(2)},g[1]);
    }
    x+=w+1.4;
  }}

  /* 3 clock tree: root, buffers, sinks */
  [['M240 162 H130 M240 162 H350 M240 162 V96 M240 162 V226',.1],
   ['M130 162 V146 M130 162 V178 M350 162 V146 M350 162 V178 M240 96 H214 M240 96 H266 M240 226 H214 M240 226 H266',.55],
   ['M130 146 H80 M130 146 H180 M130 178 H80 M130 178 H180 M350 146 H300 M350 146 H400 M350 178 H300 M350 178 H400',.95]
  ].forEach(function(lv){el('path',{d:lv[0],fill:'none',stroke:'var(--cu)','stroke-width':2,'stroke-linecap':'round','class':'d',pathLength:1,style:dl(lv[1])},g[2]);});
  [[130,162],[350,162],[240,96],[240,226]].forEach(function(b,i){
    el('polygon',{points:(b[0]-5)+','+(b[1]-5)+' '+(b[0]-5)+','+(b[1]+5)+' '+(b[0]+6)+','+b[1],fill:'var(--panel)',stroke:'var(--cu)','stroke-width':1.5,'class':'f',style:dl(.5+i*.1)},g[2]);});
  [[80,146],[180,146],[80,178],[180,178],[300,146],[400,146],[300,178],[400,178],[214,96],[266,96],[214,226],[266,226]].forEach(function(p,i){
    el('circle',{cx:p[0],cy:p[1],r:3.4,fill:'var(--cu)',stroke:'var(--panel)','stroke-width':1,'class':'f',style:dl(1.3+i*.04)},g[2]);});
  [0,1.1].forEach(function(dly){el('circle',{cx:240,cy:162,r:6,fill:'none',stroke:'var(--cu)','stroke-width':1.5,'class':'ping',style:'--d:'+(1.2+dly)+'s'},g[2]);});
  el('circle',{cx:240,cy:162,r:6,fill:'var(--cu)','class':'f',style:dl(0)},g[2]);

  /* 4 routing: two metal layers joined by vias */
  var made=0,tries=0;
  while(made<72&&tries<1500){tries++;
    var x1=Math.round((56+rnd()*368)/6)*6,y1=Math.round((60+rnd()*190)/6)*6,
        x2=x1+Math.round((rnd()*2-1)*96/6)*6,y2=y1+Math.round((rnd()*2-1)*54/6)*6;
    if(x2<56||x2>424||y2<60||y2>250)continue;
    if(Math.abs(x1-x2)<24||Math.abs(y1-y2)<12)continue;
    if(inMacro(x1,y1,6)||inMacro(x2,y2,6)||runHits(x1,y1,x2,y1)||runHits(x2,y1,x2,y2))continue;
    var dd=made*.025;
    el('path',{d:'M'+x1+' '+y1+' H'+x2,fill:'none',stroke:'var(--m1)','stroke-width':1.4,'class':'d',pathLength:1,style:dl(dd)},g[3]);
    el('path',{d:'M'+x2+' '+y1+' V'+y2,fill:'none',stroke:'var(--via)','stroke-width':1.4,'class':'d',pathLength:1,style:dl(dd+.35)},g[3]);
    el('rect',{x:x2-2,y:y1-2,width:4,height:4,fill:'var(--ink)','class':'f',style:dl(dd+.3)},g[3]);
    made++;
  }

  /* 5 signoff: IR drop, critical path, check badges */
  [[127,98],[353,98],[368,218]].forEach(function(b,i){el('circle',{cx:b[0],cy:b[1],r:78,fill:'url(#'+uid+'-ir)','class':'f',style:dl(.2+i*.15)},g[4]);});
  el('path',{d:'M80 178 H206 V150 H322 V178 H400',fill:'none',stroke:'var(--ink)','stroke-width':2.4,'stroke-linejoin':'round','class':'d',pathLength:1,style:dl(.6)},g[4]);
  [[80,178],[400,178]].forEach(function(p,i){el('rect',{x:p[0]-4,y:p[1]-4,width:8,height:8,fill:'var(--ink)','class':'f',style:dl(.5+i)},g[4]);});
  [['STA',196,70],['DRC',244,70],['LVS',196,94],['EMIR',244,94]].forEach(function(b,i){
    el('rect',{x:b[1],y:b[2],width:42,height:20,rx:10,fill:'var(--panel)',stroke:'var(--via)','class':'f',style:dl(1.3+i*.25)},g[4]);
    var t=el('text',{x:b[1]+21,y:b[2]+14,'text-anchor':'middle','font-size':10.5,fill:'var(--ink)','font-family':FONT,'class':'f',style:dl(1.3+i*.25)},g[4]);t.textContent=b[0]+' ✓';
  });

  return g;
}

/* design flow, built when it nears the viewport */
function initFlow(){
  var stages=[
    {n:'Floorplan',s:'Blocks and power',t:'Decide where the large blocks sit, where the pins land and how power reaches everything. Mistakes here are expensive to fix later.',l:['Macro placement and channels','Pin placement','Power grid planning'],
     c:'The die with IO pins on every edge, a power ring and stripes, and four memory macros with keep-out halos.',
     w:'At Samsung, MGMTSS had so many memories that timing was under severe pressure. A new placement strategy closed it. At Intel, automating pin placement for about 40K pins cut floorplan creation by 85%.'},
    {n:'Placement',s:'Standard cells',t:'Spread the standard cells so wires stay short and timing paths stay tight, without crowding any one area.',l:['Timing at placement','Congestion','Legal cell positions'],
     c:'Standard cells packed into rows around the macros and their halos.',
     w:'Fixed congestion in HBMCSS caused by long-hop nets, using floorplan and pin-assignment iterations to remove detours and hotspots.'},
    {n:'Clock tree',s:'Clock distribution',t:'Deliver the clock to every flip-flop at nearly the same moment, while keeping clock power under control.',l:['Skew','Insertion delay','Clock power'],
     c:'The clock tree grows from the root: buffers at each branch, flip-flop sinks at the leaves. The rings show the clock spreading out.',
     w:'Finalised the CTS structure for the Intel3 project after several experiments, and was rewarded for it.'},
    {n:'Routing',s:'Metal layers',t:'Connect every net across the metal layers while following the foundry’s spacing rules.',l:['Design rule violations','Antenna effects','Signal integrity'],
     c:'Blue wires run horizontally on one metal layer, teal wires vertically on the next. The white squares are vias between them.',
     w:'Automated routing for about 28K CHI signals at Intel, and integrated pre-routed analog blocks with 76 sensitive signals at Microchip.'},
    {n:'Signoff',s:'Final checks',t:'Prove the layout works before it goes to the fab, across timing, power and physical checks.',l:['Static timing across corners','IR drop and electromigration','DRC and LVS'],
     c:'The bright line is a critical timing path. The red glow is IR drop under the memories. The badges are the four sign-off checks, shown passing.',
     w:'Signed off MGMTSS and HBMCSS with Calibre (DRC, LVS, ERC) and RedHawk-SC (EMIR) at Samsung. Earlier, I resolved a cross-project electromigration root cause at Microchip.'}
  ];
  var svg=document.getElementById('flowsvg'),g=buildDie(svg,'f');

  /* stage list, playback */
  var list=document.getElementById('stages'),detail=document.getElementById('detail'),playBtn=document.getElementById('play'),btns=[],cur=0,timer=null;
  stages.forEach(function(st,i){
    var li=document.createElement('li'),b=document.createElement('button');
    b.className='stage-btn';b.type='button';b.setAttribute('role','tab');
    b.innerHTML='<b class="n">'+(i+1)+'</b><em class="nm">'+st.n+'</em><span>'+st.s+'</span>';
    b.addEventListener('click',function(){stop();pick(i);});
    b.addEventListener('keydown',function(e){
      var k=e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0;if(!k)return;e.preventDefault();stop();var j=(i+k+stages.length)%stages.length;pick(j);btns[j].focus();});
    li.appendChild(b);list.appendChild(li);btns.push(b);});
  function play(i){var gr=g[i];gr.classList.remove('play');void gr.getBoundingClientRect();gr.classList.add('play');}
  function pick(i,quiet){
    cur=i;
    btns.forEach(function(b,j){b.setAttribute('aria-selected',j===i);b.tabIndex=j===i?0:-1;b.classList.toggle('done',j<i);});
    g.forEach(function(gr,j){gr.style.opacity=j===i?1:j<i?.4:0;gr.classList.toggle('active',j===i);});
    document.getElementById('prog').style.width=((i+1)/stages.length*100)+'%';
    document.getElementById('d-title').textContent=stages[i].n;
    document.getElementById('d-text').textContent=stages[i].t;
    document.getElementById('d-cap').textContent=stages[i].c;
    document.getElementById('d-list').innerHTML=stages[i].l.map(function(x){return '<li>'+x+'</li>';}).join('');
    document.getElementById('d-mine').textContent=stages[i].w;
    svg.setAttribute('aria-label','Die render at the '+stages[i].n.toLowerCase()+' stage');
    if(!quiet)play(i);
  }
  function stop(){
    if(timer)clearInterval(timer);timer=null;
    playBtn.setAttribute('aria-pressed','false');playBtn.textContent='▶ Play the flow';detail.setAttribute('aria-live','polite');
  }
  function start(){
    stop();
    playBtn.setAttribute('aria-pressed','true');playBtn.textContent='❚❚ Pause';detail.setAttribute('aria-live','off');
    pick(0);
    timer=setInterval(function(){if(cur>=stages.length-1){stop();return;}pick(cur+1);},3600);
  }
  playBtn.addEventListener('click',function(){if(timer)stop();else start();});

  pick(0,true);
  if('IntersectionObserver' in window){
    var seen=new IntersectionObserver(function(es){if(es[0].isIntersecting){seen.disconnect();if(!timer)play(cur);}},{threshold:.4});
    seen.observe(svg);
  }else{play(0);}
}
(function(){
  var section=document.getElementById('flow');
  if(!('IntersectionObserver' in window)){initFlow();return;}
  var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();initFlow();}},{rootMargin:'500px 0px'});
  io.observe(section);
})();

/* hero: the same die, built stage by stage on a loop */
(function(){
  var svg=document.getElementById('heroDie'),box=document.getElementById('heroSteps');
  var steps=[].slice.call(box.querySelectorAll('button')),g=buildDie(svg,'h');
  var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches,cur=0,timer=null,visible=true;
  var HOLD=[3000,3000,3000,3000,4500];
  function show(i){
    cur=i;
    g.forEach(function(gr,j){gr.style.opacity=j===i?1:j<i?.4:0;gr.classList.toggle('active',j===i);});
    steps.forEach(function(b,j){
      b.classList.remove('on');b.classList.toggle('done',j<i);
      b.setAttribute('aria-pressed',j===i);
      b.style.setProperty('--dur',HOLD[j]+'ms');
    });
    var gr=g[i];gr.classList.remove('play');void gr.getBoundingClientRect();gr.classList.add('play');
    steps[i].classList.add('on');
    svg.setAttribute('aria-label','Die at the '+steps[i].textContent.toLowerCase()+' stage');
  }
  function next(){clearTimeout(timer);timer=setTimeout(function(){show(cur===4?0:cur+1);next();},HOLD[cur]);}
  function pause(){clearTimeout(timer);timer=null;}
  steps.forEach(function(b,i){b.addEventListener('click',function(){show(i);if(!rm&&visible)next();});});
  if(rm){show(4);return;}
  show(0);next();
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible)next();else pause();}).observe(svg);
  }
  document.addEventListener('visibilitychange',function(){if(document.hidden)pause();else if(visible)next();});
})();

/* jargon: dotted terms with a plain-English tooltip */
(function(){
  var G=[
    [/\bCTS\b/,'Clock tree synthesis: building the network that delivers the clock to every flip-flop at nearly the same moment.'],
    [/\bplace and route\b/i,'Placing the standard cells, then wiring them together.'],
    [/\bEMIR\b/,'Electromigration and IR drop: checks that wires won’t wear out over time and that every cell gets enough supply voltage.'],
    [/\belectromigration\b/i,'Metal atoms slowly moving in a wire under heavy current, which can eventually break it.'],
    [/\bIR[- ]drop\b/i,'Voltage lost along the power wiring, which can starve cells of supply.'],
    [/\bDRC\b/,'Design rule check: confirms the layout follows the foundry’s manufacturing rules.'],
    [/\bLVS\b/,'Layout versus schematic: confirms the layout matches the circuit it should be.'],
    [/\bERC\b/,'Electrical rule check: looks for wiring mistakes such as floating pins or shorts.'],
    [/\bPERC\b/,'Programmable electrical rule check: checks reliability rules such as electrostatic-discharge protection.'],
    [/\bECO\b/,'Engineering change order: a late, small fix to a nearly finished design.'],
    [/\bPDN\b/,'Power delivery network: the wiring that brings supply voltage to every cell.'],
    [/\bTSV\b/,'Through-silicon via: a vertical connection through a chip, used to stack dies.'],
    [/\b3DIC\b/,'Three-dimensional IC: chips stacked on top of each other.'],
    [/\bHBI\b/,'Hybrid bond interface: the very fine connections between two stacked chips.'],
    [/\bNoC\b/,'Network-on-chip: the on-chip fabric that moves data between blocks.'],
    [/\bRTL\b/,'Register-transfer level: the code that describes what a chip does, before it becomes a layout.'],
    [/\bGDS\b/,'The file format a finished layout is sent to the fab in.'],
    [/\bPPA\b/,'Power, performance and area: the three things a design is judged on.'],
    [/\btape-?outs?\b/i,'Sending the finished design to the fab to be manufactured.']
  ];
  var tip=document.createElement('div');tip.className='tip';tip.id='tip';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.appendChild(tip);
  var shown=null;
  function show(el){
    shown=el;tip.textContent=el.dataset.def;tip.hidden=false;el.setAttribute('aria-describedby','tip');
    var r=el.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
    tip.style.left=Math.min(Math.max(8,r.left+r.width/2-w/2),window.innerWidth-w-8)+'px';
    tip.style.top=(r.top-h-8>=8?r.top-h-8:r.bottom+8)+'px';
  }
  function hide(){if(shown)shown.removeAttribute('aria-describedby');shown=null;tip.hidden=true;}
  function wrapFirst(root,re,def){
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      return n.parentNode.closest('.term,.big,h2,h3,a,button,script,style')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
    var n,m;
    while((n=walker.nextNode())){
      m=re.exec(n.nodeValue);if(!m)continue;
      var after=n.splitText(m.index);after.splitText(m[0].length);
      var span=document.createElement('span');span.className='term';span.tabIndex=0;span.dataset.def=def;
      span.textContent=after.nodeValue;after.parentNode.replaceChild(span,after);
      return;
    }
  }
  ['#results','#experience','#projects','#recognition'].forEach(function(sel){
    var root=document.querySelector(sel);if(!root)return;
    G.forEach(function(g){wrapFirst(root,g[0],g[1]);});
  });
  document.addEventListener('mouseover',function(e){var t=e.target.closest('.term');if(t&&t!==shown)show(t);});
  document.addEventListener('mouseout',function(e){if(e.target.closest('.term'))hide();});
  document.addEventListener('focusin',function(e){var t=e.target.closest&&e.target.closest('.term');if(t&&t.matches(':focus-visible'))show(t);});
  document.addEventListener('focusout',hide);
  document.addEventListener('click',function(e){
    var t=e.target.closest('.term');
    if(t&&e.pointerType==='touch'){if(shown===t)hide();else show(t);}else if(!t)hide();
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')hide();});
  window.addEventListener('scroll',hide,{passive:true});
})();
