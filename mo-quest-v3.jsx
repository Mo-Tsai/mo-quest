import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══════════════════════════════════════
//  Mo's Quest — Dragon Quest RPG Dashboard
//  Full English · Learn by Playing
// ═══════════════════════════════════════

const PX = (n) => ({ fontFamily: "'Press Start 2P', monospace", fontSize: n, lineHeight: `${n + 8}px` });

const C = {
  black: "#101018",
  dqBlue: "#1010a0",
  dqBlueDark: "#080860",
  dqBorder: "#f0f0f0",
  white: "#f0f0f0",
  gray: "#888898",
  gold: "#f8d830",
  red: "#e84848",
  green: "#48c848",
  cyan: "#48b8f0",
  skin: "#f0b870",
  hair: "#483818",
  cape: "#c03030",
  grass1: "#38a038",
  grass2: "#288028",
  sky1: "#78b8f8",
  sky2: "#3878c8",
  stone1: "#989898",
  stone2: "#686868",
  wood1: "#a86830",
  wood2: "#704820",
};

// ─── DQ WINDOW ───
function W({ children, style = {} }) {
  return (
    <div style={{
      background: C.dqBlue,
      border: `3px solid ${C.dqBorder}`,
      borderRadius: 8,
      padding: 12,
      boxShadow: `inset 1px 1px 0 rgba(255,255,255,0.2), inset -1px -1px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.5)`,
      position: "relative",
      ...style,
    }}>{children}</div>
  );
}

// ─── TYPEWRITER ───
function TypeWriter({ text, speed = 28, onDone }) {
  const [shown, setShown] = useState("");
  const [finished, setFinished] = useState(false);
  const iRef = useRef(0);
  const tRef = useRef(text);

  useEffect(() => {
    tRef.current = text;
    setShown("");
    setFinished(false);
    iRef.current = 0;
  }, [text]);

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => {
      if (iRef.current < tRef.current.length) {
        setShown(tRef.current.slice(0, iRef.current + 1));
        iRef.current++;
      } else {
        setFinished(true);
        onDone?.();
        clearInterval(t);
      }
    }, speed);
    return () => clearInterval(t);
  }, [text, finished, speed, onDone]);

  return (
    <span style={{ ...PX(9), color: C.white }}>
      {shown}
      {!finished && <span style={{ animation: "blink .5s infinite" }}>▎</span>}
    </span>
  );
}

// ─── TILE PATTERNS (CSS backgrounds) ───
const TILES = {
  grass: `repeating-conic-gradient(${C.grass1} 0% 25%, ${C.grass2} 0% 50%) 0 0 / 16px 16px`,
  stone: `repeating-conic-gradient(${C.stone1} 0% 25%, ${C.stone2} 0% 50%) 0 0 / 16px 16px`,
  wood: `repeating-conic-gradient(${C.wood1} 0% 25%, ${C.wood2} 0% 50%) 0 0 / 12px 12px`,
  sky: `linear-gradient(180deg, ${C.sky2} 0%, ${C.sky1} 100%)`,
  night: `linear-gradient(180deg, #080020 0%, #181848 50%, #282868 100%)`,
  tavern: `linear-gradient(180deg, ${C.wood2} 0%, #1a0e06 100%)`,
};

// ─── MONSTER GALLERY ───
const MONSTER_SHAPES = {
  slime: { body: "#48d0f8", eye: C.white, mouth: C.white, shape: "blob" },
  bat: { body: "#9050c0", eye: "#ff4040", mouth: C.white, shape: "angular" },
  golem: { body: "#c08848", eye: "#40ff40", mouth: C.black, shape: "square" },
  ghost: { body: "#c0c0d0", eye: "#303050", mouth: "#303050", shape: "wavy" },
  skeleton: { body: "#e0dcc8", eye: "#e04040", mouth: C.black, shape: "angular" },
  dragon: { body: "#e04848", eye: "#f8f040", mouth: "#f88040", shape: "angular" },
  shadow: { body: "#383848", eye: "#c040c0", mouth: "#6020a0", shape: "wavy" },
  imp: { body: "#f0d040", eye: C.black, mouth: C.red, shape: "blob" },
};

