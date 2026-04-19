import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GlassGauge } from './GlassGauge';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    image_url?: string;
    created_at: string;
    // mock love value or we can pass it if it exists in db
  };
  onClick: () => void;
  index?: number;
}

export function ProductCard({ product, onClick, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.05 }}
      onClick={onClick}
      className="relative flex flex-col bg-gradient-to-b from-[#fdfbf7] to-[#f0e2c8] border border-[#5d4037]/20 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      whileHover={{
        y: -4,
        boxShadow: '0 8px 20px rgba(62,39,35,0.15), 0 16px 32px rgba(62,39,35,0.05)',
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
      aria-label={`查看物品：${product.name}`}
    >
      {/* 物品卡片顶部光泽 */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent rounded-t-xl pointer-events-none z-10" />

      {/* 图片/分类占位 */}
      <div className="h-[80px] w-full relative bg-gradient-to-br from-[#e8c9a0]/40 to-[#dcc6a0]/40 flex items-center justify-center border-b border-[#5d4037]/10">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#dcc6a0] to-[#b8860b]/60 flex items-center justify-center shadow-inner text-[#fff8e7] font-heading text-xl font-bold">
            {product.name.charAt(0)}
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="font-heading text-sm font-bold text-[#3e2723] line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        <span className="text-[10px] text-[#5d4037]/60 font-handwriting">
          {product.category || '未分类'}
        </span>

        <div className="mt-auto pt-1 scale-90 origin-left opacity-90">
          <GlassGauge value={10} max={100} />
        </div>
      </div>
    </motion.div>
  );
}
