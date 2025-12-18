import os
import requests
import time
from supabase import create_client, Client

# --- 从环境变量读取配置 (更安全) ---
API_URL = "https://bananaprompts.fun/api/prompts"
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def sync():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ 错误：缺少环境变量 SUPABASE_URL 或 SUPABASE_KEY")
        return

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    current_page = 1
    has_more = True
    total_synced = 0

    print("🚀 开始自动同步任务...")

    while has_more:
        try:
            print(f"正在抓取第 {current_page} 页...")
            response = requests.get(API_URL, params={'limit': 20, 'page': current_page}, timeout=15)
            data = response.json()
            prompts = data.get('data', [])
            
            if not prompts:
                break
                
            # 格式化数据以符合你的表结构
            formatted_data = []
            for item in prompts:
                formatted_data.append({
                    "title": item.get("title", ""),
                    "content": item.get("content", ""), 
                    "tags": item.get("tags", []),
                    "original_image_url": item.get("thumbnailUrl"),
                    "source_link": item.get("sourceUrl"),
                    "source": "bananaprompts"
                })

            # 使用 Upsert 模式，title 冲突则跳过或更新
            # 注意：确保你的数据库 title 字段有唯一约束（Unique Constraint）
            supabase.table("prompts").upsert(formatted_data, on_conflict="title").execute()
            
            total_synced += len(formatted_data)
            has_more = data.get('pagination', {}).get('hasMore', False)
            current_page += 1
            time.sleep(1) # 适当延迟，保护目标网站 API
            
        except Exception as e:
            print(f"❌ 同步中断: {e}")
            break

    print(f"✅ 同步完成！共处理 {total_synced} 条数据。")

if __name__ == "__main__":
    sync()