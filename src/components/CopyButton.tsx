// components/CopyButton.tsx
'use client'; // 💥 关键：这行代码告诉 Next.js 这是一个客户端组件

import React from 'react';

// 定义组件接收的 props
interface CopyButtonProps {
    textToCopy: string; // 要复制的文本内容
    label: string;      // 按钮上显示的文字
    className: string;  // 按钮的 Tailwind CSS 类
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, label, className }) => {
    
    // 复制逻辑函数
    const handleCopy = () => {
        if (textToCopy && navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // 可以在这里添加一个小的提示，例如“已复制！”
                    alert(`${label} 已成功复制到剪贴板！`); 
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    alert('复制失败，请检查浏览器权限。');
                });
        } else {
            alert('当前浏览器不支持自动复制。');
        }
    };

    return (
        <button 
            className={className} 
            onClick={handleCopy} // 绑定点击事件
        >
            {label}
        </button>
    );
};

export default CopyButton;