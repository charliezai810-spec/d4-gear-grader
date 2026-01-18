import { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: '你好！我是你的 D4 隨身顧問。有關於配裝、威能或流派的問題都可以問我喔！😈' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // 自動捲動到最新訊息
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const API_BASE = import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://d4-gear-grader.onrender.com";
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "連線失敗，請檢查網路或伺服器狀態 💀" }]);
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
        <div className="w-full max-w-4xl mx-auto h-[600px] flex flex-col bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            {/* 聊天標題 */}
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <h2 className="text-lg font-bold text-blue-400">聖休亞瑞智庫</h2>
            </div>

            {/* 訊息顯示區 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-slate-700 text-slate-200 rounded-bl-none border border-slate-600'
                        }`}>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-700 p-3 rounded-2xl rounded-bl-none flex gap-2 items-center">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
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
                        placeholder="輸入問題... (例如：俠盜這季推薦玩什麼流派？)"
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        發送
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;