import { useState, useEffect, useRef } from "react";

// ── CSS ─────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;overflow:hidden;font-family:'Inter',sans-serif;background:#08080c;color:#e2e8f0}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#1e293b;border-radius:99px}
@keyframes expPop{0%{opacity:1;transform:translateY(0) scale(1.3)}100%{opacity:0;transform:translateY(-40px) scale(.7)}}
@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes critPop{0%{opacity:1;transform:scale(1.8)}60%{transform:scale(1)}100%{opacity:0;transform:scale(.8)}}
@keyframes glow{0%,100%{box-shadow:0 0 8px #dc262620}50%{box-shadow:0 0 20px #dc262640}}
@keyframes lvlUp{0%{opacity:0;transform:scale(.3)}60%{transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}
@keyframes barFill{from{width:0}to{width:var(--w)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
`;

// ── Data ────────────────────────────────────────────────────
const TITLES = [
  {minLv:1,  cn:"見習生",     emoji:"🧑‍💻"},
  {minLv:3,  cn:"探索者",     emoji:"🗺️"},
  {minLv:5,  cn:"見習煉金師", emoji:"🧪"},
  {minLv:8,  cn:"系統建構者", emoji:"🔧"},
  {minLv:12, cn:"品牌煉金師", emoji:"🥷"},
  {minLv:18, cn:"領域大師",   emoji:"🧙‍♂️"},
  {minLv:25, cn:"傳奇煉金師", emoji:"👑"},
];

function getTitle(lv: number) {
  let c = TITLES[0];
  for (const t of TITLES) if (lv >= t.minLv) c = t;
  return c;
}

const DEFAULT_TASKS = [
  {id:"med_am",  label:"晨間冥想",        monster:"心靈史萊姆",  exp:10, stat:"CON", gate:true,  icon:"🧘"},
  {id:"supps",   label:"營養品補充",      monster:"毒蛾",        exp:5,  stat:"CON", gate:false, icon:"💊"},
  {id:"exer",    label:"墊上運動+拉筋",   monster:"沙發魔像",    exp:15, stat:"CON", gate:false, icon:"🤸"},
  {id:"listen",  label:"英文聽力練習",    monster:"怠惰史萊姆",  exp:10, stat:"LNG", gate:false, icon:"👂"},
  {id:"speak",   label:"英文口說",        monster:"沉默蝙蝠",    exp:10, stat:"LNG", gate:false, icon:"🗣️"},
  {id:"vocab",   label:"英文單字",        monster:"咒語精靈",    exp:10, stat:"LNG", gate:false, icon:"📖"},
  {id:"plan",    label:"今日工作規劃",    monster:"混沌骷髏",    exp:10, stat:"INT", gate:false, icon:"📋"},
  {id:"design",  label:"推進設計專案",    monster:"完美主義龍",  exp:25, stat:"DEX", gate:false, icon:"🐉"},
  {id:"content", label:"IG文案/影片腳本", monster:"拖延幽靈",    exp:15, stat:"CHA", gate:false, icon:"📱"},
  {id:"notion",  label:"整理 Notion 主腦",monster:"無知之影",    exp:10, stat:"INT", gate:false, icon:"🧹"},
  {id:"med_pm",  label:"睡前冥想",        monster:"夜行亡靈",    exp:10, stat:"CON", gate:false, icon:"🌙"},
];

const DEFAULT_STATS: Record<string,{cn:string,val:number,col:string}> = {
  DEX:{cn:"設計", val:72, col:"#f97316"},
  INT:{cn:"技術", val:61, col:"#3b82f6"},
  WIS:{cn:"商業", val:45, col:"#eab308"},
  CHA:{cn:"影響", val:28, col:"#ec4899"},
  CON:{cn:"體能", val:55, col:"#22c55e"},
  LNG:{cn:"語言", val:33, col:"#a855f7"},
};

const MISSIONS = [
  {name:"財務自由", icon:"💰", prog:20, col:"#f59e0b"},
  {name:"生活品質", icon:"✨", prog:40, col:"#22c55e"},
  {name:"品牌影響力", icon:"📡", prog:15, col:"#a855f7"},
];

const CRITS = ["CRITICAL HIT!", "PERFECT!", "BONUS EXP!", "DEVASTATING!"];
const STAT_KEYS = ["DEX","INT","WIS","CHA","CON","LNG"];

// ── Helpers ─────────────────────────────────────────────────
function loadJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function saveJSON(key: string, val: any) { localStorage.setItem(key, JSON.stringify(val)); }

function getTaipei() {
  const now = new Date();
  return {
    time: now.toLocaleTimeString("zh-TW", {timeZone:"Asia/Taipei", hour:"2-digit", minute:"2-digit", hour12:false}),
    date: now.toLocaleDateString("zh-TW", {timeZone:"Asia/Taipei", month:"long", day:"numeric", weekday:"short"}),
  };
}

// ── Isolated Clock ──────────────────────────────────────────
function Clock() {
  const [c, setC] = useState(getTaipei());
  useEffect(() => { const iv = setInterval(() => setC(getTaipei()), 1000); return () => clearInterval(iv); }, []);
  return (
    <div style={{display:"flex",alignItems:"baseline",gap:10}}>
      <span style={{fontSize:28,fontWeight:800,color:"#f1f5f9",fontVariantNumeric:"tabular-nums",letterSpacing:1}}>{c.time}</span>
      <span style={{fontSize:11,color:"#475569"}}>{c.date}</span>
    </div>
  );
}

// ── Toast ───────────────────────────────────────────────────
function Toast({msg, onClose}: {msg:string, onClose:()=>void}) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",zIndex:999,
      animation:"slideUp .25s ease",maxWidth:340,width:"90%",
      background:"#141418",border:"1px solid #dc262644",borderRadius:10,padding:"10px 16px",
      boxShadow:"0 4px 30px #dc262620",textAlign:"center"}}>
      <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0",lineHeight:1.6}}>{msg}</div>
    </div>
  );
}

// ── Level Up Overlay ────────────────────────────────────────
function LvlOverlay({lv, cn, emoji, boosts, onDone}:
  {lv:number, cn:string, emoji:string, boosts:{stat:string,amt:number}[], onDone:()=>void}) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, []);
  return (
    <div onClick={onDone} style={{position:"fixed",inset:0,zIndex:500,display:"flex",
      alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.92)",cursor:"pointer"}}>
      <div style={{animation:"lvlUp .5s ease",textAlign:"center"}}>
        <div style={{fontSize:11,letterSpacing:6,color:"#dc2626",fontWeight:700,marginBottom:12}}>— 升 級 —</div>
        <div style={{fontSize:52}}>{emoji}</div>
        <div style={{fontSize:64,fontWeight:900,color:"#dc2626",lineHeight:1}}>Lv.{lv}</div>
        <div style={{fontSize:16,color:"#ef4444",marginTop:6,fontWeight:700}}>{cn}</div>
        <div style={{marginTop:14}}>
          {boosts.map(b => (
            <div key={b.stat} style={{fontSize:12,color:"#22c55e",fontWeight:600,marginBottom:3}}>
              {b.stat} +{b.amt}
            </div>
          ))}
        </div>
        <div style={{fontSize:9,color:"#334155",marginTop:16}}>點擊繼續</div>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const [done, setDone]     = useState<string[]>([]);
  const [tasks]             = useState(() => loadJSON("mq_tasks", DEFAULT_TASKS));
  const [stats, setStats]   = useState(() => loadJSON("mq_stats", DEFAULT_STATS));
  const [toast, setToast]   = useState<string|null>(null);
  const [expAnim, setExpAnim] = useState<string|null>(null);
  const [crit, setCrit]     = useState<string|null>(null);
  const [lvlUp, setLvlUp]   = useState<any>(null);
  const [showIntel, setShowIntel] = useState(false);
  const prevLv = useRef(1);

  useEffect(() => { saveJSON("mq_stats", stats); }, [stats]);

  const medDone  = done.includes("med_am");
  const totalExp = tasks.filter((t:any) => done.includes(t.id)).reduce((s:number,t:any) => s+t.exp, 0);
  const maxExp   = tasks.reduce((s:number,t:any) => s+t.exp, 0);
  const pct      = maxExp > 0 ? Math.round((totalExp/maxExp)*100) : 0;
  const lv       = 1 + Math.floor(totalExp / 50);
  const titleInfo = getTitle(lv);

  // Level up detection
  useEffect(() => {
    if (lv > prevLv.current) {
      const completed: Record<string,number> = {};
      tasks.filter((t:any) => done.includes(t.id)).forEach((t:any) => {
        completed[t.stat] = (completed[t.stat] || 0) + 1;
      });
      const sorted = Object.entries(completed).sort((a,b) => b[1]-a[1]).slice(0,2);
      const boosts = sorted.map(([stat]) => ({stat, amt: Math.ceil(Math.random()*2)}));
      setStats((prev: any) => {
        const copy = {...prev};
        boosts.forEach(b => {
          if (copy[b.stat]) copy[b.stat] = {...copy[b.stat], val: Math.min(100, copy[b.stat].val + b.amt)};
        });
        return copy;
      });
      const t = getTitle(lv);
      setLvlUp({lv, cn:t.cn, emoji:t.emoji, boosts});
    }
    prevLv.current = lv;
  }, [lv]);

  function toggle(id: string) {
    const task = tasks.find((t:any) => t.id === id);
    if (!task) return;
    const wasDone = done.includes(id);
    setDone(d => wasDone ? d.filter(x => x !== id) : [...d, id]);
    if (!wasDone) {
      const gain = Math.round((Math.random()*0.4+0.1)*10)/10;
      setStats((prev: any) => {
        if (!prev[task.stat]) return prev;
        const copy = {...prev};
        copy[task.stat] = {...copy[task.stat], val: Math.min(100, Math.round((copy[task.stat].val+gain)*10)/10)};
        return copy;
      });
      setExpAnim(id);
      setTimeout(() => setExpAnim(null), 700);
      if (Math.random() < 0.12) {
        const cm = CRITS[Math.floor(Math.random()*CRITS.length)];
        setCrit(cm); setTimeout(() => setCrit(null), 1000);
        setToast(`⚔️ 擊敗 ${task.monster}！${cm} +${task.exp} EXP`);
      } else {
        setToast(`⚔️ 擊敗 ${task.monster}！+${task.exp} EXP · ${task.stat} +${gain}`);
      }
      if (done.length + 1 === tasks.length) {
        setTimeout(() => setToast("🏆 全部擊敗！日結獎勵解鎖！"), 800);
      }
    }
  }

  const statsArr = STAT_KEYS.map(k => ({key:k, ...(stats[k] || DEFAULT_STATS[k])}));

  return (
    <div style={{width:"100%",height:"100%",maxWidth:430,margin:"0 auto",
      display:"flex",flexDirection:"column",background:"#08080c",position:"relative",overflow:"hidden"}}>

      {toast && <Toast msg={toast} onClose={() => setToast(null)}/>}
      {lvlUp && <LvlOverlay {...lvlUp} onDone={() => setLvlUp(null)}/>}

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{padding:"16px 18px 0",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <Clock/>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:9,letterSpacing:2,color:"#dc2626",fontWeight:700}}>MO'S QUEST</div>
            <div style={{fontSize:8,color:"#334155"}}>每日指揮系統</div>
          </div>
        </div>

        {/* ── Character Bar ────────────────────────────── */}
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
          background:"#0f0f14",border:"1px solid #1e293b",borderRadius:12,marginBottom:6,
          animation:"glow 4s ease infinite"}}>
          <div style={{fontSize:28,lineHeight:1}}>{titleInfo.emoji}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:2}}>
              <span style={{fontSize:16,fontWeight:800,color:"#f1f5f9"}}>MO</span>
              <span style={{fontSize:12,fontWeight:700,color:"#dc2626"}}>Lv.{lv}</span>
              <span style={{fontSize:10,color:"#475569"}}>{titleInfo.cn}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,height:5,background:"#1a1a22",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",background:"linear-gradient(90deg,#dc2626,#ef4444)",borderRadius:99,
                  width:pct+"%",transition:"width .4s ease",boxShadow:"0 0 8px #dc262666"}}/>
              </div>
              <span style={{fontSize:10,color:"#64748b",fontWeight:600,flexShrink:0}}>{totalExp}/{maxExp}</span>
            </div>
          </div>
          <div style={{textAlign:"center",flexShrink:0}}>
            <div style={{fontSize:11,fontWeight:700,color:"#f97316"}}>🔥 7</div>
            <div style={{fontSize:8,color:"#475569"}}>連續</div>
          </div>
        </div>
      </div>

      {/* ── Scrollable Content ─────────────────────────── */}
      <div style={{flex:1,overflowY:"auto",padding:"6px 18px 20px"}}>

        {/* Gate warning */}
        {!medDone && (
          <div style={{background:"#14100a",border:"1px solid #92400e44",borderRadius:10,
            padding:"8px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            <span>⚠️</span>
            <span style={{fontSize:10,color:"#92400e",fontWeight:600}}>完成晨間冥想解鎖所有任務</span>
          </div>
        )}

        {/* ── Today's Battles ──────────────────────────── */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:1}}>
            今日戰鬥 <span style={{color:"#dc2626",fontWeight:800}}>{done.length}/{tasks.length}</span>
          </div>
          <div style={{fontSize:10,color:pct===100?"#22c55e":"#334155",fontWeight:600}}>{pct}%</div>
        </div>

        {/* Critical hit floating */}
        <div style={{position:"relative"}}>
          {crit && (
            <div style={{position:"absolute",left:"50%",top:"40%",zIndex:20,pointerEvents:"none",
              transform:"translateX(-50%)",fontSize:14,fontWeight:900,color:"#fbbf24",
              animation:"critPop .8s ease forwards",textShadow:"0 0 20px #f59e0b",whiteSpace:"nowrap"}}>{crit}</div>
          )}

          {tasks.map((t: any) => {
            const checked = done.includes(t.id);
            const locked = !medDone && t.id !== "med_am";
            const isAnim = expAnim === t.id;
            const statInfo = stats[t.stat] || DEFAULT_STATS[t.stat];

            return (
              <div key={t.id} onClick={() => !locked && toggle(t.id)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                  borderRadius:10,marginBottom:4,position:"relative",cursor:locked?"not-allowed":"pointer",
                  background:checked?"#0c1a0c":"#0f0f14",
                  border:"1px solid "+(checked?"#16a34a22":"#1e293b"),
                  opacity:locked?0.35:1,transition:"all .15s ease",
                  animation:isAnim?"none":"slideUp .2s ease"}}>

                {/* EXP pop */}
                {isAnim && (
                  <div style={{position:"absolute",right:16,top:-4,pointerEvents:"none",zIndex:10,
                    fontSize:13,fontWeight:800,color:"#fbbf24",
                    animation:"expPop .6s ease forwards"}}>+{t.exp}</div>
                )}

                {/* Checkbox */}
                <div style={{width:20,height:20,borderRadius:6,flexShrink:0,transition:"all .15s",
                  border:"2px solid "+(checked?"#22c55e":"#334155"),
                  background:checked?"#22c55e":"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {checked && <svg width="10" height="8" viewBox="0 0 10 8">
                    <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>}
                </div>

                {/* Icon */}
                <span style={{fontSize:16,flexShrink:0}}>{t.icon}</span>

                {/* Content */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:checked?"#4ade80":"#e2e8f0",
                    textDecoration:checked?"line-through":"none",opacity:checked?0.7:1}}>
                    {t.label}
                  </div>
                  <div style={{fontSize:9,color:"#475569",marginTop:1}}>
                    {t.monster} · <span style={{color:statInfo?.col||"#64748b"}}>{t.stat}</span>
                  </div>
                </div>

                {/* EXP badge */}
                <div style={{fontSize:10,fontWeight:700,color:checked?"#22c55e":"#fbbf24",flexShrink:0}}>
                  +{t.exp}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Stats Grid ──────────────────────────────── */}
        <div style={{marginTop:16,marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:1,marginBottom:8}}>能力值</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {statsArr.map(s => (
              <div key={s.key} style={{background:"#0f0f14",border:"1px solid #1e293b",borderRadius:10,padding:"10px 10px 8px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:9,fontWeight:700,color:s.col}}>{s.key}</span>
                  <span style={{fontSize:14,fontWeight:800,color:"#e2e8f0"}}>{Math.floor(s.val)}</span>
                </div>
                <div style={{height:3,background:"#1a1a22",borderRadius:99,overflow:"hidden",marginBottom:4}}>
                  <div style={{height:"100%",background:s.col,borderRadius:99,width:s.val+"%",
                    transition:"width .5s ease",boxShadow:"0 0 6px "+s.col+"66"}}/>
                </div>
                <div style={{fontSize:8,color:"#475569",textAlign:"center"}}>{s.cn}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Quests ─────────────────────────────── */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:1,marginBottom:8}}>主線任務</div>
          {MISSIONS.map(m => (
            <div key={m.name} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:14}}>{m.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:11,fontWeight:600,color:"#cbd5e1"}}>{m.name}</span>
                  <span style={{fontSize:11,fontWeight:700,color:m.col}}>{m.prog}%</span>
                </div>
                <div style={{height:3,background:"#1a1a22",borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",background:m.col,borderRadius:99,width:m.prog+"%",
                    boxShadow:"0 0 6px "+m.col+"66"}}/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── TAVERN Button ───────────────────────────── */}
        <button onClick={() => setShowIntel(!showIntel)}
          style={{width:"100%",padding:"12px",borderRadius:10,cursor:"pointer",
            background:showIntel?"#1a0a0a":"#0f0f14",
            border:"1px solid "+(showIntel?"#dc262644":"#1e293b"),
            color:showIntel?"#ef4444":"#64748b",fontSize:11,fontWeight:700,letterSpacing:1,
            transition:"all .2s",marginBottom:showIntel?10:0}}>
          🍺 情報酒館 {showIntel?"▲":"▼"}
        </button>

        {/* ── Intel Panel ─────────────────────────────── */}
        {showIntel && (
          <div style={{animation:"slideUp .2s ease"}}>
            {[0,1,2].map(ch => {
              const channel = [{icon:"🌍",name:"世界"},{icon:"📈",name:"投資"},{icon:"🏢",name:"產業"}][ch];
              const items = ([
                [{title:"美中關稅升級重塑供應鏈",src:"Reuters"},{title:"台灣半導體出口創 Q1 新高",src:"DigiTimes"},{title:"EU AI 法開始影響全球企業",src:"FT"}],
                [{title:"AI 基建支出全球破 3000 億",src:"Bloomberg"},{title:"台灣 ETF 資金流入激增",src:"TWSE"},{title:"Fed 暗示今年僅剩一次降息",src:"WSJ"}],
                [{title:"台灣室內設計市場年增 12%",src:"住研所"},{title:"台北餐飲：體驗式用餐推動高端化",src:"Eater"},{title:"AI 參數化外牆進入主流",src:"Dezeen"}],
              ] as any)[ch];
              return (
                <div key={ch} style={{marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#475569",marginBottom:6}}>
                    {channel.icon} {channel.name}
                  </div>
                  {items.map((item: any, i: number) => (
                    <div key={i} style={{padding:"6px 10px",background:"#0f0f14",border:"1px solid #1e293b",
                      borderRadius:8,marginBottom:4}}>
                      <div style={{fontSize:11,fontWeight:500,color:"#cbd5e1"}}>{item.title}</div>
                      <div style={{fontSize:9,color:"#475569"}}>{item.src}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
