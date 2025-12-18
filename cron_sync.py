import os
import requests
import time
from supabase import create_client, Client

# --- 配置区 ---
# 目标网站 API 地址
API_URL = "https://bananaprompts.fun/api/prompts"
# 从环境变量读取 Supabase 配置（确保已在 GitHub Secrets 中设置）
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# 安全限制：防止死循环，最多同步 50 页（约 1000 条数据）
MAX_PAGES = 50 

def sync():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ 错误：缺少环境变量 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY")
        return

    # 初始化 Supabase 客户端
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"❌ Supabase 连接初始化失败: {e}")
        return

    current_page = 1
    has_more = True
    total_synced = 0

    print("🚀 开始自动同步任务...")
    print(f"📡 目标地址: {API_URL}")

    while has_more and current_page <= MAX_PAGES:
        try:
            print(f"第 {current_page} 页: 正在抓取数据...", end=" ", flush=True)
            
            # 发起请求，设置 15 秒超时防止卡死
            response = requests.get(
                API_URL, 
                params={'limit': 20, 'page': current_page}, 
                timeout=15
            )
            response.raise_for_status() # 如果状态码不是 200 则抛出异常
            
            data = response.json()
            prompts = data.get('data', [])
            
            if not prompts:
                print("未发现更多数据。")
                break
                
            # 格式化数据，确保与数据库字段一一对应
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

            # 执行 Upsert 操作：根据 title 冲突进行更新或插入
            # 注意：请确保数据库中 prompts 表的 title 字段设置了 UNIQUE 约束
            supabase.table("prompts").upsert(formatted_data, on_conflict="title").execute()
            
            count = len(formatted_data)
            total_synced += count
            print(f"成功导入 {count} 条记录。")
            
            # 更新翻页逻辑
            pagination = data.get('pagination', {})
            has_more = pagination.get('hasMore', False)
            current_page += 1
            
            # 适当休眠 1.5 秒，避免请求过快被目标服务器封禁
            time.sleep(1.5)
            
        except requests.exceptions.Timeout:
            print(f"\n❌ 第 {current_page} 页请求超时，正在重试...")
            time.sleep(5)
            continue
        except Exception as e:
            print(f"\n❌ 第 {current_page} 页同步发生致命错误: {e}")
            break

    if current_page > MAX_PAGES:
        print(f"⚠️ 警告：已达到预设的最大同步页数 ({MAX_PAGES})，任务自动终止。")

    print("-" * 30)
    print(f"✅ 任务结束！本次共成功同步数据: {total_synced} 条。")
    print("-" * 30)

if __name__ == "__main__":
    sync()