function Monster({ type, size = 80, hit = false, dead = false }) {
  const m = MONSTER_SHAPES[type] || MONSTER_SHAPES.slime;
  const borderR = m.shape === "blob" ? "50% 50% 40% 40%" : m.shape === "wavy" ? "30% 30% 50% 50%" : "12%";
  return (
    <div style={{
      width: size, height: size, background: m.body, borderRadius: borderR,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      border: `3px solid rgba(0,0,0,0.3)`,
      boxShadow: `0 4px 12px rgba(0,0,0,0.4), inset 0 -${size/4}px ${size/3}px rgba(0,0,0,0.15)`,
      position: "relative", overflow: "hidden",
      animation: dead ? "none" : hit ? "monsterHit .4s" : "monsterFloat 2s ease infinite",
      opacity: dead ? 0 : 1, transition: "opacity .8s",
      transform: m.shape === "wavy" ? "scaleX(1.1)" : "none",
    }}>
      {/* Highlight */}
      <div style={{ position: "absolute", top: size*0.12, left: size*0.2, width: size*0.2, height: size*0.15, background: "rgba(255,255,255,0.35)", borderRadius: "50%" }} />
      {/* Eyes */}
      <div style={{ display: "flex", gap: size*0.18, marginTop: -size*0.05 }}>
        {[0,1].map(i => (
          <div key={i} style={{ width: size*0.16, height: size*0.18, background: C.white, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: size*0.08, height: size*0.1, background: m.eye === C.white ? C.black : m.eye, borderRadius: "50%" }} />
          </div>
        ))}
      </div>
      {/* Mouth */}
      <div style={{ width: size*0.22, height: size*0.08, borderRadius: "0 0 50% 50%", border: `2px solid ${m.mouth}`, borderTop: "none", marginTop: size*0.06 }} />
    </div>
  );
}

// ─── SLASH EFFECT ───
function SlashEffect({ active }) {
  if (!active) return null;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, pointerEvents: "none" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          position: "absolute",
          top: `${20 + i*15}%`, left: `${15 + i*10}%`,
          width: "60%", height: 3,
          background: `linear-gradient(90deg, transparent, ${C.white}, transparent)`,
          transform: "rotate(-35deg)",
          animation: `slashLine .3s ease ${i*0.06}s both`,
        }} />
      ))}
    </div>
  );
}

// ─── DAMAGE NUMBER ───
function DmgNum({ value, x, y }) {
  return (
    <div style={{
      position: "absolute", top: y, left: x, zIndex: 40,
      ...PX(14), color: C.white, textShadow: `2px 2px 0 ${C.black}`,
      animation: "dmgPop .8s ease forwards", pointerEvents: "none",
    }}>{value}</div>
  );
}

// ─── PIXEL HERO (simple) ───
function Hero({ action = "idle", flip = false }) {
  const w = 40, h = 56;
  const isAtk = action === "attack";
  return (
    <div style={{
      width: w, height: h, position: "relative",
      transform: flip ? "scaleX(-1)" : "none",
      animation: isAtk ? "heroLunge .4s ease" : action === "walk" ? "heroWalk .5s infinite" : "heroIdle 1.5s ease infinite",
    }}>
      {/* Hair */}
      <div style={{ position: "absolute", top: 0, left: 8, width: 24, height: 14, background: C.hair, borderRadius: "8px 8px 2px 2px" }} />
      {/* Face */}
      <div style={{ position: "absolute", top: 10, left: 10, width: 20, height: 16, background: C.skin, borderRadius: 4 }}>
        <div style={{ position: "absolute", top: 4, left: 3, width: 4, height: 4, background: C.black, borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: 4, right: 3, width: 4, height: 4, background: C.black, borderRadius: "50%" }} />
      </div>
      {/* Body */}
      <div style={{ position: "absolute", top: 26, left: 6, width: 28, height: 18, background: C.cape, borderRadius: 4 }}>
        <div style={{ position: "absolute", top: 2, left: "50%", transform: "translateX(-50%)", width: 8, height: 6, background: C.gold, borderRadius: 2 }} />
      </div>
      {/* Legs */}
      <div style={{ position: "absolute", top: 44, left: 10, width: 8, height: 12, background: "#4040a0", borderRadius: "0 0 3px 3px" }} />
      <div style={{ position: "absolute", top: 44, right: 10, width: 8, height: 12, background: "#4040a0", borderRadius: "0 0 3px 3px" }} />
      {/* Sword (attack) */}
      {isAtk && <div style={{ position: "absolute", top: -8, right: -14, width: 4, height: 30, background: "#c0c0d0", borderRadius: 2, transform: "rotate(-30deg)", boxShadow: "0 0 8px rgba(255,255,255,0.5)" }} />}
    </div>
  );
}

// ═══ DATA ═══

