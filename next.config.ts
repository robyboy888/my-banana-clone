/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 保持其他配置不变 ...

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // 💥 关键修改点：准确地将 CDN 域名添加到白名单
        hostname: 'cdn.bananaprompts.fun', 
        port: '',
        pathname: '/**',
      },
      // 如果您还有其他图片来源，可以继续添加
    ],
  },
};

module.exports = nextConfig;