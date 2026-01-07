import { useState, useEffect, useRef } from 'react';

// --- 更新日誌內容 ---
const UPDATE_LOG = `
2026/1/7 
- 🐛 修復評語不顯示的問題 (變數名稱同步)
- 🔥 S11 精鑄模擬系統正常運作中
`;

// --- S11 精鑄模擬元件 ---
const MasterworkingItem = ({ text }) => {
    const [state, setState] = useState(0); 
    const extractNumber = (str) => {
        const match = str.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : null;
    };
    const baseVal = extractNumber(text);
    if (baseVal === null) return <li className="text-slate-300 py-1 px-2">{text}</li>;

    const calculateS11 = (base, currentState) => {
        let multiplier = 1.0;
        if (currentState === 1) multiplier = 1.25; // Q25
        else if (currentState === 2) multiplier = 1.75; // Capstone
        return Math.floor(base * multiplier);
    };

    const newVal = calculateS11(baseVal, state);
    const newText = text.replace(baseVal.toString(), newVal.toString());

    const styles = [
        { label: "", color: "text-slate-300", bg: "" }, 
        { label: "Q25", color: "text-blue-400 font-bold", bg: "bg-blue-900/30", icon: "💎" }, 
        { label: "Capstone", color: "text-orange-500 font-bold", bg: "bg-orange-900/30", icon: "🔥" } 
    ];
    const currentStyle = styles[state];

    return (
        <li 
            onClick={() => setState((prev) => (prev + 1) % 3)} 
            className={`cursor-pointer select-none transition-all duration-200 px-2 py-1 rounded hover:bg-slate-800 ${currentStyle.bg} flex items-center justify-between group border border-transparent hover:border-slate-600`}
            title="點擊模擬 S11 精鑄"
        >
            <span className={currentStyle.color}>{newText}</span>
            {state > 0 && <span className="text-xs ml-2 font-mono border border-white/10 px-1 rounded bg-black/20">{currentStyle.icon} {currentStyle.label}</span>}
            {state === 0 && <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">S11 模擬 ⚒️</span>}
        </li>
    );
};
// --- 使用教學元件 (折疊式) ---
const HowToUse = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full max-w-5xl mt-8 mb-4">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg p-3 flex justify-between items-center transition-colors group"
            >
                <span className="font-bold text-slate-200 flex items-center gap-2">
                    📖 使用教學 / 評分標準
                </span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-slate-400`}>
                    ▼
                </span>
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-slate-900/50 border border-slate-700 border-t-0 rounded-b-lg p-6 space-y-6 text-sm text-slate-300">
                    
                    {/* 步驟區塊 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-bold text-blue-400 text-lg border-b border-blue-900/50 pb-1">STEP 1. 設定你的完美目標</h3>
                            <ul className="list-disc list-inside space-y-1 text-slate-400">
                                <li>在 <span className="text-blue-300">左側面板</span> 選擇你的職業。</li>
                                <li>設定你該流派 <span className="text-yellow-200">最想要的詞綴</span> 與範圍。</li>
                                <li>記得勾選 <span className="text-orange-400 font-bold">GA</span> (太古傳奇) 如果那是你的目標。</li>
                                <li>填寫回火目標與特效數值。</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-yellow-400 text-lg border-b border-yellow-900/50 pb-1">STEP 2. 輸入掉落裝備</h3>
                            <ul className="list-disc list-inside space-y-1 text-slate-400">
                                <li>在 <span className="text-yellow-300">右側面板</span> 輸入你打到的裝備數值。</li>
                                <li>可以使用 <span className="bg-slate-700 px-1 rounded text-xs text-white">MAX</span> 按鈕快速填入頂值。</li>
                                <li>點擊 <span className="bg-slate-700 px-1 rounded text-xs text-white">下一件 ↺</span> 可保留左側目標，只清空右側輸入。</li>
                            </ul>
                        </div>
                    </div>

                    {/* 精鑄教學 (重點) */}
                    <div className="bg-slate-800/50 p-4 rounded border border-slate-600">
                        <h3 className="font-bold text-purple-400 text-lg mb-2 flex items-center gap-2">
                            ✨ 獨家功能：S11 精鑄模擬 (Masterworking)
                        </h3>
                        <p className="mb-2">
                            當你按下 <span className="text-red-400 font-bold">計算評分</span> 後，結果列表中的詞綴是可以互動的！
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 mt-3">
                            <div className="flex items-center gap-2">
                                <span className="bg-slate-700 px-2 py-1 rounded text-xs">點擊 1 下</span>
                                <span>➝</span>
                                <span className="text-blue-400 font-bold flex items-center gap-1">數值提升 +25% <span className="text-xs border border-white/20 rounded px-1">💎 Q25</span></span>
                                <span className="text-xs text-gray-500">(品質滿級)</span>
                            </div>
                            <div className="hidden md:block text-slate-600">|</div>
                            <div className="flex items-center gap-2">
                                <span className="bg-slate-700 px-2 py-1 rounded text-xs">點擊 2 下</span>
                                <span>➝</span>
                                <span className="text-orange-500 font-bold flex items-center gap-1">數值提升 +75% <span className="text-xs border border-white/20 rounded px-1">🔥 Capstone</span></span>
                                <span className="text-xs text-gray-500">(晉階大獎)</span>
                            </div>
                        </div>
                    </div>

                    {/* 評分標準 */}
                    <div>
                        <h3 className="font-bold text-gray-400 text-md mb-2">🏆 評分等級說明</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs font-bold">
                            <div className="p-2 rounded bg-gray-800 text-gray-500 border border-gray-700">
                                <div className="text-lg">🗑️ 60分以下</div>
                                <div>垃圾 (Trash)</div>
                            </div>
                            <div className="p-2 rounded bg-blue-900/30 text-blue-400 border border-blue-900">
                                <div className="text-lg">✨ 60~79分</div>
                                <div>準畢業 (Good)</div>
                            </div>
                            <div className="p-2 rounded bg-yellow-900/30 text-yellow-400 border border-yellow-900">
                                <div className="text-lg">🔥 80~99分</div>
                                <div>畢業等級 (Great)</div>
                            </div>
                            <div className="p-2 rounded bg-orange-900/30 text-orange-500 border border-orange-900 shadow-[0_0_10px_rgba(255,165,0,0.2)]">
                                <div className="text-lg">👑 100分</div>
                                <div>完美畢業 (God Roll)</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
// --- 資料庫 ---
const CLASS_DB = {
    "Necromancer": { label: "死靈法師", icon: "💀", base: ["智力", "精魂消耗減免 (%)", "精魂上限", "召喚物傷害 (%)", "召喚精通等級", "地獄指揮官等級", "骷髏法師精通等級", "核心技能等級", "詛咒技能等級", "屍體技能等級", "持續暗影傷害 (%)", "被動: 增幅傷害等級", "被動: 死潮等級"], temper: ["【武器】骨矛兩次發射 (%)", "【武器】召喚傷害 (%)", "【武器】褻瀆範圍 (%)", "【攻擊】暴擊傷害 (%)", "【攻擊】終局被動等級", "【攻擊】屍爆範圍 (%)", "【防禦】總護甲 (%)", "【防禦】最大生命 (%)", "【輔助】移動速度 (%)", "【輔助】控場持續時間 (%)", "【資源】精魂生成 (%)"] },
    "Barbarian": { label: "野蠻人", icon: "🪓", base: ["力量", "怒氣消耗減免 (%)", "怒氣上限", "核心技能等級", "武器專精等級", "防禦技能等級", "搏鬥技能等級", "強韌時傷害減免 (%)", "近距離傷害減免 (%)"], temper: ["【武器】塵魔範圍 (%)", "【武器】猛擊順劈 (%)", "【武器】先祖之鎚範圍 (%)", "【攻擊】對近距離傷害 (%)", "【攻擊】流血傷害 (%)", "【防禦】強韌生成 (%)", "【輔助】戰吼冷卻縮短"] },
    "Sorcerer": { 
        label: "秘術師", icon: "🔮", 
        base: ["智力", "最大生命", "護甲值", "冷卻時間縮短 (%)", "移動速度 (%)", "每秒法力回復", "資源消耗減少(%)", "暴擊機率 (%)", "暴擊傷害 (%)", "攻擊速度 (%)", "易傷傷害 (%)", "傷害 (%)", "持續傷害 (%)", "壓制傷害 (%)", "幸運觸發機率 (%)", "吞噬之火等級", "白霜等級", "玻璃大砲等級", "元素主宰等級", "極寒冰霜等級", "冰霜之觸等級", "怒火中燒等級", "無盡火葬等級", "電衝震擊等級", "原初束縛等級", "咒喚精通等級", "核心技能等級", "火球等級", "冰封球等級", "寒冰裂片等級", "連鎖閃電等級", "電能彈等級", "熾焚烈焰等級", "關鍵被動等級", "球狀閃電等級", "暴風雪等級", "火牆術等級", "隕石術等級", "防禦技能等級", "火焰護盾等級", "冰霜新星等級", "寒冰護甲等級", "傳送術等級", "多頭蛇等級", "寒冰之刃等級", "閃電長矛等級", "魔寵等級", "基礎技能等級", "電光彈等級", "火焰彈等級", "冰霜彈等級", "電弧鞭擊等級", "屏障產生(%)", "閃避機率(%)", "最大資源", "擊殺回魔", "擊殺生命回復", "擊中生命回復", "每5秒回復生命", "受到治療效果(%)", "藥水容量", "荊棘", "全元素抗性", "火焰抗性", "閃電抗性", "寒冰抗性", "毒素抗性", "暗影抗性", "物理抗性"],
        temper: ["【武器】冰封球投射物有 +% 機率施放兩次", "【武器】寒冰裂片投射物有 +% 機率施放兩次", "【武器】寒冰彈投射物有 +% 機率施放兩次", "【武器】暴風雪投射物有 +% 機率施放兩次", "【武器】冰刺投射物有 +% 機率施放兩次", "【武器】極度冰凍投射物有 +% 機率施放兩次", "【武器】火球投射物有 +% 機率施放兩次", "【武器】火焰彈投射物有 +% 機率施放兩次", "【武器】隕石術有 +% 機率造成雙倍傷害", "【武器】焚燒有 +% 機率造成雙倍傷害", "【武器】火牆有 +% 機率造成雙倍傷害", "【武器】隕石有 +% 機率造成雙倍傷害", "【武器】煉獄之火有 +% 機率造成雙倍傷害", "【武器】電花投射物有 +% 機率施放兩次", "【武器】電荷彈投射物有 +% 機率施放兩次", "【武器】球狀閃電投射物有 +% 機率施放兩次", "【武器】連鎖閃電有 +% 機率擊中兩次", "【武器】傳送術有 +% 機率擊中兩次", "【武器】電弧鞭笞有 +% 機率揮擊兩次", "【武器】閃電長矛有 +% 機率造成雙倍傷害", "【武器】爆裂電能有 +% 機率造成雙倍傷害", "【武器】魔寵有 +% 機率擊中兩次", "【武器】施放的多頭蛇擁有 + 顆頭", "【攻擊】傷害 (%)", "【攻擊】爆擊傷害 (%)", "【攻擊】易傷傷害 (%)", "【攻擊】壓制傷害 (%)", "【攻擊】焚燒爆擊傷害 (%)", "【攻擊】電擊爆擊傷害 (%)", "【攻擊】焚燒攻擊速度 (%)", "【攻擊】冰霜爆擊機率 (%)", "【攻擊】電擊爆擊機率 (%)", "【攻擊】對凍結敵人的傷害 (%)", "【攻擊】對受控場敵人的傷害 (%)", "【攻擊】對近距敵人的傷害 (%)", "【攻擊】對遠距敵人的傷害 (%)", "【攻擊】絕招傷害 (%)", "【攻擊】精通技能傷害 (%)", "【攻擊】核心技能傷害 (%)", "【攻擊】基本技能傷害 (%)", "【攻擊】火焰傷害 (%)", "【攻擊】寒冰傷害 (%)", "【攻擊】閃電傷害 (%)", "【攻擊】暗影傷害 (%)", "【攻擊】毒素傷害 (%)", "【攻擊】物理傷害 (%)", "【攻擊】爆裂電能傷害 (%)", "【攻擊】多頭蛇傷害 (%)", "【攻擊】寒冰刃傷害 (%)", "【攻擊】閃電長矛傷害 (%)", "【攻擊】魔寵傷害 (%)", "【資源】資源產生 (%)", "【資源】資源消耗降低 (%)", "【資源】施放絕招恢復主要資源", "【資源】幸運觸發：最高有 15% 機率恢復主要資源", "【輔助】冰霜新星範圍 (%)", "【輔助】暴風雪範圍 (%)", "【輔助】傳送術新星範圍 (%)", "【輔助】隕石術範圍 (%)", "【輔助】火牆範圍 (%)", "【輔助】焚燒範圍 (%)", "【輔助】冰霜新星冷卻時間縮短 (%)", "【輔助】寒冰刃冷卻時間縮短 (%)", "【輔助】閃電長矛冷卻時間縮短 (%)", "【輔助】傳送術冷卻時間縮短 (%)", "【輔助】極度冰凍冷卻時間縮短 (%)", "【輔助】煉獄之火冷卻時間縮短 (%)", "【輔助】不穩電流冷卻時間縮短 (%)", "【輔助】移動技能冷卻時間縮短 (%)", "【輔助】閃避冷卻時間縮短 (%)", "【輔助】凍結持續時間 (%)", "【輔助】昏迷持續時間 (%)", "【輔助】定身持續時間 (%)", "【輔助】控場持續時間 (%)", "【輔助】移動速度 (%)", "【輔助】擊殺精英怪後移動速度，持續4秒 (%)", "【輔助】幸運觸發機率 (%)", "【輔助】多頭蛇幸運觸發機率 (%)", "【輔助】寒冰刃幸運觸發機率 (%)", "【輔助】閃電長矛幸運觸發機率 (%)", "【輔助】魔寵幸運觸發機率 (%)", "【輔助】充能導體等級", "【輔助】寒凜之風等級", "【輔助】烈焰湧動等級", "【輔助】靜電洩流等級", "【輔助】驚電衝擊等級", "【輔助】急速凍結等級", "【輔助】致殘烈焰等級", "【輔助】溫暖等級", "【輔助】冷鋒等級", "【防禦】生命值上限", "【防禦】護甲值", "【防禦】屏障產生(%)", "【防禦】強韌產生(%)", "【防禦】擊中生命回復", "【防禦】閃躲機率(%)", "【防禦】控場受限時間縮短(%)", "【防禦】火焰護盾持續時間(%)", "【防禦】寒冰護甲持續時間(%)", "【防禦】魔寵持續時間(%)", "【防禦】冰冷與緩速效力(%)", "【防禦】火焰抗性", "【防禦】寒冰抗性", "【防禦】閃電抗性", "【防禦】毒素抗性", "【防禦】暗影抗性", "【防禦】物理抗性", "【防禦】荊棘", "【攻擊】幸運觸發：最高有 40% 機率造成 + 火焰傷害", "【攻擊】幸運觸發：最高有 40% 機率造成 + 寒冰傷害", "【攻擊】幸運觸發：最高有 40% 機率造成 + 閃電傷害", "【攻擊】幸運觸發：最高有 40% 機率造成 + 暗影傷害", "【攻擊】幸運觸發：最高有 40% 機率造成 + 毒素傷害", "【攻擊】幸運觸發：最高有 40% 機率造成 + 物理傷害"]
    },
    "Paladin": { 
        label: "聖騎士", icon: "🛡️", 
        base: ["力量", "最大生命", "護甲值", "冷卻時間縮短(%)", "移動速度(%)", "每秒信念恢復", "資源消耗減少(%)", "資源上限", "藥水容量", "暴擊機率(%)", "暴擊傷害(%)", "攻擊速度(%)", "易傷傷害(%)", "壓制傷害(%)", "傷害(%)", "持續傷害(%)", "幸運觸發機率(%)", "重擊者等級", "磨礪等級", "正直等級", "破裂之甲等級", "定罪等級", "堅韌等級", "至上進攻等級", "反擊等級", "戒律等級", "暈眩打擊等級", "核心技能等級", "祝福之鎚等級", "祝福之盾等級", "盾牌猛擊等級", "神聖長槍等級", "熱誠等級", "靈氣技能等級", "狂信靈氣等級", "神聖之光靈氣等級", "反抗靈氣等級", "勇氣技能等級", "宙斯之盾等級", "盾牌衝鋒等級", "天降隕星等級", "奮戰號召等級", "正義技能等級", "奉獻等級", "淨化等級", "天譴等級", "天堂之矛等級", "基礎技能等級", "聖光彈等級", "衝突等級", "挺進等級", "波刃等級", "受到的治療(%)", "擊中生命回復", "擊殺生命回復", "每5秒回復生命", "擊殺恢復信念", "強韌產生量(%)", "荊棘", "閃避機率(%)", "全元素抗性", "火焰抗性", "閃電抗性", "毒素抗性", "暗影抗性", "寒冰抗性", "物理抗性"],
        temper: ["【武器】波刃造成雙倍傷害的機率 (%)", "【武器】神聖長槍造成雙倍傷害的機率 (%)", "【武器】天降隕星造成雙倍傷害的機率 (%)", "【武器】仲裁者造成雙倍傷害的機率 (%)", "【武器】聖光彈造成雙倍傷害的機率 (%)", "【武器】祝福之鎚造成雙倍傷害的機率 (%)", "【武器】祝福之盾造成雙倍傷害的機率 (%)", "【武器】天堂之怒造成雙倍傷害的機率 (%)", "【武器】審判造成雙倍傷害的機率 (%)", "【武器】衝突造成雙倍傷害的機率 (%)", "【武器】盾牌猛擊造成雙倍傷害的機率 (%)", "【武器】盾牌衝鋒造成雙倍傷害的機率 (%)", "【武器】報復造成雙倍傷害的機率 (%)", "【武器】挺進造成雙倍傷害的機率 (%)", "【武器】熱誠造成雙倍傷害的機率 (%)", "【武器】天巔造成雙倍傷害的機率 (%)", "【攻擊】傷害 (%)", "【攻擊】物理傷害 (%)", "【攻擊】火焰傷害 (%)", "【攻擊】閃電傷害 (%)", "【攻擊】寒冰傷害 (%)", "【攻擊】毒素傷害 (%)", "【攻擊】暗影傷害 (%)", "【攻擊】神聖傷害 (%)", "【攻擊】基礎技能傷害 (%)", "【攻擊】核心技能傷害 (%)", "【攻擊】絕招傷害 (%)", "【攻擊】門徒技能傷害 (%)", "【攻擊】主宰技能傷害 (%)", "【攻擊】羽擊技能傷害 (%)", "【攻擊】審判官技能傷害 (%)", "【攻擊】正義技能傷害 (%)", "【攻擊】處於仲裁者型態時的傷害 (%)", "【攻擊】對受審判敵人的傷害 (%)", "【攻擊】對受控場敵人的傷害 (%)", "【攻擊】對近距敵人的傷害 (%)", "【攻擊】對遠距敵人的傷害 (%)", "【攻擊】對虛弱敵人的傷害 (%)", "【攻擊】爆擊傷害 (%)", "【攻擊】易傷傷害 (%)", "【攻擊】壓制傷害 (%)", "【攻擊】狂熱者技能爆擊機率 (%)", "【攻擊】狂熱者技能爆擊傷害 (%)", "【攻擊】狂熱者技能傷害 (%)", "【攻擊】幸運一擊：最多 40% 機率造成額外物理傷害", "【攻擊】幸運一擊：最多 40% 機率造成額外火焰傷害", "【攻擊】幸運一擊：最多 40% 機率造成額外閃電傷害", "【攻擊】幸運觸發：最高有 40% 機率造成額外寒冰傷害", "【攻擊】幸運觸發：最高有 40% 機率造成額外毒素傷害", "【攻擊】幸運觸發：最高有 40% 機率造成額外暗影傷害", "【資源】資源產生量 (%)", "【資源】資源消耗減免 (%)", "【資源】波刃資源產生量 (%)", "【資源】聖光彈資源產生量 (%)", "【資源】衝突資源產生量 (%)", "【資源】挺進資源產生量 (%)", "【資源】施放絕招時可恢復主要資源", "【資源】施放正義技能時可恢復主要資源", "【資源】施放勇氣技能時可恢復主要資源", "【資源】幸運一擊：最高有 15% 機率恢復主要資源", "【資源】決心產生量", "【輔助】天譴範圍 (%)", "【輔助】神聖長槍範圍 (%)", "【輔助】天堂之矛範圍 (%)", "【輔助】盾牌猛擊範圍 (%)", "【輔助】報復範圍 (%)", "【輔助】熱誠範圍 (%)", "【輔助】天譴冷卻時間縮減 (%)", "【輔助】淨化冷卻時間縮減 (%)", "【輔助】奉獻冷卻時間縮減 (%)", "【輔助】宙斯之盾冷卻時間縮減 (%)", "【輔助】靈氣冷卻時間縮減 (%)", "【輔助】天降隕星冷卻時間縮減 (%)", "【輔助】盾牌衝鋒冷卻時間縮減 (%)", "【輔助】正義技能冷卻時間縮減 (%)", "【輔助】正義仲裁者冷卻時間縮減 (%)", "【輔助】天堂之怒冷卻時間縮減 (%)", "【輔助】勇氣冷卻時間縮減 (%)", "【輔助】要塞冷卻時間縮減 (%)", "【輔助】天巔冷卻時間縮減 (%)", "【輔助】移動技能冷卻時間縮減 (%)", "【輔助】閃避冷卻時間縮減 (%)", "【輔助】仲裁者持續時間 (%)", "【輔助】奉獻持續時間 (%)", "【輔助】奮戰號召持續時間 (%)", "【輔助】宙斯之盾持續時間 (%)", "【輔助】天巔持續時間 (%)", "【輔助】控場效果持續時間 (%)", "【輔助】反抗靈氣效力 (%)", "【輔助】狂信靈氣效力 (%)", "【輔助】神聖之光靈氣效力 (%)", "【輔助】移動速度 (%)", "【輔助】殺死精英怪後 4 秒內移動速度 (%)", "【輔助】幸運觸發機率 (%)", "【輔助】決心疊層上限", "【輔助】警戒等級", "【輔助】長壽等級", "【輔助】堅定等級", "【防禦】生命值上限", "【防禦】護甲值", "【防禦】處於仲裁者型態時的護甲值 (%)", "【防禦】格檔機率 (%)", "【防禦】荊棘", "【防禦】強韌產生量 (%)", "【防禦】屏障產生量 (%)", "【防禦】擊中生命回復", "【防禦】受控場效果縮減", "【防禦】火焰抗性", "【防禦】閃電抗性", "【防禦】寒冰抗性", "【防禦】毒素抗性", "【防禦】暗影抗性", "【防禦】物理抗性"]
    },
    "Rogue": { label: "俠盜", icon: "🗡️", base: ["敏捷"], temper: ["【武器】穿透射擊兩次"] },
    "Druid": { label: "德魯伊", icon: "🐻", base: ["意志"], temper: ["【武器】龍捲風兩次"] }
};

const DEFAULT_TARGET = { itemPowerCap: 800, baseAffixes: [{name:"",isGA:false,min:"",max:""},{name:"",isGA:false,min:"",max:""},{name:"",isGA:false,min:"",max:""}], temperAffixes: [{name:"",min:"",max:""},{name:"",min:"",max:""}], aspect: { name: "", min: "", max: "" } };

// --- 元件: 智慧搜尋 ---
const SearchableSelect = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const wrapperRef = useRef(null);
    useEffect(() => { setSearchTerm(value); }, [value]);
    useEffect(() => {
        const handleClickOutside = (event) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleSelect = (opt) => { setSearchTerm(opt); onChange(opt); setIsOpen(false); };
    return (
        <div className="relative w-full" ref={wrapperRef}>
            <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:border-blue-500 outline-none p-2 placeholder-slate-500"
                placeholder={placeholder} value={searchTerm} onClick={() => setIsOpen(true)}
                onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); if(e.target.value === "") onChange(""); }} />
            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute top-100 left-0 right-0 max-h-48 overflow-y-auto bg-slate-800 border border-slate-600 rounded z-50 shadow-xl">
                    {filteredOptions.map((opt, idx) => (<div key={idx} className="p-2 hover:bg-slate-700 cursor-pointer text-sm text-slate-300" onClick={() => handleSelect(opt)}>{opt}</div>))}
                </div>
            )}
        </div>
    );
};

function App() {
    const [selectedClass, setSelectedClass] = useState(() => localStorage.getItem("d4_selected_class") || "Necromancer");
    const [baseList, setBaseList] = useState([]);
    const [temperList, setTemperList] = useState([]);
    const [target, setTarget] = useState(() => { const saved = localStorage.getItem("d4_target_v8"); return saved ? JSON.parse(saved) : DEFAULT_TARGET; });
    const [drop, setDrop] = useState({ itemPower: 800, baseAffixes: [{name:"",isGA:false,value:""},{name:"",isGA:false,value:""},{name:"",isGA:false,value:""}], temperAffixes: [{name:"",value:""},{name:"",value:""}], aspect: { name: "", value: "" } });
    
    // 🔥 重要修正：這裡改用 matched_affixes 來接資料 🔥
    const [result, setResult] = useState({ score: 0, tierLabel: "等待計算...", tierColor: "text-gray-500", barColor: "bg-gray-700", matched_affixes: [], isBrick: false });
    
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [loading, setLoading] = useState(false);
    const firstRender = useRef(true);

    useEffect(() => {
        if (!selectedClass) return;
        const cls = CLASS_DB[selectedClass];
        setBaseList([...cls.base]); 
        setTemperList([...cls.temper]);
        localStorage.setItem("d4_selected_class", selectedClass);
    }, [selectedClass]);

    useEffect(() => {
        if (firstRender.current) { firstRender.current = false; return; }
        localStorage.setItem("d4_target_v8", JSON.stringify(target));
        setShowSaveToast(true);
        const t = setTimeout(() => setShowSaveToast(false), 2000);
        return () => clearTimeout(t);
    }, [target]);

    const calculateScore = async () => {
        setLoading(true);
        setResult(prev => ({ ...prev, tierLabel: "計算中..." }));
        try {
            const API_BASE = import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://d4-gear-grader.onrender.com";
            const clean = (item) => ({
                ...item,
                min: item.min === "" ? null : Number(item.min),
                max: item.max === "" ? null : Number(item.max),
                value: item.value === "" ? null : Number(item.value),
            });

            const payload = {
                target_base: target.baseAffixes.map(clean),
                target_temper: target.temperAffixes.map(clean),
                target_aspect: clean(target.aspect),
                drop_base: drop.baseAffixes.map(clean),
                drop_temper: drop.temperAffixes.map(clean),
                drop_aspect: clean(drop.aspect),
                drop_item_power: Number(drop.itemPower)
            };

            const res = await fetch(`${API_BASE}/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // 後端回傳的欄位是 matched_affixes，現在前端也是 matched_affixes，終於對上了！
                setResult(await res.json());
            } else {
                console.error("Server Error:", res.status);
                setResult(prev => ({ ...prev, tierLabel: `格式錯誤 (${res.status})` }));
            }
        } catch (err) {
            console.error(err);
            // 🔥 重要修正：這裡的錯誤訊息也同步改名 🔥
            setResult(prev => ({ ...prev, tierLabel: "後端離線", matched_affixes: ["請確認 python main.py 是否執行中 (或稍等1分鐘讓雲端喚醒)"] }));
        }
        setLoading(false);
    };

    const handleTargetChange = (section, idx, field, val) => { if(section === 'aspect') setTarget({...target, aspect: {...target.aspect, [field]: val}}); else { const list = [...target[section]]; list[idx] = { ...list[idx], [field]: val }; setTarget({ ...target, [section]: list }); } };
    const handleDropChange = (section, idx, field, val) => { if(section === 'aspect') setDrop({...drop, aspect: {...drop.aspect, [field]: val}}); else { const list = [...drop[section]]; list[idx] = { ...list[idx], [field]: val }; setDrop({ ...drop, [section]: list }); } };
    const fillMax = (section, idx) => { let dropName = drop[section][idx].name; if (!dropName) return; const targetItem = target[section].find(t => t.name === dropName); if (targetItem && targetItem.max) handleDropChange(section, idx, 'value', targetItem.max); };
    const fillMaxAspect = () => { if (target.aspect.max) handleDropChange('aspect', null, 'value', target.aspect.max); };
    const resetDrop = () => { 
        setDrop({ itemPower: 800, baseAffixes: [{name:"",isGA:false,value:""},{name:"",isGA:false,value:""},{name:"",isGA:false,value:""}], temperAffixes: [{name:"",value:""},{name:"",value:""}], aspect: { name: "", value: "" } });
        // 🔥 重要修正：重置時也要清空 matched_affixes 🔥
        setResult({ score: 0, tierLabel: "等待計算...", tierColor: "text-gray-500", barColor: "bg-gray-700", matched_affixes: [], isBrick: false });
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto relative pb-20">
            {showSaveToast && <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">💾 已自動存檔</div>}
            <header className="mb-8 w-full text-center mt-6">
                <h1 className="text-3xl font-bold text-red-500 tracking-wider uppercase border-b-2 border-red-900 pb-2">D4 Gear Grader <span className="text-sm text-gray-400 block mt-1 normal-case"></span></h1>
            </header>
            <div className="w-full mb-6 flex flex-wrap justify-center gap-3">
                {Object.keys(CLASS_DB).map(clsKey => (<button key={clsKey} onClick={() => setSelectedClass(clsKey)} className={`px-5 py-2 rounded-lg flex items-center gap-2 font-bold class-btn ${selectedClass === clsKey ? 'active' : 'inactive'}`}><span>{CLASS_DB[clsKey].icon}</span> {CLASS_DB[clsKey].label}</button>))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                <div className="bg-slate-900 p-6 rounded-xl diablo-border border-l-4 border-blue-600">
                    <h2 className="text-xl font-bold text-blue-400 mb-4 section-header">1. 設定目標</h2>
                    <div className="mb-6 space-y-2"><h3 className="text-sm text-slate-400 font-bold">天生詞綴</h3>{[0,1,2].map(i => (<div key={i} className="grid grid-cols-12 gap-2 items-center"><div className="col-span-5 relative"><SearchableSelect options={baseList} placeholder="搜尋詞綴..." value={target.baseAffixes[i].name} onChange={v=>handleTargetChange('baseAffixes',i,'name',v)} /></div><div className="col-span-1 flex justify-center"><input type="checkbox" className="accent-orange-500 w-4 h-4" checked={target.baseAffixes[i].isGA} onChange={e=>handleTargetChange('baseAffixes',i,'isGA',e.target.checked)}/></div><div className="col-span-3"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="Min" value={target.baseAffixes[i].min} onChange={e=>handleTargetChange('baseAffixes',i,'min',e.target.value)}/></div><div className="col-span-3"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="Max" value={target.baseAffixes[i].max} onChange={e=>handleTargetChange('baseAffixes',i,'max',e.target.value)}/></div></div>))}</div>
                    <div className="mb-6 space-y-2"><h3 className="text-sm text-slate-400 font-bold text-yellow-500">⚒️ 回火目標</h3>{[0,1].map(i => (<div key={i} className="grid grid-cols-12 gap-2 items-center"><div className="col-span-6 relative"><SearchableSelect options={temperList} placeholder="搜尋回火..." value={target.temperAffixes[i].name} onChange={v=>handleTargetChange('temperAffixes',i,'name',v)} /></div><div className="col-span-3"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="Min" value={target.temperAffixes[i].min} onChange={e=>handleTargetChange('temperAffixes',i,'min',e.target.value)}/></div><div className="col-span-3"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="Max" value={target.temperAffixes[i].max} onChange={e=>handleTargetChange('temperAffixes',i,'max',e.target.value)}/></div></div>))}</div>
                    <div className="space-y-2 border-t border-slate-700 pt-4"><h3 className="text-sm text-orange-400 font-bold">🔥 特效</h3><div className="grid grid-cols-12 gap-2 items-center"><div className="col-span-6"><input type="text" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-orange-200 placeholder-slate-500" placeholder="特效名稱" value={target.aspect.name} onChange={e=>handleTargetChange('aspect',null,'name',e.target.value)}/></div><div className="col-span-3"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="Min" value={target.aspect.min} onChange={e=>handleTargetChange('aspect',null,'min',e.target.value)}/></div><div className="col-span-3"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="Max" value={target.aspect.max} onChange={e=>handleTargetChange('aspect',null,'max',e.target.value)}/></div></div></div>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl diablo-border border-l-4 border-yellow-600 relative">
                    <div className="flex justify-between items-center mb-4 section-header"><h2 className="text-xl font-bold text-yellow-400">2. 輸入掉落</h2><div className="flex gap-2"><button onClick={()=>setDrop({...drop,itemPower:drop.itemPower===800?750:800})} className={`px-3 py-1 rounded text-sm font-bold ${drop.itemPower===800?'bg-orange-600 text-white':'bg-blue-600 text-white'}`}>{drop.itemPower}</button><button onClick={resetDrop} className="px-3 py-1 rounded text-sm bg-slate-700 text-white hover:bg-slate-600 border border-slate-500">下一件 ↺</button></div></div>
                    <div className="mb-6 space-y-2"><h3 className="text-sm text-slate-400 font-bold">鑑定天生詞綴</h3>{[0,1,2].map(i => (<div key={i} className="grid grid-cols-12 gap-2 items-center"><div className="col-span-5 relative"><SearchableSelect options={baseList} placeholder="鑑定詞綴..." value={drop.baseAffixes[i].name} onChange={v=>handleDropChange('baseAffixes',i,'name',v)} /></div><div className="col-span-1 flex justify-center"><input type="checkbox" className="accent-orange-500 w-5 h-5" checked={drop.baseAffixes[i].isGA} onChange={e=>handleDropChange('baseAffixes',i,'isGA',e.target.checked)}/></div><div className="col-span-6 flex gap-1"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-yellow-400 font-bold" placeholder="Val" value={drop.baseAffixes[i].value} onChange={e=>handleDropChange('baseAffixes',i,'value',e.target.value)}/><button onClick={()=>fillMax('baseAffixes', i)} className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-2 rounded">MAX</button></div></div>))}</div>
                    <div className="mb-6 space-y-2"><h3 className="text-sm text-slate-400 font-bold text-yellow-500">⚒️ 鑑定回火</h3>{[0,1].map(i => (<div key={i} className="grid grid-cols-12 gap-2 items-center"><div className="col-span-6 relative"><SearchableSelect options={temperList} placeholder="(未回火)" value={drop.temperAffixes[i].name} onChange={v=>handleDropChange('temperAffixes',i,'name',v)} /></div><div className="col-span-6 flex gap-1"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-yellow-400 font-bold" placeholder="Val" value={drop.temperAffixes[i].value} onChange={e=>handleDropChange('temperAffixes',i,'value',e.target.value)}/><button onClick={()=>fillMax('temperAffixes', i)} className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-2 rounded">MAX</button></div></div>))}</div>
                    <div className="space-y-2 border-t border-slate-700 pt-4"><h3 className="text-sm text-orange-400 font-bold">🔥 鑑定特效</h3><div className="grid grid-cols-12 gap-2 items-center"><div className="col-span-6"><span className="text-sm text-gray-500 italic block p-2">對應左側特效數值</span></div><div className="col-span-6 flex gap-1"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-orange-400 font-bold" placeholder="Val" value={drop.aspect.value} onChange={e=>handleDropChange('aspect',null,'value',e.target.value)}/><button onClick={fillMaxAspect} className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-2 rounded">MAX</button></div></div></div>
                
                    {/* 按鈕區域 */}
                    <div className="mt-6">
                        <button 
                            onClick={calculateScore} 
                            disabled={loading}
                            className={`w-full py-3 rounded-lg font-bold text-xl shadow-lg border-2 transition-all transform hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2 ${loading ? 'bg-slate-700 border-slate-600 cursor-not-allowed text-gray-400' : 'bg-red-700 hover:bg-red-600 border-red-900 text-white'}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    計算中...
                                </>
                            ) : (
                                "⚔️ 開始評分 (CALCULATE)"
                            )}
                        </button>
                    </div>

                </div>
            </div>
            <div className="mt-8 w-full max-w-5xl bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl">
                <div className="w-full h-8 bg-slate-900 rounded-full overflow-hidden border border-slate-600 relative mb-4"><div className={`h-full transition-all duration-700 flex items-center justify-end pr-3 ${result.barColor}`} style={{ width: `${result.score}%` }}><span className="text-sm font-bold text-white drop-shadow-md">{result.score}%</span></div></div>
                <div className="flex flex-col md:flex-row gap-6"><div className="w-full md:w-1/3"><h3 className={`text-3xl font-extrabold ${result.tierColor} mb-2`}>{result.tierLabel}</h3>{result.isBrick && <div className="text-red-300 font-bold bg-red-950/50 p-2 rounded text-center animate-pulse">⚠️ 已變磚</div>}</div>
                
                <div className="w-full md:w-2/3 bg-slate-900/50 p-4 rounded border border-slate-700/50">
                    <div className="text-xs text-slate-500 mb-2 text-center">💡 小撇步：點擊下方的詞綴，可以模擬 S11 精鑄 (Q25/晉階) 喔！</div>
                    
                    {/* 🔥 這裡就是關鍵修正：改用 matched_affixes，並加上問號保護 🔥 */}
                    <ul className="space-y-1 text-sm text-slate-300 max-h-60 overflow-y-auto pr-2">
                        {result.matched_affixes?.map((log, idx) => (
                            <MasterworkingItem key={idx} text={log} />
                        ))}
                    </ul>
                </div>
                
                </div>
            </div>
            <HowToUse />
            <div className="mt-8 w-full max-w-5xl">
                <h3 className="text-slate-400 text-sm font-bold mb-2 ml-1">📜 更新日誌</h3>
                <textarea 
                    readOnly 
                    value={UPDATE_LOG} 
                    className="w-full h-48 bg-slate-900/80 border border-slate-700 rounded-lg p-4 text-slate-400 text-sm font-mono focus:outline-none resize-none diablo-border shadow-inner"
                    style={{ whiteSpace: 'pre-wrap' }}
                />
            </div>
        </div>
    );
}

export default App;