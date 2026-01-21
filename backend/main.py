import warnings
# 隱藏那些煩人的版本警告
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

# 👇👇👇 使用經典版 SDK (最穩定) 👇👇👇
import google.generativeai as genai
from PIL import Image
import io

# 1. 載入環境變數
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI()

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
    return {"Status": "D4 Server Running (Classic SDK)", "Model": "Gemini-1.5-Flash"}

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    if not GOOGLE_API_KEY:
        async def err(): yield "❌ 伺服器未設定 API Key"
        return StreamingResponse(err(), media_type="text/plain")

    async def generate():
        try:
            # 👇 關鍵修正：使用 1.5-flash (速度快、免費額度高、不會 429)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # 轉換歷史紀錄 (經典版格式)
            chat_history = []
            for msg in request.history:
                role = "user" if msg.role == "user" else "model"
                if msg.text and msg.text.strip():
                    chat_history.append({
                        "role": role,
                        "parts": [msg.text]
                    })

            # 啟動對話
            chat = model.start_chat(history=chat_history)
            
            system_instruction = """
            你是一位《暗黑破壞神 4》資深裝備顧問。
            請用繁體中文回答，風格專業且帶有幽默感。
            """
            
            full_message = f"{system_instruction}\n\n玩家問題：{request.message}"
            
            # 開啟串流
            print("🤖 AI 正在思考...", flush=True)
            response = chat.send_message(full_message, stream=True)
            
            for chunk in response:
                if chunk.text:
                    print(f"推播: {chunk.text[:5]}...", flush=True)
                    yield chunk.text
                    await asyncio.sleep(0.05) # 讓打字機效果更滑順

        except Exception as e:
            print(f"Chat Error: {e}")
            yield f"☠️ 錯誤：{str(e)}"

    return StreamingResponse(generate(), media_type="text/plain")


@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    if not GOOGLE_API_KEY:
        return JSONResponse(content={"error": "No API Key"}, status_code=500)

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # 圖片辨識也用 1.5-flash
        model = genai.GenerativeModel('gemini-1.5-flash')

        prompt = """
        Analyze this Diablo 4 item screenshot.
        Return strictly valid JSON.
        Fields: item_name, item_power, item_type, rarity, base_affixes, temper_affixes, aspect.
        """

        response = model.generate_content([prompt, image])
        
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)

        return JSONResponse(content=data)

    except Exception as e:
        print(f"OCR Error: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    print("🚀 D4 Server Starting (Classic SDK)...")
    uvicorn.run(app, host="0.0.0.0", port=8000)