const MONSTERS_DATA = [
  { id:1, name:"Slime of Sloth", quest:"English study 30min", exp:15, stat:"LNG", hp:30, type:"slime", desc:"This lazy blob feeds on procrastination. Defeat it with 30 minutes of English practice!" },
  { id:2, name:"Silent Bat", quest:"Japanese vocab ×10", exp:10, stat:"LNG", hp:20, type:"bat", desc:"It lurks in silence — break the quiet by learning 10 new Japanese words." },
  { id:3, name:"Couch Golem", quest:"Exercise / Badminton", exp:20, stat:"CON", hp:40, type:"golem", desc:"Born from hours of sitting. Only physical movement can shatter this beast." },
  { id:4, name:"Shadow of Ignorance", quest:"Read Dan Koe", exp:10, stat:"INT", hp:25, type:"shadow", desc:"Darkness that clouds your vision. Reading today's wisdom will dispel it." },
  { id:5, name:"Procrastination Ghost", quest:"IG copy / Video script", exp:15, stat:"CHA", hp:35, type:"ghost", desc:"It whispers 'do it tomorrow.' Create content NOW to banish it." },
  { id:6, name:"Chaos Skeleton", quest:"Organize Notion Brain", exp:10, stat:"INT", hp:20, type:"skeleton", desc:"Your scattered thoughts given form. Tidy your system to destroy it." },
  { id:7, name:"Perfection Dragon", quest:"Push design project", exp:25, stat:"DEX", hp:50, type:"dragon", desc:"The final boss of every creative. Progress beats perfection — attack!" },
  { id:8, name:"Greed Imp", quest:"Review investments", exp:10, stat:"WIS", hp:25, type:"imp", desc:"It hoards your attention. Check your portfolio and reclaim focus." },
];

const TAVERN_NPC = [
  { name: "The Merchant", icon: "🧔", lines: [
    "Welcome, adventurer. I've traveled far and brought news.",
    "Dan Koe says: 'The one-person business is the future. Leverage = Skill × Technology × Content.'",
    "Your design studio IS your leverage. But are you using AI to multiply it?",
    "Action: Read today's Dan Koe dispatch in your knowledge base.",
  ]},
  { name: "The Librarian", icon: "📚", lines: [
    "Ah, Mo the Brand Alchemist. I have a book for you.",
    "READ THIS: '$100M Offers' by Alex Hormozi.",
    "It teaches how to package your service so clients can't refuse.",
    "Perfect for ON Design Lab's next proposal strategy.",
  ]},
  { name: "The Spy", icon: "🕵️", lines: [
    "I've been watching the world. Here's what I found.",
    "AI agent ecosystems are exploding. MCP servers are everywhere.",
    "Taiwan's interior design market grew 12% this year.",
    "Your skills in both AI AND design are becoming extremely rare. Use that.",
  ]},
  { name: "The Old Warrior", icon: "⚔️", lines: [
    "I've fought a thousand battles. Listen well.",
    "Naval says: 'Don't sell your time to things that won't level you up.'",
    "Every quest you skip today is experience you'll never gain.",
    "Ask yourself: does today's action serve your MAIN QUEST?",
  ]},
  { name: "The Bard", icon: "🎵", lines: [
    "They say a hero's story must be told to inspire others.",
    "Your renovation channel '住研所' — it's your bard song.",
    "Even 30 seconds of content per day compounds into legend.",
    "READ THIS: 'Show Your Work' by Austin Kleon. Start sharing your process.",
  ]},
];

const STATS = { DEX:72, INT:61, WIS:45, CHA:28, CON:55, LNG:33 };
const STAT_NAMES = { DEX:"Design", INT:"Tech", WIS:"Business", CHA:"Influence", CON:"Health", LNG:"Language" };
const MISSIONS = [
  { icon:"💰", name:"Financial Freedom", desc:"Debt → Assets · Build passive income", pct:20 },
  { icon:"✨", name:"Quality of Life", desc:"Health balance · Time autonomy", pct:40 },
  { icon:"📡", name:"Brand Influence", desc:"Personal IP · Content · Products", pct:15 },
];

