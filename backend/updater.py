import os
import json
import google.generativeai as genai

# 🔥 設定你的 API Key (跟 OCR 用同一串即可)
GOOGLE_API_KEY = "AIzaSyAT2kScGYywTeAm3SfJfET0g91TZ3nhBg4"
genai.configure(api_key=GOOGLE_API_KEY)

def update_database():
    print("📋 請去複製『官方 Patch Notes』或『Maxroll 詞綴列表』的文字...")
    print("👉 建議一次複製一個職業的資料，比較準確。")
    print("--------------------------------------------------")
    
    # 讓使用者貼上文字 (支援多行貼上，直到輸入 END 結束)
    print("請貼上文字 (貼完後按 Enter，然後輸入 'END' 再按 Enter 來開始處理):")
    lines = []
    while True:
        line = input()
        if line.strip() == "END":
            break
        lines.append(line)
    
    raw_text = "\n".join(lines)
    
    if not raw_text.strip():
        print("❌ 你沒貼上任何東西！")
        return

    print("🤖 AI 正在閱讀你貼上的文字並整理資料庫... (約需 10-20 秒)")

    # 呼叫 Gemini
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # 強大的 Prompt (咒語)
    prompt = f"""
    You are a Diablo 4 Database Assistant.
    I will provide raw text containing Diablo 4 Affixes (Attributes) and Tempering Manuals.
    
    Your task is to extract this data and output a strictly valid JSON.
    
    TARGET FORMAT (Example):
    {{
      "Necromancer": {{
        "label": "死靈法師",
        "icon": "💀",
        "base": ["智力", "最大生命", ...],
        "temper": ["【武器】骨矛雙倍傷害", "【攻擊】召喚傷害", ...]
      }},
      ... (Detect other classes if present in text)
    }}

    RULES:
    1. Translate everything to Traditional Chinese (繁體中文) used in Taiwan server.
    2. "base" contains native item affixes (e.g., Intelligence, Cooldown Reduction).
    3. "temper" contains tempering manual options (e.g., Chance for Bone Spear to cast twice).
    4. Categorize Tempering affixes with prefixes like 【武器】, 【攻擊】, 【防禦】, 【輔助】, 【資源】.
    5. If the text only contains data for one class (e.g. Sorcerer), only return that class in the JSON.
    6. Return ONLY the JSON string. No markdown formatting.

    RAW TEXT TO PROCESS:
    {raw_text}
    """

    try:
        response = model.generate_content(prompt)
        json_str = response.text.strip()
        
        # 清理 markdown 符號
        if json_str.startswith("```json"):
            json_str = json_str[7:-3]
            
        # 嘗試解析 JSON 確保格式正確
        new_data = json.loads(json_str)
        
        # 讀取舊資料 (如果有的話)
        file_path = os.path.join(os.path.dirname(__file__), "data", "affixes.json")
        old_data = {}
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                old_data = json.load(f)
        
        # 合併資料 (用新的覆蓋舊的)
        old_data.update(new_data)
        
        # 存檔
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(old_data, f, ensure_ascii=False, indent=4)
            
        print(f"✅ 更新成功！已更新職業: {list(new_data.keys())}")
        print(f"📁 檔案已儲存至: {file_path}")

    except Exception as e:
        print(f"❌ 發生錯誤: {e}")
        print("AI 回傳的內容:", json_str)

if __name__ == "__main__":
    update_database()