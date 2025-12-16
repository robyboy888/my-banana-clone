import type { NextConfig } from "next";


/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 其他配置 ...

  images: {
    // 💥 关键配置：在这里添加您的图片主机名
    remotePatterns: [
      {
        protocol: 'https',
        // 假设您的图片托管在 bananaprompts.fun 的域名下
        hostname: 'bananaprompts.fun', 
        port: '',
        pathname: '/**', // 允许任何路径
      },
      // 如果图片实际托管在其他 CDN 域名，请添加更多对象
      // 例如： { hostname: 'cdn.myimagehost.com' }
    ],
    // 如果您使用 Next.js 12 或更早版本，配置可能是：
    // domains: ['bananaprompts.fun'],
  },
};

module.exports = nextConfig;