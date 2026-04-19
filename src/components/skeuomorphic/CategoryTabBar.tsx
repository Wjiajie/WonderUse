'use client';

import React from 'react';
import { Settings, Compass, Shirt, Bookmark, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'all' | 'electronics' | 'software' | 'clothing' | 'books';

interface TabOption {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabOption[] = [
  { id: 'all', label: '全部', icon: <LayoutGrid size={16} strokeWidth={2} /> },
  { id: 'electronics', label: '电子', icon: <Settings size={16} strokeWidth={2} /> },
  { id: 'software', label: '软件', icon: <Compass size={16} strokeWidth={2} /> },
  { id: 'clothing', label: '服饰', icon: <Shirt size={16} strokeWidth={2} /> },
  { id: 'books', label: '书籍', icon: <Bookmark size={16} strokeWidth={2} /> },
];

interface CategoryTabBarProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export function CategoryTabBar({ activeTab, onTabChange }: CategoryTabBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300
              ${isActive 
                ? 'bg-gradient-to-b from-[#e6c27a] to-[#b8860b] text-[#3e2723] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),_0_2px_4px_rgba(0,0,0,0.2)] font-bold'
                : 'bg-[#f0e2c8]/60 text-[#5d4037]/70 hover:bg-[#f0e2c8] border border-[#5d4037]/10'
              }
            `}
          >
            {tab.icon}
            <span className="font-heading tracking-wider">{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="category-tab-active"
                className="absolute inset-0 rounded-full border border-[#ffecb3] opacity-30 mix-blend-overlay pointer-events-none"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
