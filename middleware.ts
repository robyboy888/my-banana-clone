// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

// 固定的管理员用户名和密钥，用于验证 Basic Auth
const ADMIN_USERNAME = 'admin'; 
// 从环境变量中读取密码，确保您已在 .env.local 和 Vercel 中设置 ADMIN_SECRET_KEY
const SECRET_PASSWORD = process.env.ADMIN_SECRET_KEY;

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const adminPath = '/admin';
    
    // 1. 只处理管理员页面的请求
    if (url.pathname !== adminPath) {
        return NextResponse.next();
    }
    
    // 2. 检查秘密密钥是否已配置
    if (!SECRET_PASSWORD) {
        // 如果密码未设置，避免锁定管理员，但应该发出警告或重定向
        console.error('ADMIN_SECRET_KEY is not set in environment variables. Access denied.');
        // 重定向到主页，防止未配置时意外暴露管理区域
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. 获取并解析 Authorization Header
    const authHeader = request.headers.get('Authorization');

    // 检查是否存在 Authorization Header 或它是否以 'Basic ' 开头
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        // 如果没有认证信息，返回 401 响应，触发浏览器弹出登录框
        return new NextResponse('Authorization required', {
            status: 401,
            headers: {
                // 'WWW-Authenticate' 告诉浏览器使用 Basic Auth 机制，并提示用户输入凭证
                'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
            },
        });
    }

    // 4. 解码凭证 (Base64)
    // 移除 'Basic ' (6个字符)
    const encodedAuth = authHeader.substring(6); 
    
    // 使用 Buffer.from() 进行 Base64 解码
    // 注意：Buffer 是 Node.js 环境的一部分，在 Next.js Middleware 中可用
    const decodedAuth = Buffer.from(encodedAuth, 'base64').toString();
    const [username, password] = decodedAuth.split(':');

    // 5. 验证用户名和密码
    if (username === ADMIN_USERNAME && password === SECRET_PASSWORD) {
        // 验证成功，允许请求继续
        return NextResponse.next();
    }

    // 6. 验证失败，返回 401 重新弹出登录框
    return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
        },
    });
}

// 限制中间件只在特定路径下运行
// 💥 关键修正：必须使用字符串字面量，以便 Next.js 静态解析
export const config = {
    matcher: ['/admin'], 
};