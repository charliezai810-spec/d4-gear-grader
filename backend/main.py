import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import json
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyAT2kScGYywTeAm3SfJfET0g91TZ3nhBg4")
genai.configure(api_key=GOOGLE_API_KEY)
app = FastAPI()
def load_db():
    try:
        # 找到 data/affixes.json 的正確路徑
        file_path = os.path.join(os.path.dirname(__file__), "data", "affixes.json")
        
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                print("✅ 成功載入 affixes.json")
                return data
        else:
            print("⚠️ 找不到 affixes.json，請確認檔案位置")
            return {}
    except Exception as e:
        print(f"❌ 讀取資料庫失敗: {e}")
        return {}

# 👇 【新增這段】讓前端 (React) 可以抓到資料的 API
@app.get("/affixes")
def get_affixes():
    # 這裡我們設定「每次前端呼叫都重新讀一次檔案」
    # 這樣你在 Render 上改了 JSON，只要刷新網頁就會生效，不用重啟伺服器！
    return load_db()

# --- CORS 設定 (只留一組就好) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允許所有網址連線
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 資料模型 (對應前端傳來的 JSON) ---
class AffixItem(BaseModel):
    name: str = ""
    isGA: bool = False
    min: Optional[float] = None
    max: Optional[float] = None
    value: Optional[float] = None

class AspectItem(BaseModel):
    name: str = ""
    min: Optional[float] = None
    max: Optional[float] = None
    value: Optional[float] = None

class GearInput(BaseModel):
    target_base: List[AffixItem]
    target_temper: List[AffixItem]
    target_aspect: AspectItem
    drop_base: List[AffixItem]
    drop_temper: List[AffixItem]
    drop_aspect: AspectItem
    drop_item_power: int

