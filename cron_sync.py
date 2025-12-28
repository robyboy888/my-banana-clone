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
                print("没有更多数据。")
                break
                
            formatted_dict = {} # 使用字典进行页内去重
            
            for item in prompts:
                raw_tags = item.get("tags", [])
                
                # --- 标签处理逻辑 ---
                if isinstance(raw_tags, str):
                    try:
                        final_tags = json.loads(raw_tags)
                    except:
                        final_tags = [raw_tags]
                else:
                    final_tags = raw_tags if raw_tags is not None else []

                title = item.get("title", "").strip()
                if not title:
                    continue # 跳过没有标题的数据

                # --- 核心修复：按 title 去重 ---
                # 如果这一页里有重复的 title，后面的会覆盖前面的，保证传给数据库时 title 唯一
                formatted_dict[title] = {
                    "title": title,
                    "content": item.get("content", ""), 
                    "tags": final_tags, 
                    "original_image_url": item.get("thumbnailUrl"),
                    "source_x_account": item.get("sourceUrl"),
                    "source": "bananaprompts"
                }

            # 转换为列表
            final_batch = list(formatted_dict.values())

            # 执行 Upsert (基于 title)
            if final_batch:
                supabase.table("prompts").upsert(final_batch, on_conflict="title").execute()
            
            count = len(final_batch)
            total_synced += count
            print(f"成功导入 {count} 条。")
            
            has_more = data.get('pagination', {}).get('hasMore', False)
            current_page += 1
            time.sleep(5) # 稍微停顿，避免被源站封禁
            
        except Exception as e:
            print(f"\n❌ 同步出错: {e}")
            break

    print(f"✅ 任务结束！共处理数据: {total_synced} 条。")

if __name__ == "__main__":
    sync()