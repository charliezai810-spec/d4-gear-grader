import { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CameraIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

// 👇 1. 引入剛剛做好的 ChatBot
import ChatBot from './ChatBot';

// --- 更新日誌內容 ---
const UPDATE_LOG = `
2026/1/18
- 🤖 新增：AI 聊天助手 (聖休亞瑞智庫)
- 📸 新增：手機/平板直接拍照辨識按鈕
2026/1/10 
- ✨ 優化：特效 (威能) 現在支援搜尋選單了！
2026/1/7
- 📖 新增使用教學指南
`;

// --- 使用教學元件 (折疊式) ---
const HowToUse = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="w-full max-w-5xl mt-8 mb-4">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg p-3 flex justify-between items-center transition-colors group"
            >
                <span className="font-bold text-slate-200 flex items-center gap-2">📖 使用教學 / 評分標準</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-slate-400`}>▼</span>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-slate-900/50 border border-slate-700 border-t-0 rounded-b-lg p-6 space-y-6 text-sm text-slate-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-bold text-blue-400 text-lg border-b border-blue-900/50 pb-1">STEP 1. 設定目標</h3>
                            <ul className="list-disc list-inside space-y-1 text-slate-400">
                                <li>左側選擇職業與目標詞綴。</li>
                                <li>勾選 <span className="text-orange-400 font-bold">GA</span> 代表該詞綴必須是太古傳奇。</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-yellow-400 text-lg border-b border-yellow-900/50 pb-1">STEP 2. 輸入掉落 (支援 OCR)</h3>
                            <ul className="list-disc list-inside space-y-1 text-slate-400">
                                <li>手動輸入數值，或使用 <span className="bg-slate-700 px-1 rounded text-xs text-white">MAX</span> 按鈕。</li>
                                <li>📸 <span className="text-green-400 font-bold">OCR 黑科技</span>：截圖後按 <code className="bg-slate-700 px-1 rounded">Ctrl+V</code>，或點擊上方拍照按鈕！</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        if (currentState === 1) multiplier = 1.25; 
        else if (currentState === 2) multiplier = 1.75; 
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
            title="點擊模擬精鑄"
        >
            <span className={currentStyle.color}>{newText}</span>
            {state > 0 && <span className="text-xs ml-2 font-mono border border-white/10 px-1 rounded bg-black/20">{currentStyle.icon} {currentStyle.label}</span>}
            {state === 0 && <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">S11 模擬 ⚒️</span>}
        </li>
    );
};

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
    
    const safeOptions = Array.isArray(options) ? options : [];
    const filteredOptions = safeOptions.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const handleSelect = (opt) => { setSearchTerm(opt); onChange(opt); setIsOpen(false); };
    
    return (
        <div className="relative w-full" ref={wrapperRef}>
            <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:border-blue-500 outline-none p-2 placeholder-slate-500"
                placeholder={placeholder} 
                value={searchTerm} 
                onClick={() => setIsOpen(true)}
                onChange={(e) => { 
                    setSearchTerm(e.target.value); 
                    onChange(e.target.value); 
                    setIsOpen(true); 
                }} 
            />
            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute top-100 left-0 right-0 max-h-48 overflow-y-auto bg-slate-800 border border-slate-600 rounded z-50 shadow-xl">
                    {filteredOptions.map((opt, idx) => (<div key={idx} className="p-2 hover:bg-slate-700 cursor-pointer text-sm text-slate-300" onClick={() => handleSelect(opt)}>{opt}</div>))}
                </div>
            )}
        </div>
    );
};

const DEFAULT_CLASS_DB = {
    "Necromancer": { label: "死靈法師", icon: "💀", base: [], temper: [], aspects: [] },
    "Barbarian": { label: "野蠻人", icon: "🪓", base: [], temper: [], aspects: [] },
    "Sorcerer": { label: "秘術師", icon: "🔮", base: [], temper: [], aspects: [] },
    "Paladin": { label: "聖騎士", icon: "🛡️", base: [], temper: [], aspects: [] },
    "Rogue": { label: "俠盜", icon: "🗡️", base: [], temper: [], aspects: [] },
    "Druid": { label: "德魯伊", icon: "🐻", base: [], temper: [], aspects: [] },
    "Spiritborn": { label: "魂靈師", icon: "👻", base: [], temper: [], aspects: [] }
};

const DEFAULT_TARGET = { itemPowerCap: 800, baseAffixes: [{name:"",isGA:false,min:"",max:""},{name:"",isGA:false,min:"",max:""},{name:"",isGA:false,min:"",max:""}], temperAffixes: [{name:"",min:"",max:""},{name:"",min:"",max:""}], aspect: { name: "", min: "", max: "" } };


function App() {
    // 👇 2. 新增分頁狀態 (grader = 評分器, chat = 聊天室)
    const [activeTab, setActiveTab] = useState('grader');

    const [selectedClass, setSelectedClass] = useState(() => localStorage.getItem("d4_selected_class") || "Necromancer");
    const [classDB, setClassDB] = useState(DEFAULT_CLASS_DB);
    const [dbLoading, setDbLoading] = useState(true);
    const [baseList, setBaseList] = useState([]);
    const [temperList, setTemperList] = useState([]);
    
    const [target, setTarget] = useState(() => { const saved = localStorage.getItem("d4_target_v8"); return saved ? JSON.parse(saved) : DEFAULT_TARGET; });
    const [drop, setDrop] = useState({ itemPower: 800, baseAffixes: [{name:"",isGA:false,value:""},{name:"",isGA:false,value:""},{name:"",isGA:false,value:""}], temperAffixes: [{name:"",value:""},{name:"",value:""}], aspect: { name: "", value: "" } });
    const [result, setResult] = useState({ score: 0, tierLabel: "等待計算...", tierColor: "text-gray-500", barColor: "bg-gray-700", matched_affixes: [], isBrick: false });
    
    // UI 狀態
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [loading, setLoading] = useState(false); 
    const [ocrLoading, setOcrLoading] = useState(false); 
    const cameraInputRef = useRef(null); 

    const firstRender = useRef(true);

    // 1. 抓取資料庫
    useEffect(() => {
        const fetchDB = async () => {
            try {
                const API_BASE = import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://d4-gear-grader.onrender.com";
                const res = await fetch(`${API_BASE}/affixes`);
                if (res.ok) {
                    const data = await res.json();
                    setClassDB(prev => ({ ...prev, ...data }));
                }
            } catch (err) {
                console.error("無法載入資料庫", err);
            }
            setDbLoading(false);
        };
        fetchDB();
    }, []);

    // 2. 更新當前職業列表
    useEffect(() => {
        if (!selectedClass || !classDB[selectedClass]) return;
        const cls = classDB[selectedClass];
        setBaseList(cls.base || []); 
        setTemperList(cls.temper || []);
        localStorage.setItem("d4_selected_class", selectedClass);
    }, [selectedClass, classDB]);

    // 3. 自動存檔
    useEffect(() => {
        if (firstRender.current) { firstRender.current = false; return; }
        localStorage.setItem("d4_target_v8", JSON.stringify(target));
        setShowSaveToast(true);
        const t = setTimeout(() => setShowSaveToast(false), 2000);
        return () => clearTimeout(t);
    }, [target]);

    // OCR 與 相機邏輯
    const handleImageUpload = async (file) => {
        setOcrLoading(true);
        try {
            const API_BASE = import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://d4-gear-grader.onrender.com";
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_BASE}/ocr`, { method: "POST", body: formData });

            if (res.ok) {
                const data = await res.json();
                const newDrop = { ...drop };
                if (data.item_power) newDrop.itemPower = data.item_power;
                if (data.base_affixes) {
                    data.base_affixes.forEach((item, idx) => {
                        if (idx < 3) newDrop.baseAffixes[idx] = { name: item.name || "", isGA: item.isGA || false, value: item.value || "" };
                    });
                }
                if (data.temper_affixes) {
                    data.temper_affixes.forEach((item, idx) => {
                        if (idx < 2) newDrop.temperAffixes[idx] = { name: item.name || "", value: item.value || "" };
                    });
                }
                if (data.aspect) newDrop.aspect = { name: data.aspect.name || "", value: data.aspect.value || "" };
                setDrop(newDrop);
            } else {
                alert("辨識失敗，請確認截圖清晰");
            }
        } catch (err) {
            console.error(err);
            alert("伺服器連線錯誤");
        }
        setOcrLoading(false);
    };

    useEffect(() => {
        const handlePaste = async (e) => {
            const items = e.clipboardData.items;
            let file = null;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) { file = items[i].getAsFile(); break; }
            }
            if (file && activeTab === 'grader') handleImageUpload(file); // 只有在評分頁面才觸發貼上
        };
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [drop, activeTab]);

    const handleCameraCapture = (event) => {
        const file = event.target.files[0];
        if (file) handleImageUpload(file);
        event.target.value = null; 
    };

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles?.length > 0) handleImageUpload(acceptedFiles[0]);
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, accept: {'image/*': []}, multiple: false, noClick: true 
    });

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

            if (res.ok) setResult(await res.json());
            else setResult(prev => ({ ...prev, tierLabel: `格式錯誤 (${res.status})` }));
        } catch (err) {
            setResult(prev => ({ ...prev, tierLabel: "後端離線", matched_affixes: ["請確認伺服器狀態"] }));
        }
        setLoading(false);
    };

    const handleTargetChange = (section, idx, field, val) => { if(section === 'aspect') setTarget({...target, aspect: {...target.aspect, [field]: val}}); else { const list = [...target[section]]; list[idx] = { ...list[idx], [field]: val }; setTarget({ ...target, [section]: list }); } };
    const handleDropChange = (section, idx, field, val) => { if(section === 'aspect') setDrop({...drop, aspect: {...drop.aspect, [field]: val}}); else { const list = [...drop[section]]; list[idx] = { ...list[idx], [field]: val }; setDrop({ ...drop, [section]: list }); } };
    const fillMax = (section, idx) => { let dropName = drop[section][idx].name; if (!dropName) return; const targetItem = target[section].find(t => t.name === dropName); if (targetItem && targetItem.max) handleDropChange(section, idx, 'value', targetItem.max); };
    const fillMaxAspect = () => { if (target.aspect.max) handleDropChange('aspect', null, 'value', target.aspect.max); };
    const resetDrop = () => { setDrop({ itemPower: 800, baseAffixes: [{name:"",isGA:false,value:""},{name:"",isGA:false,value:""},{name:"",isGA:false,value:""}], temperAffixes: [{name:"",value:""},{name:"",value:""}], aspect: { name: "", value: "" } }); setResult({ score: 0, tierLabel: "等待計算...", tierColor: "text-gray-500", barColor: "bg-gray-700", matched_affixes: [], isBrick: false }); };

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto relative pb-20">
            {ocrLoading && (
                <div className="fixed inset-0 bg-black/80 z-[999] flex flex-col items-center justify-center backdrop-blur-sm">
                    <div className="animate-spin text-5xl mb-4">📸</div>
                    <div className="text-xl font-bold text-white animate-pulse">正在分析裝備截圖...</div>
                    <div className="text-sm text-gray-400 mt-2">AI 正在努力閱讀數值</div>
                </div>
            )}
            
            {showSaveToast && <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">💾 已自動存檔</div>}
            
            <header className="mb-4 w-full text-center mt-6">
                <h1 className="text-3xl font-bold text-red-500 tracking-wider uppercase border-b-2 border-red-900 pb-2">D4 Gear Grader</h1>
            </header>

            {/* 👇 3. 分頁切換按鈕區 (Tab Switcher) */}
            <div className="flex justify-center gap-2 mb-6 w-full max-w-md bg-slate-900 p-1 rounded-full border border-slate-700">
                <button 
                    onClick={() => setActiveTab('grader')}
                    className={`flex-1 py-2 rounded-full font-bold transition-all duration-300 ${
                        activeTab === 'grader' 
                        ? 'bg-red-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                    ⚔️ 裝備評分
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 rounded-full font-bold transition-all duration-300 ${
                        activeTab === 'chat' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                    🤖 AI 助手
                </button>
            </div>

            {/* 👇 4. 根據 activeTab 顯示不同內容 */}
            {activeTab === 'grader' ? (
                <>
                    {/* --- 原本的評分器內容 --- */}
                    <div className="w-full mb-6 flex flex-wrap justify-center gap-3">
                        {dbLoading ? <span className="text-slate-500 animate-pulse">正在載入資料庫...</span> : 
                        Object.keys(classDB).map(clsKey => (
                            <button key={clsKey} onClick={() => setSelectedClass(clsKey)} className={`px-5 py-2 rounded-lg flex items-center gap-2 font-bold class-btn ${selectedClass === clsKey ? 'active' : 'inactive'}`}>
                                <span>{classDB[clsKey]?.icon}</span> {classDB[clsKey]?.label}
                            </button>
                        ))
                        }
                    </div>

                    <div className="w-full bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-blue-400 flex items-center gap-2">
                            <CameraIcon className="h-6 w-6" /> 智慧截圖辨識
                        </h2>
                        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display: 'none' }} onChange={handleCameraCapture}/>
                        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors relative ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-blue-400 hover:bg-slate-700/50'}`}>
                            <input {...getInputProps()} />
                            {ocrLoading ? (
                                <div className="flex flex-col items-center justify-center text-blue-400">
                                    <ArrowPathIcon className="h-10 w-10 animate-spin mb-4" />
                                    <p className="text-lg font-semibold">AI 正在分析...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <PhotoIcon className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                                    <p className="text-lg text-slate-300 mb-2">拖放截圖 / Ctrl+V 貼上</p>
                                    <p className="text-slate-600 text-sm mb-4">- 或 -</p>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); cameraInputRef.current.click(); }} className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-md hover:scale-105 transition-transform">
                                        <CameraIcon className="h-6 w-6 mr-2" /> 拍照 / 選擇圖片
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                        <div className="bg-slate-900 p-6 rounded-xl diablo-border border-l-4 border-blue-600">
                            <h2 className="text-xl font-bold text-blue-400 mb-4 section-header">1. 設定目標</h2>
                            <div className="mb-6 space-y-2"><h3 className="text-sm text-slate-400 font-bold">天生詞綴</h3>{[0,1,2].map(i => (<div key={i} className="grid grid-cols-12 gap-2 items-center"><div className="col-span-5 relative"><SearchableSelect options={baseList} placeholder="搜尋詞綴..." value={target.baseAffixes[i].name} onChange={v=>handleTargetChange('baseAffixes',i,'name',v)} /></div><div className="col-span-1 flex justify-center"><input type="checkbox" className="accent-orange-500 w-4 h-4" checked={target.baseAffixes[i].isGA} onChange={e=>handleTargetChange('baseAffixes',i,'isGA',e.target.checked)}/></div><div className="col-span-3"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="Min" value={target.baseAffixes[i].min} onChange={e=>handleTargetChange('baseAffixes',i,'min',e.target.value)}/></div><div className="col-span-3"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="Max" value={target.baseAffixes[i].max} onChange={e=>handleTargetChange('baseAffixes',i,'max',e.target.value)}/></div></div>))}</div>
                            <div className="mb-6 space-y-2"><h3 className="text-sm text-slate-400 font-bold text-yellow-500">⚒️ 回火目標</h3>{[0,1].map(i => (<div key={i} className="grid grid-cols-12 gap-2 items-center"><div className="col-span-6 relative"><SearchableSelect options={temperList} placeholder="搜尋回火..." value={target.temperAffixes[i].name} onChange={v=>handleTargetChange('temperAffixes',i,'name',v)} /></div><div className="col-span-3"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="Min" value={target.temperAffixes[i].min} onChange={e=>handleTargetChange('temperAffixes',i,'min',e.target.value)}/></div><div className="col-span-3"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="Max" value={target.temperAffixes[i].max} onChange={e=>handleTargetChange('temperAffixes',i,'max',e.target.value)}/></div></div>))}</div>
                            <div className="space-y-2 border-t border-slate-700 pt-4">
                                <h3 className="text-sm text-orange-400 font-bold">🔥 特效</h3>
                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-6 relative"><SearchableSelect options={classDB[selectedClass]?.aspects || []} placeholder="搜尋威能..." value={target.aspect.name} onChange={v=>handleTargetChange('aspect',null,'name',v)} /></div>
                                    <div className="col-span-3"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="Min" value={target.aspect.min} onChange={e=>handleTargetChange('aspect',null,'min',e.target.value)}/></div>
                                    <div className="col-span-3"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-white" placeholder="Max" value={target.aspect.max} onChange={e=>handleTargetChange('aspect',null,'max',e.target.value)}/></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-xl diablo-border border-l-4 border-yellow-600 relative">
                            <div className="flex justify-between items-center mb-4 section-header"><h2 className="text-xl font-bold text-yellow-400">2. 輸入掉落</h2><div className="flex gap-2"><button onClick={()=>setDrop({...drop,itemPower:drop.itemPower===800?750:800})} className={`px-3 py-1 rounded text-sm font-bold ${drop.itemPower===800?'bg-orange-600 text-white':'bg-blue-600 text-white'}`}>{drop.itemPower}</button><button onClick={resetDrop} className="px-3 py-1 rounded text-sm bg-slate-700 text-white hover:bg-slate-600 border border-slate-500">下一件 ↺</button></div></div>
                            <div className="mb-6 space-y-2"><h3 className="text-sm text-slate-400 font-bold">鑑定天生詞綴</h3>{[0,1,2].map(i => (<div key={i} className="grid grid-cols-12 gap-2 items-center"><div className="col-span-5 relative"><SearchableSelect options={baseList} placeholder="鑑定詞綴..." value={drop.baseAffixes[i].name} onChange={v=>handleDropChange('baseAffixes',i,'name',v)} /></div><div className="col-span-1 flex justify-center"><input type="checkbox" className="accent-orange-500 w-5 h-5" checked={drop.baseAffixes[i].isGA} onChange={e=>handleDropChange('baseAffixes',i,'isGA',e.target.checked)}/></div><div className="col-span-6 flex gap-1"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-yellow-400 font-bold" placeholder="Val" value={drop.baseAffixes[i].value} onChange={e=>handleDropChange('baseAffixes',i,'value',e.target.value)}/><button onClick={()=>fillMax('baseAffixes', i)} className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-2 rounded">MAX</button></div></div>))}</div>
                            <div className="mb-6 space-y-2"><h3 className="text-sm text-slate-400 font-bold text-yellow-500">⚒️ 鑑定回火</h3>{[0,1].map(i => (<div key={i} className="grid grid-cols-12 gap-2 items-center"><div className="col-span-6 relative"><SearchableSelect options={temperList} placeholder="(未回火)" value={drop.temperAffixes[i].name} onChange={v=>handleDropChange('temperAffixes',i,'name',v)} /></div><div className="col-span-6 flex gap-1"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-yellow-400 font-bold" placeholder="Val" value={drop.temperAffixes[i].value} onChange={e=>handleDropChange('temperAffixes',i,'value',e.target.value)}/><button onClick={()=>fillMax('temperAffixes', i)} className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-2 rounded">MAX</button></div></div>))}</div>
                            <div className="space-y-2 border-t border-slate-700 pt-4"><h3 className="text-sm text-orange-400 font-bold">🔥 鑑定特效</h3><div className="grid grid-cols-12 gap-2 items-center"><div className="col-span-6"><span className="text-sm text-gray-500 italic block p-2">對應左側特效數值</span></div><div className="col-span-6 flex gap-1"><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center text-orange-400 font-bold" placeholder="Val" value={drop.aspect.value} onChange={e=>handleDropChange('aspect',null,'value',e.target.value)}/><button onClick={fillMaxAspect} className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-2 rounded">MAX</button></div></div></div>
                            <div className="mt-6"><button onClick={calculateScore} disabled={loading} className={`w-full py-3 rounded-lg font-bold text-xl shadow-lg border-2 transition-all transform hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2 ${loading ? 'bg-slate-700 border-slate-600 cursor-not-allowed text-gray-400' : 'bg-red-700 hover:bg-red-600 border-red-900 text-white'}`}>{loading ? (<><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>計算中...</>) : "⚔️ 開始評分 (CALCULATE)"}</button></div>
                        </div>
                    </div>
                    <div className="mt-8 w-full max-w-5xl bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl">
                        <div className="w-full h-8 bg-slate-900 rounded-full overflow-hidden border border-slate-600 relative mb-4"><div className={`h-full transition-all duration-700 flex items-center justify-end pr-3 ${result.barColor}`} style={{ width: `${result.score}%` }}><span className="text-sm font-bold text-white drop-shadow-md">{result.score}%</span></div></div>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/3"><h3 className={`text-3xl font-extrabold ${result.tierColor} mb-2`}>{result.tierLabel}</h3>{result.isBrick && <div className="text-red-300 font-bold bg-red-950/50 p-2 rounded text-center animate-pulse">⚠️ 已變磚</div>}</div>
                            <div className="w-full md:w-2/3 bg-slate-900/50 p-4 rounded border border-slate-700/50">
                                <div className="text-xs text-slate-500 mb-2 text-center">💡 小撇步：點擊下方的詞綴，可以模擬 S11 精鑄 (Q25/晉階) 喔！</div>
                                <ul className="space-y-1 text-sm text-slate-300 max-h-60 overflow-y-auto pr-2">{result.matched_affixes?.map((log, idx) => (<MasterworkingItem key={idx} text={log} />))}</ul>
                            </div>
                        </div>
                    </div>
                    
                    <HowToUse />
                </>
            ) : (
                /* --- 這裡就是新的聊天室 --- */
                <ChatBot />
            )}

            <div className="mt-8 w-full max-w-5xl">
                <h3 className="text-slate-400 text-sm font-bold mb-2 ml-1">📜 更新日誌</h3>
                <textarea readOnly value={UPDATE_LOG} className="w-full h-48 bg-slate-900/80 border border-slate-700 rounded-lg p-4 text-slate-400 text-sm font-mono focus:outline-none resize-none diablo-border shadow-inner" style={{ whiteSpace: 'pre-wrap' }} />
            </div>
        </div>
    );
}

export default App;