// ═══ MAIN ═══
export default function MoQuest() {
  const [scene, setScene] = useState("title");
  const [defeated, setDefeated] = useState([]);
  const [monster, setMonster] = useState(null);
  const [mHp, setMHp] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [dlg, setDlg] = useState([]);
  const [dlgIdx, setDlgIdx] = useState(0);
  const [dlgDone, setDlgDone] = useState(true);
  const [npcIdx, setNpcIdx] = useState(null);
  const [npcLine, setNpcLine] = useState(0);
  const [showSlash, setShowSlash] = useState(false);
  const [showDmg, setShowDmg] = useState(null);
  const [flash, setFlash] = useState(false);
  const [shake, setShake] = useState(false);
  const [lvlUp, setLvlUp] = useState(false);
  const [level, setLevel] = useState(12);
  const [exp, setExp] = useState(1840);
  const [heroAct, setHeroAct] = useState("idle");
  const [time, setTime] = useState(new Date());
  const nextExp = level * 150;

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const talk = useCallback((msgs) => {
    const arr = Array.isArray(msgs) ? msgs : [msgs];
    setDlg(arr);
    setDlgIdx(0);
    setDlgDone(false);
  }, []);

  const advDlg = () => {
    if (dlgIdx < dlg.length - 1) { setDlgIdx(i => i+1); setDlgDone(false); }
    else { setDlg([]); setDlgDone(true); }
  };

  const goTo = (s) => {
    setScene(s); setNpcIdx(null); setNpcLine(0);
    const m = {
      castle:["You return to the castle.", `LV.${level} Brand Alchemist`, `Monsters defeated today: ${defeated.length}/${MONSTERS_DATA.length}`],
      field:["You step into the wild.", "Monsters lurk ahead — each one is a daily quest.", "Choose your target and fight!"],
      tavern:["You enter the tavern. The air smells of old wood and secrets.", "Talk to the locals — they carry knowledge and wisdom."],
    };
    talk(m[s] || []);
  };

  // ─── BATTLE ───
  const startBattle = (m) => {
    setMonster(m); setMHp(m.hp); setPhase("idle"); setScene("battle");
    talk([`A wild ${m.name} appeared!`, m.desc, "What will you do?"]);
  };

  const doAtk = (magic = false) => {
    if (phase !== "idle" || !monster) return;
    setPhase("atk");
    setHeroAct("attack");

    setTimeout(() => {
      setFlash(true);
      setShowSlash(true);
      setTimeout(() => { setFlash(false); setShowSlash(false); }, 300);

      const dmg = magic ? Math.floor(Math.random()*12)+18 : Math.floor(Math.random()*12)+10;
      setShowDmg(dmg);
      setTimeout(() => setShowDmg(null), 900);
      setShake(true);
      setTimeout(() => setShake(false), 250);

      setMHp(hp => {
        const next = Math.max(0, hp - dmg);
        const atkName = magic ? "Mo cast Contrarian Thinking!" : "Mo attacks!";
        const dmgMsg = `Dealt ${dmg} damage to ${monster.name}!`;

        if (next <= 0) {
          talk([atkName, dmgMsg, `${monster.name} was defeated!`, `Gained ${monster.exp} EXP!`, `✦ Quest complete: ${monster.quest}`]);
          setDefeated(d => [...d, monster.id]);
          setExp(e => {
            const ne = e + monster.exp;
            if (ne >= nextExp) { setLevel(l=>l+1); setLvlUp(true); setTimeout(()=>setLvlUp(false),3000); }
            return ne;
          });
          setTimeout(() => { setMonster(null); setScene("field"); }, 5500);
        } else {
          talk([atkName, dmgMsg]);
          setTimeout(() => setPhase("idle"), 800);
        }
        return next;
      });
      setHeroAct("idle");
    }, 400);
  };

  const run = () => talk(["You try to run away...", "But there's nowhere to hide from your responsibilities!", "Stand and fight!"]);

  const earned = defeated.reduce((s,id)=>s+(MONSTERS_DATA.find(m=>m.id===id)?.exp||0),0);
  const ts = `${String(time.getHours()).padStart(2,"0")}:${String(time.getMinutes()).padStart(2,"0")}`;
  const curDlg = dlg[dlgIdx] || "";

  return (
    <div style={{ minHeight:"100vh", background:C.black, display:"flex", justifyContent:"center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes monsterFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes monsterHit{0%{opacity:1}20%{opacity:0}40%{opacity:1}60%{opacity:0}80%{opacity:1}100%{opacity:1}}
        @keyframes heroIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
        @keyframes heroWalk{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes heroLunge{0%{transform:translateX(0)}40%{transform:translateX(60px)}100%{transform:translateX(0)}}
        @keyframes slashLine{0%{opacity:0;transform:rotate(-35deg) scaleX(0)}50%{opacity:1;transform:rotate(-35deg) scaleX(1)}100%{opacity:0;transform:rotate(-35deg) scaleX(1.2)}}
        @keyframes dmgPop{0%{opacity:1;transform:translateY(0) scale(1)}30%{transform:translateY(-20px) scale(1.3)}100%{opacity:0;transform:translateY(-50px) scale(0.8)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes lvlGlow{0%,100%{text-shadow:0 0 10px #f8d830}50%{text-shadow:0 0 30px #f8d830, 0 0 60px #f8a020}}
        @keyframes starPulse{0%,100%{opacity:.2}50%{opacity:.9}}
        @keyframes cloudDrift{0%{transform:translateX(-80px)}100%{transform:translateX(440px)}}
        @keyframes titlePulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes candleFlicker{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
        *{box-sizing:border-box;image-rendering:pixelated}
      `}</style>

      <div style={{ width:"100%", maxWidth:420, minHeight:"100vh", background:C.black, position:"relative", overflow:"hidden", transform:shake?"translateX(3px)":"none" }}>

        {/* Flash */}
        {flash && <div style={{ position:"absolute", inset:0, background:"white", zIndex:80, opacity:.85 }} />}

        {/* Level Up */}
        {lvlUp && (
          <div style={{ position:"absolute", inset:0, zIndex:90, background:"rgba(0,0,0,.9)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, animation:"fadeIn .3s" }}>
            <div style={{ ...PX(9), color:C.gold, animation:"lvlGlow 1s infinite" }}>✦ ✦ ✦</div>
            <div style={{ ...PX(20), color:C.gold, animation:"lvlGlow 1s infinite" }}>LEVEL UP!</div>
            <div style={{ ...PX(12), color:C.white, marginTop:8 }}>LV.{level}</div>
            <div style={{ ...PX(8), color:C.cyan, marginTop:12 }}>All stats increased!</div>
            <div style={{ ...PX(8), color:C.green }}>You're getting stronger.</div>
          </div>
        )}

        {/* ══════ TITLE SCREEN ══════ */}
        {scene === "title" && (
          <div style={{ minHeight:"100vh", background:TILES.night, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, position:"relative" }}>
            {Array.from({length:40}).map((_,i) => (
              <div key={i} style={{ position:"absolute", left:`${Math.random()*100}%`, top:`${Math.random()*70}%`, width:Math.random()*2+1, height:Math.random()*2+1, background:C.white, borderRadius:"50%", animation:`starPulse ${Math.random()*3+2}s ease infinite ${Math.random()*2}s` }} />
            ))}
            <div style={{ ...PX(10), color:C.gold, letterSpacing:4 }}>— Mo's Quest —</div>
            <div style={{ ...PX(20), color:C.white, textAlign:"center", textShadow:`0 0 20px ${C.gold}44` }}>BRAND</div>
            <div style={{ ...PX(20), color:C.gold, textAlign:"center", textShadow:`0 0 20px ${C.gold}` }}>ALCHEMIST</div>
            <Hero action="idle" />
            <div style={{ marginTop:20 }}>
              <div onClick={() => goTo("castle")} style={{ ...PX(10), color:C.white, cursor:"pointer", padding:"12px 24px", border:`2px solid ${C.dqBorder}`, borderRadius:8, background:C.dqBlue, animation:"titlePulse 2s infinite", textAlign:"center" }}>
                ▶ START ADVENTURE
              </div>
            </div>
            <div style={{ ...PX(7), color:C.gray, marginTop:16 }}>Press to begin your daily quest</div>
          </div>
        )}

        {/* ══════ CASTLE ══════ */}
        {scene === "castle" && (
          <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", animation:"fadeIn .3s" }}>
            {/* Castle scene */}
            <div style={{ height:170, background:TILES.sky, position:"relative", overflow:"hidden" }}>
              {/* Clouds */}
              {[0,1,2].map(i => <div key={i} style={{ position:"absolute", top:12+i*18, width:45+i*12, height:10+i*3, background:"rgba(255,255,255,.65)", borderRadius:8, animation:`cloudDrift ${9+i*3}s linear infinite`, animationDelay:`${i*2.5}s` }} />)}
              {/* Castle */}
              <div style={{ position:"absolute", bottom:0, left:60, right:60, height:100, background:C.stone1, borderTop:`3px solid ${C.stone2}` }}>
                <div style={{ position:"absolute", top:0, left:-20, width:30, height:120, background:C.stone2 }}>
                  <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50)", width:0, height:0, borderLeft:"14px solid transparent", borderRight:"14px solid transparent", borderBottom:`14px solid ${C.red}` }} />
                </div>
                <div style={{ position:"absolute", top:0, right:-20, width:30, height:120, background:C.stone2 }}>
                  <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"14px solid transparent", borderRight:"14px solid transparent", borderBottom:`14px solid ${C.red}` }} />
                </div>
                {/* Door */}
                <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:30, height:44, background:C.wood1, borderRadius:"15px 15px 0 0", border:`2px solid ${C.wood2}` }} />
              </div>
              {/* Ground */}
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:30, background:C.grass1 }} />
              {/* Hero */}
              <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)" }}><Hero action="idle" /></div>
              <div style={{ position:"absolute", top:8, right:10, ...PX(9), color:C.white, textShadow:"1px 1px 0 #000" }}>{ts}</div>
            </div>

            <div style={{ flex:1, padding:8, display:"flex", flexDirection:"column", gap:8 }}>
              {/* Status */}
              <W>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div>
                    <div style={{ ...PX(11), color:C.white }}>Mo</div>
                    <div style={{ ...PX(7), color:C.gold, marginTop:3 }}>Brand Alchemist</div>
                  </div>
                  <div style={{ ...PX(10), color:C.white }}>LV.{level}</div>
                </div>
                {[
                  { l:"HP", c:85, m:100, cl:C.green },
                  { l:"MP", c:42, m:60, cl:C.cyan },
                  { l:"EXP", c:exp%nextExp, m:nextExp, cl:C.gold },
                ].map(b => (
                  <div key={b.l} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                    <span style={{ ...PX(7), color:C.gold, minWidth:28 }}>{b.l}</span>
                    <div style={{ flex:1, height:8, background:"#000040", border:`1px solid ${C.gray}`, overflow:"hidden", position:"relative" }}>
                      <div style={{ position:"absolute", inset:0, width:`${(b.c/b.m)*100}%`, background:b.cl, transition:"width .5s" }} />
                    </div>
                    <span style={{ ...PX(6), color:C.white, minWidth:52, textAlign:"right" }}>{b.c}/{b.m}</span>
                  </div>
                ))}
              </W>

              {/* Stats */}
              <W>
                <div style={{ ...PX(7), color:C.gold, marginBottom:6 }}>— ATTRIBUTES —</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3 }}>
                  {Object.entries(STATS).map(([k,v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ ...PX(7), color:C.cyan }}>{k}</span>
                      <span style={{ ...PX(7), color:C.white }}>{v}</span>
                    </div>
                  ))}
                </div>
              </W>

              {/* Today */}
              <W>
                <div style={{ ...PX(7), color:C.gold, marginBottom:6 }}>— TODAY'S PROGRESS —</div>
                <div style={{ display:"flex", justifyContent:"space-around" }}>
                  {[
                    { l:"SLAIN", v:defeated.length, c:defeated.length===MONSTERS_DATA.length?C.gold:C.white },
                    { l:"EXP", v:`+${earned}`, c:C.gold },
                    { l:"LEFT", v:MONSTERS_DATA.length-defeated.length, c:MONSTERS_DATA.length-defeated.length===0?C.green:C.red },
                  ].map(x => (
                    <div key={x.l} style={{ textAlign:"center" }}>
                      <div style={{ ...PX(14), color:x.c }}>{x.v}</div>
                      <div style={{ ...PX(6), color:C.gray, marginTop:2 }}>{x.l}</div>
                    </div>
                  ))}
                </div>
              </W>

              {/* Nav */}
              <W>
                <div style={{ ...PX(7), color:C.gold, marginBottom:8 }}>— WHERE TO? —</div>
                {[
                  { label:"▶ The Battlefield (Daily Quests)", t:"field" },
                  { label:"▶ The Tavern (Knowledge & Intel)", t:"tavern" },
                  { label:"▶ Mission Board (Life Goals)", t:"mission" },
                ].map(n => (
                  <div key={n.t} onClick={()=>n.t==="mission"?(setScene("mission"),talk(["Your lifelong missions. Never lose sight of these."])):goTo(n.t)} style={{ ...PX(8), color:C.white, padding:"8px 4px", cursor:"pointer", borderBottom:`1px solid ${C.dqBlueDark}` }}>
                    {n.label}
                  </div>
                ))}
              </W>
            </div>
          </div>
        )}

        {/* ══════ FIELD ══════ */}
        {scene === "field" && !monster && (
          <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", animation:"fadeIn .3s" }}>
            <div style={{ height:140, background:TILES.sky, position:"relative", overflow:"hidden" }}>
              {[0,1].map(i => <div key={i} style={{ position:"absolute", top:10+i*22, width:50, height:10, background:"rgba(255,255,255,.6)", borderRadius:8, animation:`cloudDrift ${8+i*4}s linear infinite`, animationDelay:`${i*3}s` }} />)}
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:50, background:C.grass1 }}>
                {Array.from({length:8}).map((_,i) => <div key={i} style={{ position:"absolute", bottom:0, left:i*55+10, ...PX(16), color:C.grass2 }}>∿</div>)}
              </div>
              <div style={{ position:"absolute", bottom:52, left:40 }}><Hero action="walk" /></div>
            </div>

            <div style={{ flex:1, padding:8 }}>
              <W>
                <div style={{ ...PX(7), color:C.gold, marginBottom:8 }}>— MONSTER LIST —</div>
                {MONSTERS_DATA.map(m => {
                  const dead = defeated.includes(m.id);
                  return (
                    <div key={m.id} onClick={()=>!dead&&startBattle(m)} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 4px", borderBottom:`1px solid ${C.dqBlueDark}`, cursor:dead?"default":"pointer", opacity:dead?.4:1 }}>
                      <Monster type={m.type} size={28} dead={false} />
                      <div style={{ flex:1 }}>
                        <div style={{ ...PX(7), color:dead?C.gray:C.white }}>{dead?"✓ ":""}{m.name}</div>
                        <div style={{ ...PX(6), color:C.gray, marginTop:2 }}>{m.quest}</div>
                      </div>
                      <span style={{ ...PX(7), color:C.gold }}>+{m.exp}</span>
                    </div>
                  );
                })}
              </W>
              <W style={{ marginTop:8 }}>
                <div onClick={()=>goTo("castle")} style={{ ...PX(8), color:C.white, cursor:"pointer", textAlign:"center" }}>▶ Return to Castle</div>
              </W>
            </div>
          </div>
        )}

        {/* ══════ BATTLE ══════ */}
        {scene === "battle" && monster && (
          <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", animation:"fadeIn .2s" }}>
            <div style={{ height:240, background:TILES.night, position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {/* Stars */}
              {Array.from({length:25}).map((_,i) => <div key={i} style={{ position:"absolute", left:`${Math.random()*100}%`, top:`${Math.random()*55}%`, width:Math.random()*2+1, height:Math.random()*2+1, background:C.white, borderRadius:"50%", animation:`starPulse ${Math.random()*3+2}s ease infinite` }} />)}
              {/* Ground */}
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:40, background:"linear-gradient(180deg, #282848, #181830)" }} />
              {/* Monster */}
              <div style={{ position:"relative" }}>
                <Monster type={monster.type} size={90} hit={phase==="atk"} dead={mHp<=0} />
                <SlashEffect active={showSlash} />
                {showDmg && <DmgNum value={showDmg} x="30%" y="10%" />}
              </div>
              {/* Hero */}
              <div style={{ position:"absolute", bottom:44, left:30 }}><Hero action={heroAct} /></div>
            </div>

            {/* Monster HP */}
            <div style={{ padding:"6px 10px", background:C.black }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ ...PX(7), color:C.red, minWidth:20 }}>HP</span>
                <div style={{ flex:1, height:10, background:"#200010", border:`1px solid ${C.gray}`, overflow:"hidden", position:"relative" }}>
                  <div style={{ position:"absolute", inset:0, width:`${(mHp/monster.hp)*100}%`, background:mHp/monster.hp>.3?C.green:C.red, transition:"width .3s" }} />
                </div>
                <span style={{ ...PX(7), color:C.white, minWidth:32, textAlign:"right" }}>{mHp}</span>
              </div>
              <div style={{ ...PX(7), color:C.gray, textAlign:"center", marginTop:4 }}>{monster.name}</div>
            </div>

            {/* Commands */}
            <div style={{ padding:8, flex:1, display:"flex", flexDirection:"column", gap:6 }}>
              <W>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {[
                    { l:"⚔️ ATTACK", fn:()=>doAtk(false) },
                    { l:"✨ MAGIC", fn:()=>doAtk(true) },
                    { l:"🎒 ITEMS", fn:()=>talk(["Your bag is empty.", "Your daily effort is the strongest weapon you have."]) },
                    { l:"🏃 RUN", fn:run },
                  ].map(c => (
                    <div key={c.l} onClick={c.fn} style={{ ...PX(8), color:C.white, padding:"10px 6px", cursor:"pointer", textAlign:"center", background:C.dqBlueDark, border:`1px solid ${C.dqBlueDark}`, borderRadius:4 }}>
                      {c.l}
                    </div>
                  ))}
                </div>
              </W>
              <W>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ ...PX(8), color:C.white }}>Mo LV.{level}</span>
                  <span style={{ ...PX(7), color:C.green }}>HP 85  <span style={{ color:C.cyan }}>MP 42</span></span>
                </div>
              </W>
            </div>
          </div>
        )}

        {/* ══════ TAVERN ══════ */}
        {scene === "tavern" && (
          <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", animation:"fadeIn .3s" }}>
            <div style={{ height:130, background:TILES.tavern, position:"relative", overflow:"hidden" }}>
              {/* Candles */}
              {[50,180,300].map((x,i) => (
                <div key={i} style={{ position:"absolute", top:20, left:x, fontSize:20, animation:`candleFlicker ${2+i*.5}s ease infinite ${i*.7}s` }}>🕯️</div>
              ))}
              {/* Bar */}
              <div style={{ position:"absolute", bottom:0, left:16, right:16, height:28, background:C.wood2, borderTop:`3px solid ${C.wood1}`, borderRadius:"4px 4px 0 0" }} />
              <div style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)", ...PX(8), color:C.gold, textShadow:"1px 1px 0 #000" }}>🍺 THE TAVERN</div>
            </div>

            <div style={{ flex:1, padding:8 }}>
              {npcIdx === null ? (
                <W>
                  <div style={{ ...PX(7), color:C.gold, marginBottom:8 }}>— WHO DO YOU TALK TO? —</div>
                  {TAVERN_NPC.map((npc,i) => (
                    <div key={i} onClick={()=>{setNpcIdx(i);setNpcLine(0);}} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 4px", borderBottom:`1px solid ${C.dqBlueDark}`, cursor:"pointer" }}>
                      <span style={{ fontSize:22 }}>{npc.icon}</span>
                      <span style={{ ...PX(8), color:C.white }}>{npc.name}</span>
                    </div>
                  ))}
                  <div onClick={()=>goTo("castle")} style={{ ...PX(8), color:C.white, cursor:"pointer", textAlign:"center", marginTop:12, padding:8, borderTop:`1px solid ${C.dqBlueDark}` }}>
                    ▶ Leave Tavern
                  </div>
                </W>
              ) : (
                <W>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${C.dqBlueDark}` }}>
                    <span style={{ fontSize:26 }}>{TAVERN_NPC[npcIdx].icon}</span>
                    <span style={{ ...PX(9), color:C.gold }}>{TAVERN_NPC[npcIdx].name}</span>
                  </div>
                  <div style={{ minHeight:80, marginBottom:10 }}>
                    <TypeWriter key={`${npcIdx}-${npcLine}`} text={`"${TAVERN_NPC[npcIdx].lines[npcLine]}"`} speed={25} />
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {npcLine < TAVERN_NPC[npcIdx].lines.length - 1 ? (
                      <div onClick={()=>setNpcLine(n=>n+1)} style={{ ...PX(8), color:C.white, cursor:"pointer", padding:"8px 12px", background:C.dqBlueDark, borderRadius:4, flex:1, textAlign:"center" }}>
                        ▶ Next
                      </div>
                    ) : (
                      <div onClick={()=>{setNpcIdx(null);setNpcLine(0);}} style={{ ...PX(8), color:C.white, cursor:"pointer", padding:"8px 12px", background:C.dqBlueDark, borderRadius:4, flex:1, textAlign:"center" }}>
                        ▶ Back
                      </div>
                    )}
                  </div>
                </W>
              )}
            </div>
          </div>
        )}

        {/* ══════ MISSIONS ══════ */}
        {scene === "mission" && (
          <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", animation:"fadeIn .3s" }}>
            <div style={{ height:80, background:TILES.night, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {Array.from({length:15}).map((_,i) => <div key={i} style={{ position:"absolute", left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, width:2, height:2, background:C.white, borderRadius:"50%", animation:`starPulse ${Math.random()*3+2}s ease infinite` }} />)}
              <div style={{ ...PX(9), color:C.gold, textShadow:`0 0 10px ${C.gold}` }}>✦ MAIN QUESTS ✦</div>
            </div>
            <div style={{ flex:1, padding:8, display:"flex", flexDirection:"column", gap:8 }}>
              <W>
                <div style={{ ...PX(7), color:C.gray, marginBottom:10, textAlign:"center", lineHeight:"16px" }}>
                  "A designer by nature, creating multiple identities."
                </div>
                {MISSIONS.map((m,i) => (
                  <div key={i} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <span style={{ ...PX(8), color:C.white }}>{m.icon} {m.name}</span>
                      <span style={{ ...PX(9), color:C.gold }}>{m.pct}%</span>
                    </div>
                    <div style={{ ...PX(6), color:C.gray, marginBottom:4 }}>{m.desc}</div>
                    <div style={{ height:8, background:"#000040", border:`1px solid ${C.gray}`, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${m.pct}%`, background:C.gold, transition:"width 1s" }} />
                    </div>
                  </div>
                ))}
              </W>

              <W>
                <div style={{ ...PX(7), color:C.gold, marginBottom:8 }}>— THE FLYWHEEL —</div>
                {["Design Revenue (Active Income)", "  ↓", "Content Output (IG + Video)", "  ↓", "Brand Power (Personal IP)", "  ↓", "Productize (Courses / Consulting)", "  ↓", "Passive Income ← ← ← ↑"].map((l,i) => (
                  <div key={i} style={{ ...PX(6), color:l.includes("↓")||l.includes("←")||l.includes("↑")?C.gray:C.white, textAlign:"center", lineHeight:"14px" }}>{l}</div>
                ))}
              </W>

              <W>
                <div onClick={()=>goTo("castle")} style={{ ...PX(8), color:C.white, cursor:"pointer", textAlign:"center" }}>▶ Return to Castle</div>
              </W>
            </div>
          </div>
        )}

        {/* ══════ DIALOG BOX ══════ */}
        {curDlg && scene !== "tavern" && (
          <div onClick={advDlg} style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:420, zIndex:70, padding:"0 8px 8px" }}>
            <W style={{ minHeight:56, cursor:"pointer" }}>
              <TypeWriter key={`${dlgIdx}-${curDlg}`} text={curDlg} speed={25} onDone={()=>setDlgDone(true)} />
              {dlgDone && dlg.length > 0 && <span style={{ position:"absolute", bottom:8, right:14, ...PX(8), color:C.white, animation:"blink .8s infinite" }}>▼</span>}
            </W>
          </div>
        )}
      </div>
    </div>
  );
}
