import os
import requests
import time
import json
from supabase import create_client, Client

# --- 配置区 ---
API_URL = "https://bananaprompts.fun/api/prompts"
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

MAX_PAGES = 50 

def sync():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ 错误：缺少环境变量")
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
            response = requests.get(API_URL, params={'limit': 20, 'page': current_page}, timeout=15)
            response.raise_for_status()
            data = response.json()
            prompts = data.get('data', [])
            
            if not prompts:
                break
                
            formatted_data = []
            for item in prompts:
                raw_tags = item.get("tags", [])
                
                # --- 核心修复：强制数组化处理 ---
                # 如果拿到的已经是列表就直接用，如果是字符串则尝试解析
                if isinstance(raw_tags, str):
                    try:
                        final_tags = json.loads(raw_tags)
                    except:
                        final_tags = [raw_tags] # 万一解析失败，转成单元素列表
                else:
                    final_tags = raw_tags if raw_tags is not None else []

                formatted_data.append({
                    "title": item.get("title", ""),
                    "content": item.get("content", ""), 
                    "tags": final_tags,  # 确保这里是 Python List
                    "original_image_url": item.get("thumbnailUrl"),
                    "source_x_account": item.get("sourceUrl"),
                    "source": "bananaprompts"
                })

            # 执行 Upsert
            supabase.table("prompts").upsert(formatted_data, on_conflict="title").execute()
            
            count = len(formatted_data)
            total_synced += count
            print(f"成功导入 {count} 条。")
            
            has_more = data.get('pagination', {}).get('hasMore', False)
            current_page += 1
            time.sleep(1)
            
        except Exception as e:
            print(f"\n❌ 同步出错: {e}")
            break

    print(f"✅ 任务结束！共处理数据: {total_synced} 条。")

if __name__ == "__main__":
    sync()