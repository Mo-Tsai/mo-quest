import { useState, useEffect, useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;overflow:hidden;font-family:'Inter',sans-serif;background:#09090f;color:#e2e8f0}
@keyframes flicker{0%,100%{opacity:1}92%{opacity:1}93%{opacity:.3}96%{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes expPop{0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.4)}100%{opacity:0;transform:translateX(-50%) translateY(-50px) scale(.8)}}
@keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes sysIn{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:translateX(0)}}
@keyframes lvlUp{0%{opacity:0;transform:scale(.4)}50%{transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 10px #7c3aed33}50%{box-shadow:0 0 24px #7c3aed77}}
@keyframes critPop{0%{opacity:1;transform:translate(-50%,-50%) scale(1.6)}100%{opacity:0;transform:translate(-50%,-120%) scale(1)}}
`;

const TASKS = [
  {id:"med_am",  label:"Morning Meditation", cn:"晨間冥想",     exp:10, stat:"CON", gate:true,  icon:"🧘"},
  {id:"supps",   label:"Supplements",        cn:"營養品補充",   exp:5,  stat:"CON", gate:false, icon:"💊"},
  {id:"exer",    label:"Exercise + Stretch",  cn:"墊上運動+拉筋",exp:15, stat:"CON", gate:false, icon:"🤸"},
  {id:"listen",  label:"English Listening",   cn:"英文聽力",     exp:10, stat:"LNG", gate:false, icon:"👂"},
  {id:"speak",   label:"English Speaking",    cn:"英文口說",     exp:10, stat:"LNG", gate:false, icon:"🗣️"},
  {id:"vocab",   label:"English Vocab",       cn:"英文單字",     exp:10, stat:"LNG", gate:false, icon:"📖"},
  {id:"plan",    label:"Daily Planning",      cn:"今日工作規劃", exp:10, stat:"INT", gate:false, icon:"📋"},
  {id:"design",  label:"Design Project",      cn:"推進設計專案", exp:25, stat:"DEX", gate:false, icon:"🐉"},
  {id:"content", label:"IG / Video Script",   cn:"IG文案/腳本",  exp:15, stat:"CHA", gate:false, icon:"📱"},
  {id:"notion",  label:"Notion Brain",        cn:"整理主腦",     exp:10, stat:"INT", gate:false, icon:"🧹"},
  {id:"med_pm",  label:"Sleep Meditation",    cn:"睡前冥想",     exp:10, stat:"CON", gate:false, icon:"🌙"},
];

const STATS = [
  {key:"DEX", cn:"空間設計", val:72, col:"#f97316"},
  {key:"INT", cn:"技術系統", val:61, col:"#3b82f6"},
  {key:"WIS", cn:"商業財務", val:45, col:"#eab308"},
  {key:"CHA", cn:"品牌影響", val:28, col:"#ec4899"},
  {key:"CON", cn:"體能健康", val:55, col:"#22c55e"},
  {key:"LNG", cn:"語言表達", val:33, col:"#a855f7"},
];

const MISS = [
  {name:"Financial Freedom", cn:"財務自由",   icon:"💰", prog:20, col:"#f59e0b"},
  {name:"Quality of Life",   cn:"生活品質",   icon:"✨", prog:40, col:"#22c55e"},
  {name:"Brand Influence",   cn:"品牌影響力", icon:"📡", prog:15, col:"#a855f7"},
];

const SKILLS = [
  {tree:"Space Alchemist ⚗️", items:[["Brand Translation",4],["Parametric/GH",3],["Portfolio Story",2],["Client Pitch",3]]},
  {tree:"AI Builder 🤖",      items:[["Claude Workflow",4],["Notion Architecture",4],["Automation",3],["GH Script",3]]},
  {tree:"Entrepreneur 💰",    items:[["Finance Strategy",2],["Investment",2],["Team Command",3],["Restaurant Ops",3]]},
  {tree:"Content Creator 📡", items:[["Short Video",1],["IG Copywriting",3],["Content Strategy",2],["Personal Brand",2]]},
  {tree:"Scholar 📚",         items:[["English Biz",2],["WSET Wine",2],["Contrarian Thinking",3]]},
];

const INTEL_SEED = {
  0:[
    {icon:"🌏", title:"US-China tariff escalation reshapes supply chains", source:"Reuters", tag:"Global", summary:"New tariff rounds push manufacturers to diversify away from China. Taiwan positioned as key alternative hub.", url:"https://reuters.com"},
    {icon:"🇹🇼", title:"Taiwan semiconductor exports hit record Q1 2026", source:"DigiTimes", tag:"Taiwan", summary:"TSMC-led growth drives 18% YoY increase, strengthening NT dollar and regional influence.", url:"https://digitimes.com"},
    {icon:"🌐", title:"EU AI Act enforcement begins affecting global firms", source:"FT", tag:"Regulation", summary:"Companies exporting AI tools to Europe must now comply with risk-tier requirements.", url:"https://ft.com"},
    {icon:"📊", title:"IMF upgrades Asia growth forecast to 4.8%", source:"IMF", tag:"Economy", summary:"Southeast Asia leads recovery as domestic consumption outperforms expectations.", url:"https://imf.org"},
  ],
  1:[
    {icon:"🤖", title:"AI infrastructure spend tops $300B globally in 2026", source:"Bloomberg", tag:"AI", summary:"Hyperscalers accelerate datacenter buildout. Power and cooling stocks surge on demand signals.", url:"https://bloomberg.com"},
    {icon:"📈", title:"Taiwan ETF inflows surge amid tech optimism", source:"TWSE", tag:"Markets", summary:"Foreign institutional buyers returned to Taiwan equities, focusing on semiconductor and AI supply chain.", url:"https://twse.com.tw"},
    {icon:"💰", title:"Fed signals one rate cut remaining in 2026", source:"WSJ", tag:"Macro", summary:"Sticky core inflation delays easing. Dollar strengthens; emerging market capital flows under pressure.", url:"https://wsj.com"},
    {icon:"⚡", title:"Energy AI startups attract record VC funding", source:"TechCrunch", tag:"Venture", summary:"Grid optimization and energy efficiency AI draws $12B in Q1, second only to generative AI.", url:"https://techcrunch.com"},
  ],
  2:[
    {icon:"🏠", title:"Taiwan interior design market grows 12% YoY", source:"住研所", tag:"Design", summary:"Post-pandemic home renovation demand sustains momentum. Clients increasingly request smart-home integration.", url:"#"},
    {icon:"🍽️", title:"Taipei F&B scene: experiential dining drives premiumization", source:"Eater", tag:"F&B", summary:"Restaurant-goers prioritize atmosphere and narrative over pure cuisine. Brand storytelling becomes key.", url:"https://eater.com"},
    {icon:"🏗️", title:"Biophilic design demand rises across Asia commercial spaces", source:"ArchDaily", tag:"Architecture", summary:"Post-pandemic office redesigns emphasize natural materials, light control, and wellness metrics.", url:"https://archdaily.com"},
    {icon:"📐", title:"AI-generated parametric facades entering mainstream", source:"Dezeen", tag:"Design Tech", summary:"Grasshopper-to-fabrication pipelines now viable for mid-size studios. Early adopters gaining competitive edge.", url:"https://dezeen.com"},
  ],
};

const CRITS = ["CRITICAL HIT!", "BONUS EXP!", "PERFECT EXECUTION!", "SYSTEM BOOST!"];

function getTaipei() {
  const now = new Date();
  return {
    time: now.toLocaleTimeString("en-US", {timeZone:"Asia/Taipei", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false}),
    date: now.toLocaleDateString("en-US", {timeZone:"Asia/Taipei", weekday:"short", month:"short", day:"numeric", year:"numeric"}),
  };
}

// ── tiny components ──────────────────────────────────────────
function Ring({col="#7c3aed", size=220, x="60%", y="30%", op=0.12}) {
  return (
    <div style={{position:"absolute",left:x,top:y,width:size,height:size,borderRadius:"50%",
      background:col,filter:"blur(65px)",opacity:op,transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
  );
}

function Bar({val, max, col, h=4}) {
  const pct = Math.max(0, Math.min(100, (val/max)*100));
  return (
    <div style={{height:h,background:"#1e293b",borderRadius:999,overflow:"hidden"}}>
      <div style={{width:pct+"%",height:"100%",background:col,borderRadius:999,
        boxShadow:"0 0 8px "+col+"88",transition:"width .5s ease"}}/>
    </div>
  );
}

function Card({children, style}) {
  return (
    <div style={{background:"#0d0d1a",border:"1px solid #1e293b",borderRadius:14,
      padding:"14px 16px",marginBottom:10,...style}}>
      {children}
    </div>
  );
}

function Label({children, style}) {
  return <div style={{fontSize:9,letterSpacing:2,color:"#475569",fontWeight:700,marginBottom:10,...style}}>{children}</div>;
}

function SysToast({msg, onClose}) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{position:"fixed",top:16,right:12,zIndex:999,animation:"sysIn .3s ease",maxWidth:240,
      background:"#0f0f1e",border:"1px solid #7c3aed",borderRadius:10,padding:"10px 14px",
      boxShadow:"0 0 28px #7c3aed44"}}>
      <div style={{fontSize:8,fontWeight:700,color:"#7c3aed",letterSpacing:2,marginBottom:3}}>SYSTEM</div>
      <div style={{fontSize:11,fontWeight:600,color:"#e2e8f0",lineHeight:1.5}}>{msg}</div>
    </div>
  );
}

function LvlOverlay({lv, onDone}) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.9)"}}>
      <div style={{animation:"lvlUp .55s ease",textAlign:"center"}}>
        <div style={{fontSize:10,letterSpacing:4,color:"#7c3aed",fontWeight:700,marginBottom:8}}>— LEVEL UP —</div>
        <div style={{fontSize:72,fontWeight:900,
          background:"linear-gradient(135deg,#a855f7,#3b82f6)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>
          Lv.{lv}
        </div>
        <div style={{fontSize:12,color:"#64748b",marginTop:10}}>Brand Alchemist 品牌煉金師</div>
      </div>
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const [page, setPage]         = useState(0);
  const [clock, setClock]       = useState(getTaipei());
  const [done, setDone]         = useState([]);
  const [quests, setQuests]     = useState([]);
  const [qInput, setQInput]     = useState("");
  const [toast, setToast]       = useState(null);
  const [lvlUp, setLvlUp]       = useState(null);
  const [expAnim, setExpAnim]   = useState(null);
  const [crit, setCrit]         = useState(null);
  const [streak]                = useState(7);
  const [intelCh, setIntelCh]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [intel, setIntel]       = useState([]);
  const prevLv = useRef(12);

  useEffect(() => {
    const iv = setInterval(() => setClock(getTaipei()), 1000);
    return () => clearInterval(iv);
  }, []);

  const medDone  = done.includes("med_am");
  const totalExp = TASKS.filter(t => done.includes(t.id)).reduce((s,t) => s+t.exp, 0);
  const maxExp   = TASKS.reduce((s,t) => s+t.exp, 0);
  const lv       = 12 + Math.floor(totalExp / 80);

  useEffect(() => {
    if (lv > prevLv.current) { setLvlUp(lv); }
    prevLv.current = lv;
  }, [lv]);

  function toggle(id) {
    const task = TASKS.find(t => t.id === id);
    if (!task) return;
    const wasDone = done.includes(id);
    setDone(d => wasDone ? d.filter(x => x !== id) : [...d, id]);
    if (!wasDone) {
      setExpAnim(id);
      setTimeout(() => setExpAnim(null), 800);
      if (Math.random() < 0.15) {
        const cm = CRITS[Math.floor(Math.random()*CRITS.length)];
        setCrit(cm);
        setTimeout(() => setCrit(null), 1100);
        setToast(cm + " +" + task.exp + " EXP — " + task.label);
      } else {
        setToast(task.icon + " " + task.label + " complete · +" + task.exp + " EXP");
      }
      const newCount = done.length + 1;
      if (newCount === TASKS.length) {
        setTimeout(() => setToast("🏆 ALL TASKS COMPLETE — Daily reward unlocked!"), 900);
      }
    }
  }

  function addQuest() {
    if (!qInput.trim()) return;
    setQuests(q => [{id:Date.now(), name:qInput.trim(), done:false}, ...q]);
    setQInput("");
    setToast("⚔️ New quest added to the log!");
  }

  function loadIntel(ch) {
    setIntelCh(ch);
    setLoading(true);
    setIntel([]);
    setTimeout(() => {
      setIntel(INTEL_SEED[ch] || []);
      setLoading(false);
    }, 900);
  }

  // ── Nav ──────────────────────────────────────────────────
  const NAV = [["⚡","COMMAND","指揮台 · 總覽"],["📋","DAILY","每日任務 · 打勾"],["📡","INTEL","情報站 · 新聞"],["🧬","SKILLS","技能樹 · 成長"]];

  function Nav() {
    return (
      <div style={{display:"flex",gap:4,padding:"0 14px 10px",flexShrink:0}}>
        {NAV.map(([ico,en,cn], i) => (
          <button key={en} onClick={() => setPage(i)} style={{
            flex:1, padding:"7px 2px", borderRadius:8, cursor:"pointer", transition:"all .2s",
            border:"1px solid "+(page===i?"#7c3aed":"#1e293b"),
            background:page===i?"#140a2a":"transparent",
            color:page===i?"#a78bfa":"#475569",
          }}>
            <div style={{fontSize:13,marginBottom:1}}>{ico}</div>
            <div style={{fontSize:7,fontWeight:700,letterSpacing:.5}}>{en}</div>
            <div style={{fontSize:7,color:page===i?"#7c5cb4":"#334155"}}>{cn}</div>
          </button>
        ))}
      </div>
    );
  }

  // ── Page 0: COMMAND ──────────────────────────────────────
  function PageCommand() {
    return (
      <div style={{padding:"0 14px",overflowY:"auto",flex:1}}>
        <Ring col="#7c3aed" size={260} x="75%" y="25%" op={0.11}/>
        <Ring col="#3b82f6" size={160} x="15%" y="65%" op={0.07}/>

        {/* Clock */}
        <div style={{textAlign:"center",marginBottom:18,position:"relative",zIndex:1}}>
          <div style={{fontSize:38,fontWeight:700,letterSpacing:2,color:"#f1f5f9",
            fontVariantNumeric:"tabular-nums",animation:"flicker 9s infinite"}}>
            {clock.time}
          </div>
          <div style={{fontSize:10,color:"#475569",marginTop:2,letterSpacing:1}}>{clock.date} · TAIPEI</div>
        </div>

        {/* Character */}
        <Card style={{position:"relative",overflow:"hidden",animation:"glow 4s ease infinite"}}>
          <Ring col="#7c3aed" size={100} x="90%" y="50%" op={0.2}/>
          <div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",
            fontSize:46,animation:"float 3s ease infinite",zIndex:0}}>🧙‍♂️</div>
          <div style={{position:"relative",zIndex:1}}>
            <Label>PLAYER STATUS <span style={{fontWeight:400,color:"#334155",fontSize:8}}>玩家狀態</span></Label>
            <div style={{fontSize:20,fontWeight:800,color:"#e2e8f0"}}>
              MO <span style={{fontSize:14,color:"#7c3aed",fontWeight:600}}>Lv.{lv}</span>
            </div>
            <div style={{fontSize:10,color:"#475569",marginBottom:10}}>Brand Alchemist · 品牌煉金師</div>
            <div style={{fontSize:9,color:"#64748b",display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span>EXP TODAY <span style={{color:"#334155"}}>今日經驗值</span></span><span>{totalExp} / {maxExp}</span>
            </div>
            <Bar val={totalExp} max={maxExp} col="#7c3aed" h={6}/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
              <span style={{fontSize:12}}>🔥</span>
              <span style={{fontSize:11,fontWeight:600,color:"#f97316"}}>{streak} day streak</span>
              <span style={{fontSize:10,color:"#475569",marginLeft:"auto"}}>{done.length}/{TASKS.length} tasks</span>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Card>
          <Label>ABILITY SCORES <span style={{fontWeight:400,color:"#334155",fontSize:8}}>六大能力值</span></Label>
          {STATS.map(s => (
            <div key={s.key} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <span style={{fontSize:11,fontWeight:700,color:s.col}}>{s.key}</span>
                <span style={{fontSize:10,color:"#475569"}}>{s.cn}</span>
                <span style={{fontSize:12,fontWeight:700}}>{s.val}</span>
              </div>
              <Bar val={s.val} max={100} col={s.col}/>
            </div>
          ))}
        </Card>

        {/* Main quests */}
        <Card>
          <Label>MAIN QUESTS <span style={{fontWeight:400,color:"#334155",fontSize:8}}>人生主線任務</span></Label>
          {MISS.map(m => (
            <div key={m.name} style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span>{m.icon}</span>
                <span style={{fontSize:11,fontWeight:600,color:"#cbd5e1"}}>{m.name}</span>
                <span style={{fontSize:10,color:"#475569"}}>{m.cn}</span>
                <span style={{fontSize:11,fontWeight:700,color:m.col,marginLeft:"auto"}}>{m.prog}%</span>
              </div>
              <Bar val={m.prog} max={100} col={m.col}/>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  // ── Page 1: DAILY ────────────────────────────────────────
  function PageDaily() {
    return (
      <div style={{padding:"0 14px",overflowY:"auto",flex:1}}>
        {!medDone && (
          <div style={{background:"#1a0900",border:"1px solid #ea580c",borderRadius:10,
            padding:"10px 14px",marginBottom:10,display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:16}}>⚠️</span>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#ea580c"}}>SYSTEM LOCKED</div>
              <div style={{fontSize:9,color:"#7c2d12",marginTop:1}}>Complete Morning Meditation to unlock all tasks</div>
            </div>
          </div>
        )}

        <Card style={{position:"relative"}}>
          {crit && (
            <div style={{position:"absolute",left:"50%",top:"30%",zIndex:20,pointerEvents:"none",
              fontSize:13,fontWeight:900,color:"#fbbf24",whiteSpace:"nowrap",
              animation:"critPop .9s ease forwards",textShadow:"0 0 20px #f59e0b"}}>
              {crit}
            </div>
          )}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <Label style={{marginBottom:0}}>DAILY QUESTS</Label>
            <span style={{fontSize:10,color:done.length===TASKS.length?"#22c55e":"#475569",fontWeight:600}}>
              {done.length}/{TASKS.length} · {totalExp}EXP
            </span>
          </div>
          {TASKS.map(t => {
            const checked  = done.includes(t.id);
            const locked   = !medDone && t.id !== "med_am";
            const isAnim   = expAnim === t.id;
            return (
              <div key={t.id} onClick={() => !locked && toggle(t.id)}
                style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",
                  borderRadius:9,background:checked?"#0f172a":"transparent",
                  border:"1px solid "+(checked?"#334155":"#1e293b"),
                  cursor:locked?"not-allowed":"pointer",marginBottom:5,position:"relative",
                  transition:"all .18s",opacity:locked?0.4:1}}>
                {isAnim && (
                  <div style={{position:"absolute",left:"50%",top:0,pointerEvents:"none",zIndex:10,
                    fontSize:12,fontWeight:800,color:"#fbbf24",whiteSpace:"nowrap",
                    animation:"expPop .75s ease forwards"}}>
                    +{t.exp} EXP
                  </div>
                )}
                <div style={{width:18,height:18,borderRadius:5,flexShrink:0,transition:"all .2s",
                  border:"2px solid "+(checked?"#7c3aed":"#334155"),
                  background:checked?"#7c3aed":"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {checked && (
                    <svg width="9" height="7" viewBox="0 0 9 7">
                      <path d="M1 3.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <span style={{fontSize:14}}>{t.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:500,color:checked?"#64748b":"#cbd5e1",
                    textDecoration:checked?"line-through":"none"}}>{t.label}</div>
                  <div style={{fontSize:9,color:"#475569"}}>{t.cn}</div>
                </div>
                <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
                  <span style={{fontSize:9,color:"#475569",background:"#1e293b",
                    padding:"2px 6px",borderRadius:999}}>{t.stat}</span>
                  <span style={{fontSize:10,fontWeight:700,color:"#fbbf24"}}>+{t.exp}</span>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Quest input */}
        <Card>
          <Label>⚔️ INSTANT QUEST</Label>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <input value={qInput} onChange={e => setQInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && addQuest()}
              placeholder="Add a task or case to solve..."
              style={{flex:1,background:"#070710",border:"1px solid #1e293b",borderRadius:8,
                padding:"9px 12px",color:"#e2e8f0",fontSize:11,outline:"none"}}/>
            <button onClick={addQuest}
              style={{background:"#7c3aed",border:"none",borderRadius:8,padding:"9px 16px",
                color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>+</button>
          </div>
          {quests.length === 0 && (
            <div style={{fontSize:10,color:"#334155",textAlign:"center",padding:"6px 0"}}>No instant quests yet</div>
          )}
          {quests.map(q => (
            <div key={q.id} style={{display:"flex",alignItems:"center",gap:8,
              padding:"7px 0",borderBottom:"1px solid #1e293b"}}>
              <div onClick={() => setQuests(qs => qs.map(x => x.id===q.id?{...x,done:!x.done}:x))}
                style={{width:15,height:15,borderRadius:4,border:"1.5px solid "+(q.done?"#7c3aed":"#334155"),
                  background:q.done?"#7c3aed":"transparent",cursor:"pointer",flexShrink:0}}/>
              <span style={{fontSize:11,flex:1,color:q.done?"#475569":"#cbd5e1",
                textDecoration:q.done?"line-through":"none"}}>{q.name}</span>
              <button onClick={() => setQuests(qs => qs.filter(x => x.id!==q.id))}
                style={{background:"none",border:"none",color:"#334155",cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  // ── Page 2: INTEL ────────────────────────────────────────
  function PageIntel() {
    const CH = [{key:0,icon:"🌍",en:"WORLD",cn:"世界大事"},{key:1,icon:"📈",en:"INVEST",cn:"投資動態"},{key:2,icon:"🏢",en:"INDUSTRY",cn:"產業情報"}];
    return (
      <div style={{padding:"0 14px",overflowY:"auto",flex:1}}>
        <Card>
          <Label>INTELLIGENCE CHANNELS</Label>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {CH.map(c => (
              <button key={c.key} onClick={() => loadIntel(c.key)}
                style={{flex:1,padding:"10px 4px",borderRadius:9,cursor:"pointer",transition:"all .2s",
                  border:"1px solid "+(intelCh===c.key?"#7c3aed":"#1e293b"),
                  background:intelCh===c.key?"#140a2a":"transparent",
                  color:intelCh===c.key?"#a78bfa":"#475569",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:2}}>{c.icon}</div>
                <div style={{fontSize:8,fontWeight:700,letterSpacing:.5}}>{c.en}</div>
                <div style={{fontSize:8,color:intelCh===c.key?"#5b3d9a":"#334155"}}>{c.cn}</div>
              </button>
            ))}
          </div>

          {loading && (
            <div style={{textAlign:"center",padding:"28px 0"}}>
              <div style={{width:26,height:26,border:"3px solid #1e293b",borderTop:"3px solid #7c3aed",
                borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 10px"}}/>
              <div style={{fontSize:10,color:"#475569"}}>Fetching intel...</div>
            </div>
          )}

          {!loading && intelCh === null && (
            <div style={{textAlign:"center",padding:"28px 0",color:"#334155",fontSize:11}}>
              Select a channel to load today's briefing
            </div>
          )}

          {!loading && intel.map((item, i) => {
            const [open, setOpen] = [false, () => {}]; // simplified — use IntelCard below
            return <IntelRow key={i} item={item}/>;
          })}
        </Card>
      </div>
    );
  }

  function IntelRow({item}) {
    const [open, setOpen] = useState(false);
    return (
      <div style={{border:"1px solid #1e293b",borderRadius:9,overflow:"hidden",marginBottom:7}}>
        <div onClick={() => setOpen(o => !o)}
          style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 12px",cursor:"pointer",background:"#0a0a14"}}>
          <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{item.icon}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:600,color:"#e2e8f0",lineHeight:1.5}}>{item.title}</div>
            <div style={{fontSize:9,color:"#475569",marginTop:2}}>{item.source} · {item.tag}</div>
          </div>
          <span style={{fontSize:9,color:"#334155",marginTop:2,flexShrink:0}}>{open?"▲":"▼"}</span>
        </div>
        {open && (
          <div style={{padding:"10px 12px 12px",borderTop:"1px solid #1e293b",background:"#070710"}}>
            <p style={{fontSize:11,color:"#94a3b8",lineHeight:1.75}}>{item.summary}</p>
            {item.url && item.url !== "#" && (
              <a href={item.url} target="_blank" rel="noreferrer"
                style={{display:"inline-block",marginTop:8,fontSize:10,color:"#7c3aed",textDecoration:"none"}}>
                Read more →
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Page 3: SKILLS ───────────────────────────────────────
  function PageSkills() {
    return (
      <div style={{padding:"0 14px",overflowY:"auto",flex:1}}>
        {SKILLS.map(tree => (
          <Card key={tree.tree}>
            <div style={{fontSize:11,fontWeight:700,color:"#a78bfa",marginBottom:10}}>{tree.tree}</div>
            {tree.items.map(([name, lv]) => (
              <div key={name} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:10,color:"#94a3b8",flex:1}}>{name}</span>
                <div style={{display:"flex",gap:3}}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{width:10,height:10,borderRadius:2,transition:"all .3s",
                      background:i<=lv?"#7c3aed":"#1e293b",
                      boxShadow:i<=lv?"0 0 5px #7c3aed88":"none"}}/>
                  ))}
                </div>
                <span style={{fontSize:9,color:"#475569",minWidth:22,textAlign:"right"}}>{lv}/5</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    );
  }

  const PAGES = [PageCommand, PageDaily, PageIntel, PageSkills];
  const PageComp = PAGES[page];

  return (
    <div style={{width:"100%",height:"100%",maxWidth:430,margin:"0 auto",
      display:"flex",flexDirection:"column",background:"#09090f",position:"relative",overflow:"hidden"}}>

      {toast && <SysToast msg={toast} onClose={() => setToast(null)}/>}
      {lvlUp && <LvlOverlay lv={lvlUp} onDone={() => setLvlUp(null)}/>}

      {/* Header */}
      <div style={{padding:"14px 14px 0",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:"#7c3aed",fontWeight:700}}>MO'S QUEST</div>
            <div style={{fontSize:7,color:"#334155",letterSpacing:1}}>DAILY COMMAND SYSTEM v4</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:8,color:"#334155"}}>Lv.{lv} · {Math.round((totalExp/maxExp)*100)}% today</div>
            <div style={{fontSize:10,color:"#f97316",fontWeight:700}}>🔥 {streak}d</div>
          </div>
        </div>
        <Nav/>
      </div>

      {/* Page */}
      <div style={{flex:1,overflowY:"hidden",display:"flex",flexDirection:"column",animation:"slideIn .2s ease"}}>
        <PageComp/>
      </div>
    </div>
  );
}
