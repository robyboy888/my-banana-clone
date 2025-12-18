import os
import requests
import time
from supabase import create_client, Client

# --- 配置区 ---
API_URL = "https://bananaprompts.fun/api/prompts"
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# 安全限制：最多同步 50 页
MAX_PAGES = 50 

def sync():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ 错误：缺少环境变量 SUPABASE_URL 或 SUPABASE_KEY")
        return

    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"❌ Supabase 连接失败: {e}")
        return

    current_page = 1
    has_more = True
    total_synced = 0

    print("🚀 开始自动同步任务...")

    while has_more and current_page <= MAX_PAGES:
        try:
            print(f"第 {current_page} 页: 抓取中...", end=" ", flush=True)
            
            response = requests.get(
                API_URL, 
                params={'limit': 20, 'page': current_page}, 
                timeout=15
            )
            response.raise_for_status()
            
            data = response.json()
            prompts = data.get('data', [])
            
            if not prompts:
                print("没有更多数据。")
                break
                
            formatted_data = []
            for item in prompts:
                formatted_data.append({
                    "title": item.get("title", ""),
                    "content": item.get("content", ""), 
                    "tags": item.get("tags", []),
                    "original_image_url": item.get("thumbnailUrl"),
                    # --- 关键修改：改用你表里的字段名 source_x_account ---
                    "source_x_account": item.get("sourceUrl"),
                    "source": "bananaprompts"
                })

            # 执行 Upsert 操作
            supabase.table("prompts").upsert(formatted_data, on_conflict="title").execute()
            
            count = len(formatted_data)
            total_synced += count
            print(f"成功导入 {count} 条。")
            
            has_more = data.get('pagination', {}).get('hasMore', False)
            current_page += 1
            time.sleep(1.5)
            
        except Exception as e:
            print(f"\n❌ 同步出错: {e}")
            break

    print("-" * 30)
    print(f"✅ 任务结束！共处理数据: {total_synced} 条。")
    print("-" * 30)

if __name__ == "__main__":
    sync()