# --- 核心邏輯 (Python 版) ---
@app.post("/calculate")
async def calculate_score(data: GearInput):
    log = []
    total_weight = 0
    earned_score = 0
    brick_count = 0
    
    # 評分 Helper
    def evaluate_item(target_item, drop_item, type_name, is_optional=False):
        nonlocal total_weight, earned_score, brick_count
        
        name = target_item.name
        if not name: return 

        weight = 20
        d_val = drop_item.value
        
        # 檢查空值
        if d_val is None:
            if is_optional:
                log.append(f"ℹ️ [{type_name}] {name}: 尚未輸入/未回火 (不計分)")
                return
            else:
                total_weight += weight
                log.append(f"❌ [{type_name}] {name}: 未輸入數值")
                return

        total_weight += weight
        is_pass = True
        issues = []

        # GA 檢查
        if type_name == "Base" and target_item.isGA and not drop_item.isGA:
            is_pass = False
            issues.append("缺GA")

        # 數值檢查
        if target_item.min is not None and d_val < target_item.min:
            is_pass = False
            issues.append("數值低")
        if target_item.max is not None and d_val > target_item.max:
            is_pass = False
            issues.append("數值超標")

        if is_pass:
            earned_score += weight
            ga_tag = "(GA)" if hasattr(drop_item, 'isGA') and drop_item.isGA else ""
            log.append(f"✅ [{type_name}] {name} +{d_val}: 達標 {ga_tag}")
        else:
            log.append(f"⚠️ [{type_name}] {name}: {', '.join(issues)}")

    # 1. 評分基底 (亂序搜尋)
    used_indices = set()
    for t_item in data.target_base:
        if not t_item.name: continue
        
        found_idx = -1
        for i, d_item in enumerate(data.drop_base):
            if d_item.name == t_item.name and i not in used_indices:
                found_idx = i
                break
        
        if found_idx != -1:
            used_indices.add(found_idx)
            evaluate_item(t_item, data.drop_base[found_idx], "Base")
        else:
            total_weight += 20
            log.append(f"❌ [基底] {t_item.name}: 詞綴不符")

    # 2. 評分回火
    used_temper_indices = set()
    for t_item in data.target_temper:
        if not t_item.name: continue
        
        found_idx = -1
        for i, d_item in enumerate(data.drop_temper):
            if d_item.name == t_item.name and i not in used_temper_indices:
                found_idx = i
                break
        
        if found_idx != -1:
            used_temper_indices.add(found_idx)
            evaluate_item(t_item, data.drop_temper[found_idx], "Temper", is_optional=True)
        else:
            # 檢查是否為空位
            empty_idx = -1
            for i, d_item in enumerate(data.drop_temper):
                if d_item.name == "" and i not in used_temper_indices:
                    empty_idx = i
                    break
            
            if empty_idx != -1:
                used_temper_indices.add(empty_idx)
                log.append(f"ℹ️ [回火] {t_item.name}: 尚未回火")
            else:
                log.append(f"❌ [回火] {t_item.name}: 變磚")
                brick_count += 1

    # 3. 評分特效
    if data.target_aspect.name:
        evaluate_item(data.target_aspect, data.drop_aspect, "特效", is_optional=True)

    # 結算
    final_score = 0
    if total_weight > 0:
        final_score = round((earned_score / total_weight) * 100)
    
    if data.drop_item_power < 800 and final_score > 75:
        final_score = 75
        log.append("📉 強度限制: 非800，上限75%")

    # 等級判定
    label, color, bar = "", "", ""
    is_brick = False
    
    if brick_count > 0 and final_score < 60:
        label="🧱 已變磚"
        color="text-red-500"
        bar="bg-red-600"
        is_brick = True
    elif final_score == 100:
        label="👑 完美畢業"
        color="text-orange-500"
        bar="bg-orange-600 shadow-[0_0_20px_orange]"
    elif final_score >= 80:
        label="🔥 畢業等級"
        color="text-yellow-400"
        bar="bg-yellow-500"
    elif final_score >= 60:
        label="✨ 準畢業"
        color="text-blue-400"
        bar="bg-blue-600"
    else:
        label="🗑️ 垃圾"
        color="text-gray-400"
        bar="bg-gray-600"

    # 🔥 關鍵修正：這裡的 key 改成 matched_affixes，這樣前端就看得到了！ 🔥
    return {
        "score": final_score,
        "tierLabel": label,
        "tierColor": color,
        "barColor": bar,
        "matched_affixes": log, 
        "isBrick": is_brick
    }
@app.post("/ocr")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # 1. 讀取圖片
        content = await file.read()
        
        # 2. 設定 Prompt (咒語)
        # 教 Gemini 看懂暗黑4的裝備截圖，並轉成我們需要的 JSON 格式
        prompt = """
        Analyze this Diablo 4 item screenshot. Extract the stats into a JSON format strictly matching this structure:
        {
            "item_power": int,
            "base_affixes": [
                {"name": "Affix Name (Traditional Chinese)", "value": number, "isGA": boolean},
                ... (max 3 items)
            ],
            "temper_affixes": [
                {"name": "Temper Name (Traditional Chinese)", "value": number},
                ... (max 2 items)
            ],
            "aspect": {
                "name": "Aspect Name (Traditional Chinese, only the effect name)",
                "value": number (extract the dynamic value in blue/orange, if range exists take the current value)
            }
        }
        RULES:
        1. Translate all names to Traditional Chinese (繁體中文) matching Diablo 4 Taiwan terminology.
        2. "isGA" is true if there is a star icon next to the stat.
        3. Only extract numbers, ignore symbols like +, %, brackets.
        4. If it's a Greater Affix (GA), the value is the boosted value.
        5. Return ONLY raw JSON, no markdown formatting.
        """

        # 3. 呼叫 Gemini Flash (速度快又省錢)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content([
            {"mime_type": "image/jpeg", "data": content},
            prompt
        ])

        # 4. 清理回傳的字串 (有時候會包含 ```json ... ```)
        text_response = response.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response[7:-3]
        
        return json.loads(text_response)

    except Exception as e:
        print(f"OCR Error: {e}")
        raise HTTPException(status_code=500, detail="圖片辨識失敗，請重試")