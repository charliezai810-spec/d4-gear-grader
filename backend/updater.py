import os
import json
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
from dotenv import load_dotenv  # 👈 新增這行

# 👇 載入 .env 檔案裡的秘密
load_dotenv()

# 👇 這裡改成這樣，不要再貼鑰匙了！讓它去讀環境變數
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    print("❌ 錯誤：找不到 API Key！請確認你有建立 .env 檔案。")
    exit()

genai.configure(api_key=GOOGLE_API_KEY)
# ... (後面程式碼不用動)

def fetch_url_text(url):
    print(f"🌍 正在前往 {url} 抓取網頁資料...")
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # 🗑️ 強力掃除垃圾標籤：把導覽列、頁尾、廣告、側邊欄全部刪掉
        for junk in soup(["script", "style", "nav", "footer", "header", "aside", "iframe", "noscript"]):
            junk.decompose()
            
        # 取得純文字
        text = soup.get_text(separator="\n")
        
        # 清理多餘的空白行 (把連續的換行變成單一換行)
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        clean_text = "\n".join(lines)
        
        # ✂️ 限制長度：只取前 15,000 字 (避免 AI 消化不良)
        # 通常重要的 Patch Note 都在前面，後面都是留言區
        final_text = clean_text[:15000]
        
        print(f"✅ 抓取成功！網頁瘦身後長度: {len(final_text)} 字")
        return final_text
        
    except Exception as e:
        print(f"❌ 抓取網頁失敗: {e}")
        return None

def update_database():
    print("==================================================")
    print("      D4 資料庫自動更新器 (瘦身穩定版)")
    print("==================================================")
    
    # 選擇模式：如果要貼網址選 1，如果要直接貼文字選 2
    print("請選擇模式：")
    print("1. 輸入網址 (URL)")
    print("2. 直接貼上文字 (Raw Text) - 最穩！")
    mode = input("請輸入 1 或 2: ").strip()

    raw_text = ""
    
    if mode == "1":
        target_url = input("網址 URL: ").strip()
        if target_url:
            raw_text = fetch_url_text(target_url)
    else:
        print("請貼上文字 (輸入 END 結束):")
        lines = []
        while True:
            line = input()
            if line.strip() == "END":
                break
            lines.append(line)
        raw_text = "\n".join(lines)

    if not raw_text:
        print("❌ 沒有資料可以處理")
        return

    print("🤖 AI 正在解析中... (請稍等)")

    # 呼叫 Gemini
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are a professional Diablo 4 Data Localizer.
    Extract data into valid JSON with strict Traditional Chinese (zh-TW) localization.
    
    TARGET FORMAT:
    {{
      "Necromancer": {{
        "label": "死靈法師",
        "icon": "💀",
        "base": ["智力", "最大生命", ...],
        "temper": ["【武器】骨矛額外傷害", ...],
        "aspects": ["加速威能", "月亮升起之威能", ...]
      }},
      ... (Detect other classes)
    }}

    TRANSLATION RULES (CRITICAL):
    1. Translate to **Traditional Chinese (繁體中文)** used in Taiwan/Hong Kong server.
    2. **Use Official Blizzard Terminology (暴雪官方譯名)**. 
       - e.g., "Critical Strike Chance" -> "爆擊機率" (NOT 關鍵打擊機會)
       - e.g., "Vulnerable" -> "易傷"
       - e.g., "Overpower" -> "壓制"
       - e.g., "Lucky Hit" -> "幸運觸發"
    3. **Legendary Aspects**: Must end with "威能" (e.g., "Aspect of Might" -> "力量之威能").
    4. **Tempering**: Keep it concise (e.g., "Chance to cast Bone Spear twice" -> "機率兩次骨矛").
    5. Return ONLY raw JSON string.
    
    DATA:
    {raw_text}
    """
    try:
        response = model.generate_content(prompt)
        json_str = response.text.strip()
        
        if json_str.startswith("```json"):
            json_str = json_str[7:-3]
            
        new_data = json.loads(json_str)
        
        # 存檔路徑
        file_path = os.path.join(os.path.dirname(__file__), "data", "affixes.json")
        
        # 讀舊檔並合併
        old_data = {}
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                old_data = json.load(f)
        
        # 簡單合併 (新的覆蓋舊的)
        for cls, content in new_data.items():
            if cls not in old_data:
                old_data[cls] = content
            else:
                # 如果該欄位有新資料就更新，保留其他欄位
                if "base" in content: old_data[cls]["base"] = content["base"]
                if "temper" in content: old_data[cls]["temper"] = content["temper"]
                if "aspects" in content: old_data[cls]["aspects"] = content["aspects"]

        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(old_data, f, ensure_ascii=False, indent=4)
            
        print(f"✅ 更新成功！檔案位置: {file_path}")

    except Exception as e:
        print(f"❌ AI 解析失敗: {e}")

if __name__ == "__main__":
    update_database()