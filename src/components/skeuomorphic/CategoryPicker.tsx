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
  { id: 'electronics', label: '电子产品', icon: <Settings size={22} strokeWidth={1.5} />, description: '手机、耳机、相机...' },
  { id: 'software', label: '软件服务', icon: <Compass size={22} strokeWidth={1.5} />, description: '订阅软件、App...' },
  { id: 'clothing', label: '服饰', icon: <Shirt size={22} strokeWidth={1.5} />, description: '衣服、鞋子、配饰...' },
  { id: 'books', label: '书籍', icon: <Bookmark size={22} strokeWidth={1.5} />, description: '纸质书、课程...' },
];

interface CategoryPickerProps {
  value: CategoryId | null;
  onChange: (value: CategoryId) => void;
}

export default function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="category-picker-grid">
      {CATEGORIES.map((cat) => {
        const isSelected = value === cat.id;
        return (
          <motion.button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            whileTap={{ scale: 0.96 }}
            className={`category-btn ${isSelected ? 'selected' : 'unselected'}`}
          >
            {/* Metal Icon Badge */}
            <div className="category-icon-badge">
              {cat.icon}
            </div>
            
            {/* Text content */}
            <div className="category-text-container">
              <span className="category-label">
                {cat.label}
              </span>
              <span className="category-desc">
                {cat.description}
              </span>
            </div>

            {/* Selected indicator (glowing rivet) */}
            {isSelected && (
              <motion.div 
                layoutId="category-rivet"
                className="category-rivet" 
              />
            )}
            
            {/* Ambient Active Glow */}
            {isSelected && (
              <motion.div
                layoutId="category-active-glow"
                className="category-active-glow"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
