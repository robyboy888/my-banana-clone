// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

// 管理员页面的路径
const ADMIN_PATH = '/admin';

// 固定的管理员用户名和密钥
const ADMIN_USERNAME = 'admin'; // 设定一个固定用户名
const SECRET_PASSWORD = process.env.ADMIN_SECRET_KEY;

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    
    // 1. 只处理管理员页面的请求
    if (url.pathname !== ADMIN_PATH) {
        return NextResponse.next();
    }
    
    // 2. 检查秘密密钥是否已配置
    if (!SECRET_PASSWORD) {
        console.error('ADMIN_SECRET_KEY is not set in environment variables.');
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. 获取并解析 Authorization Header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        // 如果没有认证信息，返回 401 响应，触发浏览器弹窗
        return new NextResponse('Authorization required', {
            status: 401,
            headers: {
                // 告诉浏览器使用 Basic Auth 机制，并提示用户输入凭证
                'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
            },
        });
    }

    // 4. 解码凭证 (Base64)
    const encodedAuth = authHeader.substring(6); // 移除 'Basic '
    const decodedAuth = Buffer.from(encodedAuth, 'base64').toString();
    const [username, password] = decodedAuth.split(':');

    // 5. 验证用户名和密码
    if (username === ADMIN_USERNAME && password === SECRET_PASSWORD) {
        // 验证成功，允许访问
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
export const config = {
    matcher: [ADMIN_PATH],
};