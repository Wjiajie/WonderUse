import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    image_url?: string;
    created_at: string;
  };
  onClick: () => void;
  index?: number;
}

export function ProductCard({ product, onClick, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      className="shelf-item-wrapper"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`查看物品：${product.name}`}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="shelf-item-image"
        />
      ) : (
        <div className="shelf-item-placeholder">
          {product.name.charAt(0)}
        </div>
      )}
      
      <div className="shelf-item-label">
        <span className="shelf-item-name">{product.name}</span>
      </div>
    </motion.div>
  );
}
