'use client';

import React from 'react';
import { Settings, Compass, Shirt, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

export type CategoryId = 'electronics' | 'software' | 'clothing' | 'books';

interface CategoryOption {
  id: CategoryId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'electronics', label: '电子产品', icon: <Settings size={24} strokeWidth={1.5} />, description: '手机、耳机、相机...' },
  { id: 'software', label: '软件服务', icon: <Compass size={24} strokeWidth={1.5} />, description: '订阅软件、App...' },
  { id: 'clothing', label: '服饰', icon: <Shirt size={24} strokeWidth={1.5} />, description: '衣服、鞋子、配饰...' },
  { id: 'books', label: '书籍', icon: <Bookmark size={24} strokeWidth={1.5} />, description: '纸质书、课程...' },
];

interface CategoryPickerProps {
  value: CategoryId | null;
  onChange: (value: CategoryId) => void;
}

export default function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CATEGORIES.map((cat) => {
        const isSelected = value === cat.id;
        return (
          <motion.button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            whileTap={{ scale: 0.98 }}
            className={`
              relative flex flex-col items-center justify-center p-4 text-center rounded-lg transition-all duration-300
              ${isSelected 
                ? 'bg-gradient-to-b from-[#e6c27a] to-[#b8860b] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),_0_2px_4px_rgba(0,0,0,0.2)] border-2 border-[#b8860b] text-[#3e2723]' 
                : 'bg-[#f0e2c8]/50 border-2 border-dashed border-[#5d4037]/30 text-[#5d4037]/70 hover:border-[#5d4037]/50 hover:bg-[#f0e2c8]/80'
              }
            `}
          >
            <div className={`mb-2 ${isSelected ? 'text-[#3e2723]' : 'text-[#b8860b]'}`}>
              {cat.icon}
            </div>
            <span className="font-heading font-bold text-sm tracking-widest">{cat.label}</span>
            <span className={`text-[10px] mt-1 ${isSelected ? 'text-[#3e2723]/80' : 'text-[#5d4037]/50'}`}>
              {cat.description}
            </span>
            
            {/* Active Glow */}
            {isSelected && (
              <motion.div
                layoutId="category-active"
                className="absolute inset-0 rounded-lg pointer-events-none border-2 border-[#ffecb3] opacity-30 mix-blend-overlay"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
