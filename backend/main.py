import os
import json
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv

# 1. 載入環境變數 (API Key)
load_dotenv()

# 2. 初始化 App
app = FastAPI()

# 3. 設定 CORS (讓前端可以連線)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允許所有來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. 設定 Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# --- 👇 這裡就是你要的功能 (一定要放在外面！) 👇 ---
class ChatRequest(BaseModel):
    message: str
def load_db():
    """讀取 affixes.json 資料庫"""
    try:
        file_path = os.path.join(os.path.dirname(__file__), "data", "affixes.json")
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                print("✅ [Server] Database loaded successfully!")
                return json.load(f)
        else:
            print(f"⚠️ [Server] Warning: {file_path} not found.")
            return {}
    except Exception as e:
        print(f"❌ [Server] Error loading DB: {e}")
        return {}

@app.get("/")
def home():
    """首頁測試用"""
    return {"status": "ok", "message": "Diablo 4 Backend is Running!"}

@app.get("/affixes")
def get_affixes():
    """前端拿資料的接口"""
    return load_db()

# --- 👆 你的功能結束 👆 ---
@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    if not GOOGLE_API_KEY:
        return {"reply": "❌ 伺服器沒有設定 API Key，無法聊天。"}
    
    try:
        # 這裡設定 AI 的人設
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        你是一位精通《暗黑破壞神 4 (Diablo 4)》的資深專家與數據分析師。
        你的語氣應該專業、熱情，偶爾帶一點遊戲內的幽默（例如引用涅法雷姆、莉莉絲等梗）。
        
        玩家問你：{request.message}
        
        請用繁體中文回答，針對遊戲機制、裝備搭配、流派建構給出建議。
        如果玩家問的不是暗黑破壞神相關的問題，請幽默地把話題拉回來。
        """
        
        response = model.generate_content(prompt)
        return {"reply": response.text}
    
    except Exception as e:
        print(f"Chat Error: {e}")
        return {"reply": "聖休亞瑞的連線似乎中斷了... 💀"}
@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    """原本的 OCR 功能"""
    if not GOOGLE_API_KEY:
        return {"error": "No API Key found"}
    
    try:
        content = await file.read()
        model = genai.GenerativeModel('gemini-1.5-flash') 
        # 如果你的帳號能用 2.0，也可以改這裡: 'models/gemini-2.0-flash'
        
        prompt = """
        Analyze this Diablo 4 item screenshot.
        Return strictly valid JSON.
        Format:
        {
            "item_power": 800,
            "base_affixes": [{"name": "Intelligence", "value": "50", "isGA": false}, ...],
            "temper_affixes": [{"name": "Bone Spear Cast Twice", "value": "20"}, ...],
            "aspect": {"name": "Aspect of Grasping Veins", "value": "15"}
        }
        """
        
        response = model.generate_content([
            {"mime_type": "image/jpeg", "data": content},
            prompt
        ])
        
        json_str = response.text.strip()
        if json_str.startswith("```json"):
            json_str = json_str[7:-3]
            
        return json.loads(json_str)

    except Exception as e:
        print(f"OCR Error: {e}")
        return {"error": str(e)}

# 5. 啟動指令 (Render 不會跑這段，它是給你在本機測試用的)
if __name__ == "__main__":
    import uvicorn
    print("🚀 Local Server Starting...")
    uvicorn.run(app, host="127.0.0.1", port=8000)