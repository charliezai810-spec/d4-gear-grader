import warnings
# 隱藏煩人的警告
warnings.filterwarnings("ignore")

import os
import json
import asyncio
from typing import List, Optional
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 👇👇👇 重點：使用最新的 Google GenAI SDK 👇👇👇
from google import genai
from google.genai import types
from PIL import Image
import io

# 1. 載入環境變數
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# 2. 初始化 Client (新版語法)
# 注意：新版不再用 configure，而是直接建立 Client 實體
client = None
if GOOGLE_API_KEY:
    client = genai.Client(api_key=GOOGLE_API_KEY)

app = FastAPI()

# 3. CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 資料結構 ---
class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

# --- 核心功能 ---

@app.get("/")
def read_root():
    return {"Hello": "Diablo 4 Server (New GenAI SDK)", "Status": "Ready"}

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    if not client:
        async def err(): yield "❌ 伺服器未設定 GOOGLE_API_KEY"
        return StreamingResponse(err(), media_type="text/plain")

    async def generate():
        try:
            # 1. 建構對話歷史 (新版 SDK 格式)
            # 格式：contents=[{"role": "user", "parts": [{"text": "..."}]}, ...]
            contents = []
            
            for msg in request.history:
                # 轉換 role: 前端的 'ai' -> SDK 的 'model'
                role = "user" if msg.role == "user" else "model"
                if msg.text and msg.text.strip():
                    contents.append(
                        types.Content(
                            role=role,
                            parts=[types.Part.from_text(text=msg.text)]
                        )
                    )

            # 2. 加入 System Prompt (人設)
            # 新版 SDK 支援將 config 分開設定，但直接放在 prompt 最前面最簡單暴力
            system_instruction = """
            你是一位《暗黑破壞神 4 (Diablo IV)》的資深裝備顧問。
            請用繁體中文回答，風格專業且帶有幽默感。
            若是 S7/S8 最新賽季資訊不確定，請誠實告知。
            """
            
            # 將人設與當前問題結合成最後一條訊息
            current_message = f"{system_instruction}\n\n玩家問題：{request.message}"
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=current_message)]
                )
            )

            # 3. 發送請求 (使用 gemini-2.0-flash 或 gemini-1.5-flash)
            # config 設定串流回傳
            print("🤖 AI (SDK v1) 正在思考...", flush=True)
            
            response = client.models.generate_content_stream(
                model='gemini-2.5-flash', # 如果 2.0 還沒開放，請改回 'gemini-1.5-flash'
                contents=contents
            )

            # 4. 逐字回傳
            for chunk in response:
                if chunk.text:
                    print(f"推播: {chunk.text[:5]}...", flush=True)
                    yield chunk.text
                    # 💡 為了前端打字機效果，稍微暫停
                    await asyncio.sleep(0.05)

        except Exception as e:
            print(f"Chat Error: {e}")
            yield f"☠️ 錯誤：{str(e)}"

    return StreamingResponse(generate(), media_type="text/plain")


@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    if not client:
        return JSONResponse(content={"error": "No API Key"}, status_code=500)

    try:
        # 讀取圖片並轉為 PIL 格式
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        prompt = """
        Analyze this Diablo 4 item screenshot.
        Return strictly valid JSON.
        Fields: item_name, item_power, item_type, rarity, base_affixes, temper_affixes, aspect.
        """

        # 新版 Vision 呼叫方式
        response = client.models.generate_content(
            model='gemini-2.5-flash', # 圖片辨識建議用最新的
            contents=[prompt, image]
        )
        
        # 清理 JSON 標籤
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)

        return JSONResponse(content=data)

    except Exception as e:
        print(f"OCR Error: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    print("🚀 D4 Server Starting (New SDK)...")
    uvicorn.run(app, host="0.0.0.0", port=8000)