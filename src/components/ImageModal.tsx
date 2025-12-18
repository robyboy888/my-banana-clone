"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, title }: ImageModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={onClose}
        >
          {/* 关闭按钮 */}
          <button className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X size={32} />
          </button>

          {/* 图片容器 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} // 防止点击图片时关闭
          >
            <img
              src={imageUrl}
              alt={title}
              className="object-contain w-full h-full rounded-lg shadow-2xl"
            />
            
            {/* 底部信息栏 */}
            <div className="absolute bottom-[-40px] left-0 right-0 flex justify-between items-center text-white">
              <span className="text-sm font-medium">{title}</span>
              <a 
                href={imageUrl} 
                target="_blank" 
                download 
                className="flex items-center gap-1 text-sm hover:underline"
              >
                <Download size={16} /> 查看原图
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}