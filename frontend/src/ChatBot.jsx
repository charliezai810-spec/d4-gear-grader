import { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
    // 初始訊息
    const [messages, setMessages] = useState([
        { role: 'ai', text: '你好！我是你的 D4 隨身顧問。關於配裝、精華或流派的問題都可以問我喔！😈' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // 自動捲動到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 當訊息變動時，自動捲動
    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        
        // 1. 新增使用者的訊息
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            // 2. 先放一個「空的」AI 訊息佔位，準備接收串流文字
            setMessages(prev => [...prev, { role: 'ai', text: '' }]);

            // 自動切換網址 (本機開發 vs 線上 Render)
            const API_BASE = import.meta.env.DEV 
                ? "http://127.0.0.1:8000" 
                : "https://d4-gear-grader.onrender.com";
            
            // 發送請求 (包含歷史紀錄)
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsg,
                    // 傳送除了最新一條(空的)以外的歷史紀錄
                    history: messages 
                })
            });

            // 3. 處理串流回應 (Streaming)
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let aiResponseText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // 解碼收到的片段
                const chunk = decoder.decode(value, { stream: true });
                aiResponseText += chunk;

                // 即時更新最後一條訊息 (AI 的回應)
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsgIndex = newMsgs.length - 1;
                    // 更新最後一條訊息的內容
                    newMsgs[lastMsgIndex] = { 
                        ...newMsgs[lastMsgIndex], 
                        text: aiResponseText 
                    };
                    return newMsgs;
                });
            }

        } catch (err) {
            console.error(err);
            // 如果出錯，把最後那個空的訊息改成錯誤提示
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { role: 'ai', text: "💀 聖休亞瑞的連線中斷了... (請確認後端是否開啟)" };
                return newMsgs;
            });
        }
        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto h-[600px] flex flex-col bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden mt-4">
            {/* 聊天標題 */}
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <h2 className="text-lg font-bold text-blue-400">聖休亞瑞智庫 (AI Assistant)</h2>
            </div>

            {/* 訊息顯示區 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm md:text-base shadow-md ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-slate-700 text-slate-200 rounded-bl-none border border-slate-600'
                        }`}>
                            {/* 使用 whitespace-pre-wrap 讓 AI 的換行能正常顯示 */}
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            {/* 如果文字是空的且正在讀取，顯示跳動點點 */}
                            {msg.text === '' && loading && idx === messages.length - 1 && (
                                <span className="flex gap-1 items-center h-5">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* 輸入區 */}
            <div className="p-4 bg-slate-800 border-t border-slate-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="問問看：魂靈師這一季推薦什麼裝備？..."
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        disabled={loading && messages[messages.length-1]?.text === ''} // 只有在完全沒內容時鎖住，開始串流後可先打字
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg"
                    >
                        發送
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;