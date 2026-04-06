import { useState, useEffect, useRef, useCallback } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;overflow:hidden;font-family:'Inter',sans-serif;background:#0a0a0a;color:#e2e8f0}
.dq{font-family:'Press Start 2P',monospace}
.dq-window{background:#0d0d0d;border:2px solid #7f1d1d;border-radius:8px;box-shadow:0 0 20px #1a0a0a,inset 0 0 30px #0a0505}
@keyframes flicker{0%,100%{opacity:1}92%{opacity:1}93%{opacity:.3}96%{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes expPop{0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.4)}100%{opacity:0;transform:translateX(-50%) translateY(-50px) scale(.8)}}
@keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes sysIn{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:translateX(0)}}
@keyframes lvlUp{0%{opacity:0;transform:scale(.4)}50%{transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 10px #dc262633}50%{box-shadow:0 0 24px #dc262677}}
@keyframes critPop{0%{opacity:1;transform:translate(-50%,-50%) scale(1.6)}100%{opacity:0;transform:translate(-50%,-120%) scale(1)}}
@keyframes rewardSlide{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
@keyframes battleFlash{0%{opacity:0}50%{opacity:.3}100%{opacity:0}}
`;

// ── RPG Title & Avatar progression ──────────────────────────
const TITLES: {minLv:number, title:string, cn:string, emoji:string}[] = [
  {minLv:1,  title:"Apprentice",          cn:"見習生",     emoji:"🧑‍💻"},
  {minLv:3,  title:"Explorer",            cn:"探索者",     emoji:"🗺️"},
  {minLv:5,  title:"Alchemist Novice",    cn:"見習煉金師", emoji:"🧪"},
  {minLv:8,  title:"System Builder",      cn:"系統建構者", emoji:"🔧"},
  {minLv:12, title:"Brand Alchemist",     cn:"品牌煉金師", emoji:"🥷"},
  {minLv:18, title:"Domain Master",       cn:"領域大師",   emoji:"🧙‍♂️"},
  {minLv:25, title:"Legendary Alchemist", cn:"傳奇煉金師", emoji:"👑"},
];

function getTitle(lv: number) {
  let current = TITLES[0];
  for (const t of TITLES) {
    if (lv >= t.minLv) current = t;
  }
  return current;
}

function getNextTitle(lv: number) {
  for (const t of TITLES) {
    if (t.minLv > lv) return t;
  }
  return null;
}

// ── Default tasks (unified monster + daily system) ──────────
const DEFAULT_TASKS = [
  {id:"med_am",  label:"晨間冥想",       monster:"心靈史萊姆",   exp:10, stat:"CON", gate:true,  icon:"🧘", type:"每日"},
  {id:"supps",   label:"營養品補充",     monster:"毒蛾",         exp:5,  stat:"CON", gate:false, icon:"💊", type:"每日"},
  {id:"exer",    label:"墊上運動+拉筋",  monster:"沙發魔像",     exp:15, stat:"CON", gate:false, icon:"🤸", type:"每日"},
  {id:"listen",  label:"英文聽力練習",   monster:"怠惰史萊姆",   exp:10, stat:"LNG", gate:false, icon:"👂", type:"每日"},
  {id:"speak",   label:"英文口說",       monster:"沉默蝙蝠",     exp:10, stat:"LNG", gate:false, icon:"🗣️", type:"每日"},
  {id:"vocab",   label:"英文單字",       monster:"咒語精靈",     exp:10, stat:"LNG", gate:false, icon:"📖", type:"每日"},
  {id:"plan",    label:"今日工作規劃",   monster:"混沌骷髏",     exp:10, stat:"INT", gate:false, icon:"📋", type:"每日"},
  {id:"design",  label:"推進設計專案",   monster:"完美主義龍",   exp:25, stat:"DEX", gate:false, icon:"🐉", type:"主線"},
  {id:"content", label:"IG文案/影片腳本",monster:"拖延幽靈",     exp:15, stat:"CHA", gate:false, icon:"📱", type:"每日"},
  {id:"notion",  label:"整理 Notion 主腦",monster:"無知之影",    exp:10, stat:"INT", gate:false, icon:"🧹", type:"每日"},
  {id:"med_pm",  label:"睡前冥想",       monster:"夜行亡靈",     exp:10, stat:"CON", gate:false, icon:"🌙", type:"每日"},
];

const STAT_OPTIONS = ["DEX","INT","WIS","CHA","CON","LNG"];
const ICON_OPTIONS = ["🧘","💊","🤸","👂","🗣️","📖","📋","🐉","📱","🧹","🌙","⚔️","🎯","📐","💡","🔥","📝","🎨","🏋️","🧠"];

const DEFAULT_STATS: Record<string,{cn:string,val:number,col:string,desc:string}> = {
  DEX:{cn:"空間設計",  val:72, col:"#f97316", desc:"品牌空間提案・參數化設計・獨立接案"},
  INT:{cn:"技術系統",  val:61, col:"#3b82f6", desc:"AI 自動化・Notion 系統・腳本開發"},
  WIS:{cn:"商業財務",  val:45, col:"#eab308", desc:"財務規劃・被動收入・投資組合"},
  CHA:{cn:"品牌影響",  val:28, col:"#ec4899", desc:"IG 內容產出・短影片・個人 IP"},
  CON:{cn:"體能紀律",  val:55, col:"#22c55e", desc:"運動習慣・冥想穩定度・睡眠品質"},
  LNG:{cn:"語言實戰",  val:33, col:"#a855f7", desc:"英文商務會議・口說流暢度・簡報能力"},
};

function statRank(v: number) {
  if (v >= 81) return {label:"大師", col:"#fbbf24"};
  if (v >= 61) return {label:"精通", col:"#22c55e"};
  if (v >= 41) return {label:"專業", col:"#3b82f6"};
  if (v >= 21) return {label:"熟手", col:"#a855f7"};
  return {label:"新手", col:"#64748b"};
}

const MISS = [
  {name:"財務自由", desc:"債務清零 → 資產建立 · 被動收入體系", icon:"💰", prog:20, col:"#f59e0b"},
  {name:"生活品質", desc:"健康平衡 · 時間自主 · 身心穩定",     icon:"✨", prog:40, col:"#22c55e"},
  {name:"品牌影響力", desc:"個人 IP · 內容產出 · 產品化",       icon:"📡", prog:15, col:"#a855f7"},
];

const DEFAULT_SKILLS = [
  {tree:"空間煉金師 ⚗️", items:[
    {name:"品牌空間提案",lv:4,goal:"能獨立帶領品牌空間案"},
    {name:"參數化設計 GH",lv:3,goal:"完成 3 個參數化專案"},
    {name:"作品集故事",lv:2,goal:"建立完整線上作品集"},
    {name:"提案簡報",lv:3,goal:"提案成功率 > 70%"},
  ]},
  {tree:"創業家 💰", items:[
    {name:"財務策略",lv:2,goal:"建立被動收入體系"},
    {name:"投資",lv:2,goal:"年化報酬率 > 8%"},
    {name:"團隊管理",lv:3,goal:"管理 10+ 人團隊"},
    {name:"餐飲營運",lv:3,goal:"單店月營收穩定成長"},
  ]},
  {tree:"AI 建構者 🤖", items:[
    {name:"Claude 工作流",lv:4,goal:"建立自動化 pipeline"},
    {name:"Notion 架構",lv:4,goal:"全公司導入 Notion 系統"},
    {name:"自動化",lv:3,goal:"日常任務自動化 80%"},
    {name:"GH 腳本",lv:3,goal:"開發 5+ 實用工具"},
  ]},
  {tree:"內容創作者 📡", items:[
    {name:"短影片",lv:1,goal:"月產 8 支 Reels"},
    {name:"IG 文案",lv:3,goal:"互動率 > 5%"},
    {name:"內容策略",lv:2,goal:"建立內容日曆"},
    {name:"個人品牌",lv:2,goal:"粉絲 10K"},
  ]},
  {tree:"學者 📚", items:[
    {name:"商務英文",lv:2,goal:"流暢參與英文會議"},
    {name:"日文",lv:1,goal:"N3 程度日常會話"},
    {name:"WSET 葡萄酒",lv:2,goal:"取得 WSET Level 3"},
    {name:"反向思考",lv:3,goal:"應用於所有決策"},
  ]},
];

// ── Intel ───────────────────────────────────────────────────
const GNEWS_KEY = "";
const INTEL_CHANNELS = [
  {key:0, icon:"🌍", en:"WORLD", cn:"世界大事", query:"world news Taiwan"},
  {key:1, icon:"📈", en:"INVEST", cn:"投資動態", query:"stock market investing economy"},
  {key:2, icon:"🏢", en:"INDUSTRY", cn:"產業情報", query:"interior design architecture restaurant"},
];

const INTEL_FALLBACK: Record<number, any[]> = {
  0:[
    {icon:"🌏", title:"US-China tariff escalation reshapes supply chains", source:"Reuters", tag:"Global", summary:"New tariff rounds push manufacturers to diversify away from China. Taiwan positioned as key alternative hub.", url:"https://www.reuters.com/world/"},
    {icon:"🇹🇼", title:"Taiwan semiconductor exports hit record Q1 2026", source:"DigiTimes", tag:"Taiwan", summary:"TSMC-led growth drives 18% YoY increase, strengthening NT dollar and regional influence.", url:"https://www.digitimes.com/"},
    {icon:"🌐", title:"EU AI Act enforcement begins affecting global firms", source:"FT", tag:"Regulation", summary:"Companies exporting AI tools to Europe must now comply with risk-tier requirements.", url:"https://www.ft.com/"},
    {icon:"📊", title:"IMF upgrades Asia growth forecast to 4.8%", source:"IMF", tag:"Economy", summary:"Southeast Asia leads recovery as domestic consumption outperforms expectations.", url:"https://www.imf.org/"},
  ],
  1:[
    {icon:"🤖", title:"AI infrastructure spend tops $300B globally in 2026", source:"Bloomberg", tag:"AI", summary:"Hyperscalers accelerate datacenter buildout. Power and cooling stocks surge on demand signals.", url:"https://www.bloomberg.com/"},
    {icon:"📈", title:"Taiwan ETF inflows surge amid tech optimism", source:"TWSE", tag:"Markets", summary:"Foreign institutional buyers returned to Taiwan equities, focusing on semiconductor and AI supply chain.", url:"https://www.twse.com.tw/"},
    {icon:"💰", title:"Fed signals one rate cut remaining in 2026", source:"WSJ", tag:"Macro", summary:"Sticky core inflation delays easing. Dollar strengthens; emerging market capital flows under pressure.", url:"https://www.wsj.com/"},
    {icon:"⚡", title:"Energy AI startups attract record VC funding", source:"TechCrunch", tag:"Venture", summary:"Grid optimization and energy efficiency AI draws $12B in Q1, second only to generative AI.", url:"https://techcrunch.com/"},
  ],
  2:[
    {icon:"🏠", title:"Taiwan interior design market grows 12% YoY", source:"住研所", tag:"Design", summary:"Post-pandemic home renovation demand sustains momentum. Clients increasingly request smart-home integration.", url:"https://www.searchome.net/"},
    {icon:"🍽️", title:"Taipei F&B scene: experiential dining drives premiumization", source:"Eater", tag:"F&B", summary:"Restaurant-goers prioritize atmosphere and narrative over pure cuisine. Brand storytelling becomes key.", url:"https://www.eater.com/"},
    {icon:"🏗️", title:"Biophilic design demand rises across Asia commercial spaces", source:"ArchDaily", tag:"Architecture", summary:"Post-pandemic office redesigns emphasize natural materials, light control, and wellness metrics.", url:"https://www.archdaily.com/"},
    {icon:"📐", title:"AI-generated parametric facades entering mainstream", source:"Dezeen", tag:"Design Tech", summary:"Grasshopper-to-fabrication pipelines now viable for mid-size studios. Early adopters gaining competitive edge.", url:"https://www.dezeen.com/"},
  ],
};

const CRITS = ["CRITICAL HIT!", "BONUS EXP!", "PERFECT EXECUTION!", "SYSTEM BOOST!"];

// ── Helpers ─────────────────────────────────────────────────
function loadJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function saveJSON(key: string, val: any) { localStorage.setItem(key, JSON.stringify(val)); }

function getTaipei() {
  const now = new Date();
  return {
    time: now.toLocaleTimeString("en-US", {timeZone:"Asia/Taipei", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false}),
    date: now.toLocaleDateString("en-US", {timeZone:"Asia/Taipei", weekday:"short", month:"short", day:"numeric", year:"numeric"}),
  };
}

// ── Shared components (outside App) ─────────────────────────
function Ring({col="#7c3aed", size=220, x="60%", y="30%", op=0.12}: {col?:string,size?:number,x?:string,y?:string,op?:number}) {
  return <div style={{position:"absolute",left:x,top:y,width:size,height:size,borderRadius:"50%",
    background:col,filter:"blur(65px)",opacity:op,transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>;
}

function Bar({val, max, col, h=4}: {val:number,max:number,col:string,h?:number}) {
  const pct = Math.max(0, Math.min(100, (val/max)*100));
  return (
    <div style={{height:h,background:"#1e293b",borderRadius:999,overflow:"hidden"}}>
      <div style={{width:pct+"%",height:"100%",background:col,borderRadius:999,
        boxShadow:"0 0 8px "+col+"88",transition:"width .5s ease"}}/>
    </div>
  );
}

function Card({children, style}: {children:any,style?:any}) {
  return <div className="dq-window" style={{padding:"14px 16px",marginBottom:10,...style}}>{children}</div>;
}

function Label({children, style}: {children:any,style?:any}) {
  return <div className="dq" style={{fontSize:7,letterSpacing:1,color:"#ef4444",fontWeight:700,marginBottom:10,...style}}>{children}</div>;
}

function SysToast({msg, onClose}: {msg:string,onClose:()=>void}) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className="dq-window" style={{position:"fixed",top:16,right:12,zIndex:999,animation:"sysIn .3s ease",maxWidth:280,
      padding:"10px 14px"}}>
      <div className="dq" style={{fontSize:6,fontWeight:700,color:"#dc2626",letterSpacing:2,marginBottom:4}}>SYSTEM MESSAGE</div>
      <div style={{fontSize:11,fontWeight:600,color:"#e2e8f0",lineHeight:1.5}}>{msg}</div>
    </div>
  );
}

// ── Level Up Overlay (enhanced with rewards) ────────────────
function LvlOverlay({lv, title, emoji, statBoosts, skillPoints, onDone}:
  {lv:number, title:string, emoji:string, statBoosts:{key:string,cn:string,amount:number}[], skillPoints:number, onDone:()=>void}) {
  useEffect(() => { const t = setTimeout(onDone, 4500); return () => clearTimeout(t); }, []);
  const nextTitle = getNextTitle(lv);
  return (
    <div onClick={onDone} style={{position:"fixed",inset:0,zIndex:500,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.92)",cursor:"pointer"}}>
      <div style={{animation:"lvlUp .55s ease",textAlign:"center",maxWidth:320}}>
        <div className="dq" style={{fontSize:10,letterSpacing:4,color:"#dc2626",fontWeight:700,marginBottom:8}}>— LEVEL UP —</div>
        <div style={{fontSize:56,marginBottom:4}}>{emoji}</div>
        <div style={{fontSize:72,fontWeight:900,
          background:"linear-gradient(135deg,#ef4444,#dc2626)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>
          Lv.{lv}
        </div>
        <div style={{fontSize:14,color:"#ef4444",marginTop:8,fontWeight:700}}>{title}</div>

        {/* Stat boosts */}
        <div style={{marginTop:16,animation:"rewardSlide .4s ease .3s both"}}>
          {statBoosts.map(b => (
            <div key={b.key} style={{fontSize:12,color:"#22c55e",fontWeight:600,marginBottom:4}}>
              {b.cn} +{b.amount}
            </div>
          ))}
        </div>

        {/* Skill points */}
        {skillPoints > 0 && (
          <div style={{marginTop:10,animation:"rewardSlide .4s ease .6s both",
            fontSize:13,color:"#fbbf24",fontWeight:700}}>
            🎯 獲得 {skillPoints} 技能點！前往技能樹升級
          </div>
        )}

        {/* Next title preview */}
        {nextTitle && (
          <div style={{marginTop:14,animation:"rewardSlide .4s ease .9s both",
            fontSize:10,color:"#334155"}}>
            下一稱號：Lv.{nextTitle.minLv} {nextTitle.emoji} {nextTitle.title} {nextTitle.cn}
          </div>
        )}

        <div style={{fontSize:9,color:"#334155",marginTop:16}}>點擊任意處繼續</div>
      </div>
    </div>
  );
}

function IntelRow({item}: {item:any}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{border:"1px solid #1e293b",borderRadius:9,overflow:"hidden",marginBottom:7}}>
      <div onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
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
              style={{display:"inline-block",marginTop:8,fontSize:10,color:"#dc2626",textDecoration:"none",fontWeight:600}}>
              閱讀全文 →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function Clock() {
  const [clock, setClock] = useState(getTaipei());
  useEffect(() => {
    const iv = setInterval(() => setClock(getTaipei()), 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{textAlign:"center",marginBottom:18,position:"relative",zIndex:1}}>
      <div style={{fontSize:38,fontWeight:700,letterSpacing:2,color:"#f1f5f9",
        fontVariantNumeric:"tabular-nums",animation:"flicker 9s infinite"}}>
        {clock.time}
      </div>
      <div style={{fontSize:10,color:"#475569",marginTop:2,letterSpacing:1}}>{clock.date} · TAIPEI</div>
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
  const [done, setDone]         = useState<string[]>([]);
  const [tasks, setTasks]       = useState(() => loadJSON("mq_tasks", DEFAULT_TASKS));
  const [editMode, setEditMode] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [newTask, setNewTask]   = useState({label:"",cn:"",exp:10,stat:"CON",icon:"⚔️",gate:false});
  const [quests, setQuests]     = useState<{id:number,name:string,done:boolean}[]>([]);
  const [qInput, setQInput]     = useState("");
  const [toast, setToast]       = useState<string|null>(null);
  const [lvlUpData, setLvlUpData] = useState<{lv:number,title:string,emoji:string,statBoosts:{key:string,cn:string,amount:number}[],skillPoints:number}|null>(null);
  const [expAnim, setExpAnim]   = useState<string|null>(null);
  const [crit, setCrit]         = useState<string|null>(null);
  const [streak]                = useState(7);
  const [intelCh, setIntelCh]   = useState<number|null>(null);
  const [loading, setLoading]   = useState(false);
  const [intel, setIntel]       = useState<any[]>([]);
  const [skills, setSkills]     = useState(() => loadJSON("mq_skills", DEFAULT_SKILLS));
  const [stats, setStats]       = useState(() => loadJSON("mq_stats", DEFAULT_STATS));
  const [skillPts, setSkillPts] = useState(() => loadJSON("mq_skillpts", 0));
  const prevLv = useRef(1);

  // Persist
  useEffect(() => { saveJSON("mq_tasks", tasks); }, [tasks]);
  useEffect(() => { saveJSON("mq_skills", skills); }, [skills]);
  useEffect(() => { saveJSON("mq_stats", stats); }, [stats]);
  useEffect(() => { saveJSON("mq_skillpts", skillPts); }, [skillPts]);

  const medDone  = done.includes("med_am");
  const totalExp = tasks.filter((t:any) => done.includes(t.id)).reduce((s:number,t:any) => s+t.exp, 0);
  const maxExp   = tasks.reduce((s:number,t:any) => s+t.exp, 0);
  const lv       = 1 + Math.floor(totalExp / 50);
  const titleInfo = getTitle(lv);

  // Level up detection
  useEffect(() => {
    if (lv > prevLv.current) {
      // Calculate stat boosts from completed tasks
      const completedStats: Record<string,number> = {};
      tasks.filter((t:any) => done.includes(t.id)).forEach((t:any) => {
        completedStats[t.stat] = (completedStats[t.stat] || 0) + 1;
      });
      // Boost top 2 stats by 1-2 each
      const sorted = Object.entries(completedStats).sort((a,b) => b[1]-a[1]).slice(0, 2);
      const boosts = sorted.map(([key]) => {
        const amount = Math.ceil(Math.random() * 2);
        return {key, cn: (stats[key] as any)?.cn || key, amount};
      });
      // Apply boosts
      setStats((prev: any) => {
        const copy = {...prev};
        boosts.forEach(b => {
          if (copy[b.key]) {
            copy[b.key] = {...copy[b.key], val: Math.min(100, copy[b.key].val + b.amount)};
          }
        });
        return copy;
      });
      // Grant skill point
      const pts = lv % 3 === 0 ? 2 : 1;
      setSkillPts((p: number) => p + pts);
      // Show overlay
      const t = getTitle(lv);
      setLvlUpData({lv, title:t.title, emoji:t.emoji, statBoosts:boosts, skillPoints:pts});
    }
    prevLv.current = lv;
  }, [lv]);

  function toggle(id: string) {
    const task = tasks.find((t:any) => t.id === id);
    if (!task) return;
    const wasDone = done.includes(id);
    setDone(d => wasDone ? d.filter(x => x !== id) : [...d, id]);
    if (!wasDone) {
      // Dynamic stat update: +0.1 to +0.5 per task completion
      const statGain = Math.round((Math.random() * 0.4 + 0.1) * 10) / 10;
      setStats((prev: any) => {
        if (!prev[task.stat]) return prev;
        const copy = {...prev};
        copy[task.stat] = {...copy[task.stat], val: Math.min(100, Math.round((copy[task.stat].val + statGain) * 10) / 10)};
        return copy;
      });

      setExpAnim(id);
      setTimeout(() => setExpAnim(null), 800);
      const monsterName = task.monster || task.label;
      if (Math.random() < 0.15) {
        const cm = CRITS[Math.floor(Math.random()*CRITS.length)];
        setCrit(cm);
        setTimeout(() => setCrit(null), 1100);
        setToast(`⚔️ 擊敗 ${monsterName}！${cm} +${task.exp} EXP · ${task.stat} +${statGain}`);
      } else {
        setToast(`⚔️ 擊敗 ${monsterName}！+${task.exp} EXP · ${task.stat} +${statGain}`);
      }
      if (done.length + 1 === tasks.length) {
        setTimeout(() => setToast("🏆 全部怪物已擊敗 — 日結獎勵解鎖！"), 900);
      }
    }
  }

  function deleteTask(id: string) {
    setTasks((ts: any[]) => ts.filter(t => t.id !== id));
    setDone(d => d.filter(x => x !== id));
    setToast("🗑️ 任務已刪除");
  }

  function moveTask(id: string, dir: -1|1) {
    setTasks((ts: any[]) => {
      const idx = ts.findIndex(t => t.id === id);
      if (idx < 0) return ts;
      const ni = idx + dir;
      if (ni < 0 || ni >= ts.length) return ts;
      const c = [...ts]; [c[idx], c[ni]] = [c[ni], c[idx]]; return c;
    });
  }

  function addNewTask() {
    if (!newTask.label.trim()) return;
    setTasks((ts: any[]) => [...ts, {...newTask, id:"task_"+Date.now()}]);
    setNewTask({label:"",cn:"",exp:10,stat:"CON",icon:"⚔️",gate:false});
    setAddingTask(false);
    setToast("✅ 新任務已新增");
  }

  function resetTasks() {
    setTasks(DEFAULT_TASKS); setDone([]); saveJSON("mq_tasks", DEFAULT_TASKS);
    setToast("🔄 任務清單已重置");
  }

  function addQuest() {
    if (!qInput.trim()) return;
    setQuests(q => [{id:Date.now(), name:qInput.trim(), done:false}, ...q]);
    setQInput(""); setToast("⚔️ 新任務已加入！");
  }

  function spendSkillPt(treeIdx: number, itemIdx: number) {
    if (skillPts <= 0) { setToast("❌ 沒有技能點可用"); return; }
    setSkills((prev: any[]) => prev.map((tree: any, ti: number) => {
      if (ti !== treeIdx) return tree;
      return {...tree, items: tree.items.map((item: any, ii: number) => {
        if (ii !== itemIdx || item.lv >= 5) return item;
        return {...item, lv: item.lv + 1};
      })};
    }));
    setSkillPts((p: number) => p - 1);
    setToast("⬆️ 技能升級！");
  }

  const loadIntel = useCallback(async (ch: number) => {
    setIntelCh(ch); setLoading(true); setIntel([]);
    if (GNEWS_KEY) {
      try {
        const q = INTEL_CHANNELS[ch]?.query || "news";
        const res = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&max=6&apikey=${GNEWS_KEY}`);
        const data = await res.json();
        if (data.articles?.length > 0) {
          setIntel(data.articles.map((a: any) => ({
            icon: ch===0?"🌍":ch===1?"📈":"🏢", title: a.title,
            source: a.source?.name || "News", tag: INTEL_CHANNELS[ch]?.cn || "",
            summary: a.description || "", url: a.url,
          })));
          setLoading(false); return;
        }
      } catch (e) { console.warn("API failed", e); }
    }
    setTimeout(() => { setIntel(INTEL_FALLBACK[ch] || []); setLoading(false); }, 600);
  }, []);

  // ── Nav ──────────────────────────────────────────────────
  const NAV = [["⚡","COMMAND","指揮台"],["📋","BATTLE","戰鬥"],["📡","TAVERN","情報站"],["🧬","SKILLS","技能樹"]];
  function Nav() {
    return (
      <div style={{display:"flex",gap:4,padding:"0 14px 10px",flexShrink:0}}>
        {NAV.map(([ico,en,cn], i) => (
          <button key={en} onClick={() => setPage(i)} style={{
            flex:1, padding:"7px 2px", borderRadius:6, cursor:"pointer", transition:"all .2s",
            border:"2px solid "+(page===i?"#dc2626":"#1e293b"),
            background:page===i?"#1a0a0a":"transparent",
            color:page===i?"#dc2626":"#475569", position:"relative",
          }}>
            <div style={{fontSize:13,marginBottom:1}}>{ico}</div>
            <div className="dq" style={{fontSize:6,fontWeight:700,letterSpacing:.5}}>{en}</div>
            <div style={{fontSize:7,color:page===i?"#ef4444":"#334155"}}>{cn}</div>
            {en === "SKILLS" && skillPts > 0 && (
              <div style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",
                background:"#ef4444",fontSize:9,fontWeight:700,color:"#fff",
                display:"flex",alignItems:"center",justifyContent:"center"}}>{skillPts}</div>
            )}
          </button>
        ))}
      </div>
    );
  }

  // ── Page 0: COMMAND ──────────────────────────────────────
  function PageCommand() {
    const nextTitle = getNextTitle(lv);
    const statsArr = STAT_OPTIONS.map(k => ({key:k, ...(stats[k] || DEFAULT_STATS[k])}));
    return (
      <div style={{padding:"0 14px",overflowY:"auto",flex:1}}>
        <Ring col="#dc2626" size={260} x="75%" y="25%" op={0.11}/>
        <Ring col="#3b82f6" size={160} x="15%" y="65%" op={0.07}/>
        <Clock/>

        {/* Character */}
        <Card style={{position:"relative",overflow:"hidden",animation:"glow 4s ease infinite"}}>
          <Ring col="#dc2626" size={100} x="90%" y="50%" op={0.2}/>
          <div style={{position:"absolute",right:10,top:10,
            animation:"float 3s ease infinite",zIndex:0,
            display:"flex",flexDirection:"column",alignItems:"center",gap:0,opacity:0.95}}>
            <span style={{fontSize:32,filter:"drop-shadow(0 0 10px #dc262688)",lineHeight:1}}>{titleInfo.emoji}</span>
            <span style={{fontSize:12,marginTop:-2}}>⚔️🔮⚡</span>
          </div>
          <div style={{position:"relative",zIndex:1}}>
            <Label>玩家狀態 PLAYER STATUS</Label>
            <div style={{fontSize:20,fontWeight:800,color:"#e2e8f0"}}>
              MO <span className="dq" style={{fontSize:11,color:"#dc2626",fontWeight:600}}>Lv.{lv}</span>
            </div>
            <div style={{fontSize:10,color:"#ef4444",fontWeight:600,marginBottom:2}}>{titleInfo.cn} <span style={{color:"#475569",fontSize:9}}>{titleInfo.title}</span></div>
            {nextTitle && (
              <div style={{fontSize:8,color:"#334155",marginBottom:8}}>
                下一稱號：Lv.{nextTitle.minLv} {nextTitle.emoji} {nextTitle.cn}
              </div>
            )}
            <div style={{fontSize:9,color:"#64748b",display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span>今日經驗值</span><span>{totalExp} / {maxExp}</span>
            </div>
            <Bar val={totalExp} max={maxExp} col="#dc2626" h={6}/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
              <span style={{fontSize:12}}>🔥</span>
              <span style={{fontSize:11,fontWeight:600,color:"#f97316"}}>{streak} 天連續</span>
              <span style={{fontSize:10,color:"#475569",marginLeft:"auto"}}>{done.length}/{tasks.length} 任務</span>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Card>
          <Label>六大能力值 STATS</Label>
          {statsArr.map(s => {
            const rank = statRank(s.val);
            return (
              <div key={s.key} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                  <span style={{fontSize:11,fontWeight:700,color:s.col}}>{s.key}</span>
                  <span style={{fontSize:10,color:"#475569"}}>{s.cn}</span>
                  <span style={{fontSize:9,fontWeight:600,color:rank.col,background:"#1e293b",
                    padding:"1px 6px",borderRadius:999}}>{rank.label}</span>
                  <span style={{fontSize:12,fontWeight:700}}>{s.val}</span>
                </div>
                <Bar val={s.val} max={100} col={s.col}/>
                <div style={{fontSize:8,color:"#334155",marginTop:2}}>{s.desc}</div>
              </div>
            );
          })}
          <div style={{fontSize:8,color:"#334155",borderTop:"1px solid #1e293b",paddingTop:6,marginTop:4}}>
            0-20 新手 → 21-40 熟手 → 41-60 專業 → 61-80 精通 → 81-100 大師
          </div>
        </Card>

        {/* Main quests */}
        <Card>
          <Label>主線任務 MAIN QUESTS</Label>
          {MISS.map(m => (
            <div key={m.name} style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span>{m.icon}</span>
                <span style={{fontSize:11,fontWeight:600,color:"#cbd5e1"}}>{m.name}</span>
                <span style={{fontSize:11,fontWeight:700,color:m.col,marginLeft:"auto"}}>{m.prog}%</span>
              </div>
              <Bar val={m.prog} max={100} col={m.col}/>
              <div style={{fontSize:8,color:"#334155",marginTop:2}}>{m.desc}</div>
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
        {!medDone && tasks.some((t:any) => t.gate) && (
          <div className="dq-window" style={{borderColor:"#ea580c",
            padding:"10px 14px",marginBottom:10,display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:16}}>⚠️</span>
            <div>
              <div className="dq" style={{fontSize:7,fontWeight:700,color:"#ea580c"}}>SYSTEM LOCKED</div>
              <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>完成晨間冥想以解鎖所有任務</div>
            </div>
          </div>
        )}

        <Card style={{position:"relative"}}>
          {crit && (
            <div style={{position:"absolute",left:"50%",top:"30%",zIndex:20,pointerEvents:"none",
              fontSize:13,fontWeight:900,color:"#fbbf24",whiteSpace:"nowrap",
              animation:"critPop .9s ease forwards",textShadow:"0 0 20px #f59e0b"}}>{crit}</div>
          )}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <Label style={{marginBottom:0}}>DAILY QUESTS</Label>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:10,color:done.length===tasks.length?"#22c55e":"#475569",fontWeight:600}}>
                {done.length}/{tasks.length} · {totalExp}EXP
              </span>
              <button onClick={() => setEditMode(e => !e)}
                style={{background:editMode?"#dc2626":"#1e293b",border:"none",borderRadius:6,
                  padding:"3px 8px",color:editMode?"#fff":"#64748b",fontSize:9,fontWeight:700,
                  cursor:"pointer",transition:"all .2s"}}>
                {editMode ? "完成" : "編輯"}
              </button>
            </div>
          </div>

          {tasks.map((t:any, idx:number) => {
            const checked = done.includes(t.id);
            const locked = !medDone && t.id !== "med_am" && tasks.some((tt:any) => tt.gate);
            const isAnim = expAnim === t.id;

            if (editMode) {
              return (
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 8px",
                  borderRadius:9,border:"1px solid #1e293b",marginBottom:5,background:"#0a0a14"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    <button onClick={() => moveTask(t.id,-1)} disabled={idx===0}
                      style={{background:"none",border:"none",color:idx===0?"#1e293b":"#64748b",
                        cursor:idx===0?"default":"pointer",fontSize:10,lineHeight:1,padding:0}}>▲</button>
                    <button onClick={() => moveTask(t.id,1)} disabled={idx===tasks.length-1}
                      style={{background:"none",border:"none",color:idx===tasks.length-1?"#1e293b":"#64748b",
                        cursor:idx===tasks.length-1?"default":"pointer",fontSize:10,lineHeight:1,padding:0}}>▼</button>
                  </div>
                  <span style={{fontSize:14}}>{t.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:500,color:"#cbd5e1"}}>{t.monster || t.label}</div>
                    <div style={{fontSize:9,color:"#475569"}}>{t.label} · {t.stat} · +{t.exp}EXP</div>
                  </div>
                  <button onClick={() => deleteTask(t.id)}
                    style={{background:"#1a0000",border:"1px solid #7f1d1d",borderRadius:6,
                      padding:"4px 8px",color:"#ef4444",fontSize:10,fontWeight:700,cursor:"pointer"}}>刪除</button>
                </div>
              );
            }

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
                    animation:"expPop .75s ease forwards"}}>+{t.exp} EXP</div>
                )}
                <div style={{width:18,height:18,borderRadius:5,flexShrink:0,transition:"all .2s",
                  border:"2px solid "+(checked?"#dc2626":"#334155"),
                  background:checked?"#dc2626":"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {checked && <svg width="9" height="7" viewBox="0 0 9 7">
                    <path d="M1 3.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  </svg>}
                </div>
                <span style={{fontSize:14}}>{t.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:500,color:checked?"#64748b":"#cbd5e1",
                    textDecoration:checked?"line-through":"none"}}>{t.monster || t.label}</div>
                  <div style={{fontSize:9,color:"#475569"}}>{t.label}{t.type==="主線"?" ★":""}</div>
                </div>
                <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
                  <span style={{fontSize:9,color:"#475569",background:"#1e293b",padding:"2px 6px",borderRadius:999}}>{t.stat}</span>
                  <span style={{fontSize:10,fontWeight:700,color:"#fbbf24"}}>+{t.exp}</span>
                </div>
              </div>
            );
          })}

          {editMode && (
            <div style={{marginTop:8}}>
              {addingTask ? (
                <div style={{border:"1px solid #7c3aed",borderRadius:10,padding:12,background:"#0a0a14"}}>
                  <div style={{display:"flex",gap:6,marginBottom:8}}>
                    <input value={newTask.label} onChange={e => setNewTask(n => ({...n, label:e.target.value}))}
                      placeholder="Task name" style={{flex:1,background:"#070710",border:"1px solid #1e293b",
                        borderRadius:6,padding:"6px 10px",color:"#e2e8f0",fontSize:11,outline:"none"}}/>
                    <input value={newTask.cn} onChange={e => setNewTask(n => ({...n, cn:e.target.value}))}
                      placeholder="怪物名稱" style={{flex:1,background:"#070710",border:"1px solid #1e293b",
                        borderRadius:6,padding:"6px 10px",color:"#e2e8f0",fontSize:11,outline:"none"}}/>
                  </div>
                  <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
                    <select value={newTask.icon} onChange={e => setNewTask(n => ({...n, icon:e.target.value}))}
                      style={{background:"#070710",border:"1px solid #1e293b",borderRadius:6,padding:"6px 8px",color:"#e2e8f0",fontSize:14,outline:"none"}}>
                      {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                    <select value={newTask.stat} onChange={e => setNewTask(n => ({...n, stat:e.target.value}))}
                      style={{background:"#070710",border:"1px solid #1e293b",borderRadius:6,padding:"6px 8px",color:"#e2e8f0",fontSize:11,outline:"none"}}>
                      {STAT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:10,color:"#64748b"}}>EXP:</span>
                      <input type="number" value={newTask.exp} min={1} max={50}
                        onChange={e => setNewTask(n => ({...n, exp:parseInt(e.target.value)||5}))}
                        style={{width:50,background:"#070710",border:"1px solid #1e293b",borderRadius:6,
                          padding:"6px 8px",color:"#fbbf24",fontSize:11,outline:"none",textAlign:"center"}}/>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={addNewTask} style={{flex:1,background:"#dc2626",border:"none",borderRadius:6,padding:"7px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>新增任務</button>
                    <button onClick={() => setAddingTask(false)} style={{flex:1,background:"#1e293b",border:"none",borderRadius:6,padding:"7px",color:"#64748b",fontSize:11,fontWeight:700,cursor:"pointer"}}>取消</button>
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",gap:6}}>
                  <button onClick={() => setAddingTask(true)} style={{flex:1,background:"#1a0a0a",border:"1px solid #dc2626",borderRadius:8,padding:"8px",color:"#dc2626",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ 新增任務</button>
                  <button onClick={resetTasks} style={{background:"#1a0a00",border:"1px solid #92400e",borderRadius:8,padding:"8px 12px",color:"#f59e0b",fontSize:11,fontWeight:700,cursor:"pointer"}}>重置預設</button>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card>
          <Label>⚔️ INSTANT QUEST</Label>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <input value={qInput} onChange={e => setQInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && addQuest()} placeholder="新增臨時任務..."
              style={{flex:1,background:"#070710",border:"1px solid #1e293b",borderRadius:8,
                padding:"9px 12px",color:"#e2e8f0",fontSize:11,outline:"none"}}/>
            <button onClick={addQuest} style={{background:"#dc2626",border:"none",borderRadius:8,padding:"9px 16px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>+</button>
          </div>
          {quests.length === 0 && <div style={{fontSize:10,color:"#334155",textAlign:"center",padding:"6px 0"}}>目前沒有臨時任務 — The battlefield awaits!</div>}
          {quests.map(q => (
            <div key={q.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #1e293b"}}>
              <div onClick={() => setQuests(qs => qs.map(x => x.id===q.id?{...x,done:!x.done}:x))}
                style={{width:15,height:15,borderRadius:4,border:"1.5px solid "+(q.done?"#dc2626":"#334155"),
                  background:q.done?"#dc2626":"transparent",cursor:"pointer",flexShrink:0}}/>
              <span style={{fontSize:11,flex:1,color:q.done?"#475569":"#cbd5e1",textDecoration:q.done?"line-through":"none"}}>{q.name}</span>
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
    return (
      <div style={{padding:"0 14px",overflowY:"auto",flex:1}}>
        <Card>
          <Label>情報頻道 INTEL</Label>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {INTEL_CHANNELS.map(c => (
              <button key={c.key} onClick={() => loadIntel(c.key)}
                style={{flex:1,padding:"10px 4px",borderRadius:6,cursor:"pointer",transition:"all .2s",
                  border:"2px solid "+(intelCh===c.key?"#dc2626":"#1e293b"),
                  background:intelCh===c.key?"#1a0a0a":"transparent",
                  color:intelCh===c.key?"#dc2626":"#475569",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:2}}>{c.icon}</div>
                <div className="dq" style={{fontSize:6,fontWeight:700,letterSpacing:.5}}>{c.en}</div>
                <div style={{fontSize:8,color:intelCh===c.key?"#ef4444":"#334155"}}>{c.cn}</div>
              </button>
            ))}
          </div>
          {loading && (
            <div style={{textAlign:"center",padding:"28px 0"}}>
              <div style={{width:26,height:26,border:"3px solid #1e293b",borderTop:"3px solid #dc2626",
                borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 10px"}}/>
              <div style={{fontSize:10,color:"#475569"}}>正在抓取情報...</div>
            </div>
          )}
          {!loading && intelCh === null && (
            <div style={{textAlign:"center",padding:"28px 0",color:"#334155",fontSize:11}}>選擇頻道載入今日情報</div>
          )}
          {!loading && intel.map((item, i) => <IntelRow key={item.title || i} item={item}/>)}
          {!loading && !GNEWS_KEY && intelCh !== null && (
            <div style={{fontSize:9,color:"#334155",textAlign:"center",marginTop:8,padding:"4px 0",
              borderTop:"1px solid #1e293b"}}>目前顯示預設資料 · 設定 API Key 可取得即時新聞</div>
          )}
        </Card>
      </div>
    );
  }

  // ── Page 3: SKILLS ───────────────────────────────────────
  function PageSkills() {
    return (
      <div style={{padding:"0 14px",overflowY:"auto",flex:1}}>
        {skillPts > 0 && (
          <div className="dq-window" style={{
            padding:"10px 14px",marginBottom:10,display:"flex",gap:8,alignItems:"center",
            animation:"glow 2s ease infinite"}}>
            <span style={{fontSize:18}}>🎯</span>
            <div>
              <div className="dq" style={{fontSize:8,fontWeight:700,color:"#dc2626"}}>{skillPts} SKILL POINTS!</div>
              <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>你有 {skillPts} 個技能點！點擊「LV UP」升級技能</div>
            </div>
          </div>
        )}

        {skills.map((tree: any, treeIdx: number) => (
          <Card key={tree.tree}>
            <div className="dq" style={{fontSize:8,fontWeight:700,color:"#dc2626",marginBottom:12}}>{tree.tree}</div>
            {tree.items.map((item: any, itemIdx: number) => (
              <div key={item.name} style={{marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:10,color:"#e2e8f0",flex:1,fontWeight:500}}>{item.name}</span>
                  <div style={{display:"flex",gap:3}}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{width:12,height:12,borderRadius:3,transition:"all .3s",
                        background:i<=item.lv?"#dc2626":"#1e293b",
                        boxShadow:i<=item.lv?"0 0 5px #dc262688":"none",
                        border:"1px solid "+(i<=item.lv?"#ef4444":"#334155")}}/>
                    ))}
                  </div>
                  <span style={{fontSize:10,color:"#475569",minWidth:26,textAlign:"right",fontWeight:600}}>{item.lv}/5</span>
                  {skillPts > 0 && item.lv < 5 && (
                    <button onClick={() => spendSkillPt(treeIdx, itemIdx)}
                      style={{background:"#dc2626",border:"none",borderRadius:6,padding:"3px 8px",
                        color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",marginLeft:4}}>LV UP</button>
                  )}
                </div>
                {item.goal && (
                  <div style={{fontSize:9,color:"#334155",paddingLeft:2,display:"flex",alignItems:"center",gap:4}}>
                    <span style={{color:"#dc2626"}}>🎯</span><span>{item.goal}</span>
                  </div>
                )}
              </div>
            ))}
          </Card>
        ))}

        <button onClick={() => {
          setSkills(DEFAULT_SKILLS); saveJSON("mq_skills", DEFAULT_SKILLS);
          setStats(DEFAULT_STATS); saveJSON("mq_stats", DEFAULT_STATS);
          setSkillPts(0); saveJSON("mq_skillpts", 0);
          setToast("🔄 技能與能力值已重置");
        }} style={{width:"100%",background:"#1e293b",border:"none",borderRadius:8,
          padding:"8px",color:"#64748b",fontSize:10,fontWeight:600,cursor:"pointer",marginBottom:20}}>
          重置技能樹與能力值
        </button>
      </div>
    );
  }

  return (
    <div style={{width:"100%",height:"100%",maxWidth:430,margin:"0 auto",
      display:"flex",flexDirection:"column",background:"#0a0a0a",position:"relative",overflow:"hidden"}}>

      {toast && <SysToast msg={toast} onClose={() => setToast(null)}/>}
      {lvlUpData && <LvlOverlay {...lvlUpData} onDone={() => setLvlUpData(null)}/>}

      <div style={{padding:"14px 14px 0",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div className="dq" style={{fontSize:9,letterSpacing:3,color:"#dc2626",fontWeight:700}}>MO'S QUEST</div>
            <div style={{fontSize:7,color:"#334155",letterSpacing:1}}>每日指揮系統 v4</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:8,color:"#334155"}}>Lv.{lv} {titleInfo.emoji} · {maxExp > 0 ? Math.round((totalExp/maxExp)*100) : 0}%</div>
            <div style={{fontSize:10,color:"#f97316",fontWeight:700}}>🔥 {streak}d</div>
          </div>
        </div>
        <Nav/>
      </div>

      <div style={{flex:1,overflowY:"hidden",display:"flex",flexDirection:"column",animation:"slideIn .2s ease"}}>
        {page === 0 && <PageCommand/>}
        {page === 1 && <PageDaily/>}
        {page === 2 && <PageIntel/>}
        {page === 3 && <PageSkills/>}
      </div>
    </div>
  );
}
