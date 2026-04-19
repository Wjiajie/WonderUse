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
  { id: 'all', label: '全部', icon: <LayoutGrid className="tab-icon" /> },
  { id: 'electronics', label: '电子', icon: <Settings className="tab-icon" /> },
  { id: 'software', label: '软件', icon: <Compass className="tab-icon" /> },
  { id: 'clothing', label: '服饰', icon: <Shirt className="tab-icon" /> },
  { id: 'books', label: '书籍', icon: <Bookmark className="tab-icon" /> },
];

interface CategoryTabBarProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export function CategoryTabBar({ activeTab, onTabChange }: CategoryTabBarProps) {
  return (
    <div className="shelf-tab-bar">
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`shelf-tab ${isActive ? 'active' : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
