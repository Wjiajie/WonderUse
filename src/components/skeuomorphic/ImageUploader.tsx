'use client';

import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  value?: File | string | null;
  onChange: (file: File | null) => void;
  onClear?: () => void;
}

export default function ImageUploader({ value, onChange, onClear }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = React.useMemo(() => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return URL.createObjectURL(value);
  }, [value]);

  // Clean up object URL to avoid memory leaks
  React.useEffect(() => {
    return () => {
      if (previewUrl && typeof value !== 'string') {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, value]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onChange(file);
      } else {
        alert('请上传图片文件 (JPEG/PNG/WEBP)');
      }
    }
  }, [onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  }, [onChange]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (onClear) onClear();
  };

  return (
    <div
      className={`
        relative w-full h-[160px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300
        ${isDragging ? 'border-solid bg-[#f0e2c8]/80' : 'border-dashed bg-[#f0e2c8]/40 hover:border-solid hover:bg-[#f0e2c8]/60'}
        ${previewUrl ? 'border-none' : 'border-2 border-[#b8860b]/60'}
        texture-parchment
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        title=""
      />

      {previewUrl ? (
        <div className="relative w-full h-full">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-[#f0e2c8]/90 text-[#5d4037] flex items-center justify-center border border-[#b8860b] shadow-md hover:bg-[#ffecb3] transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#5d4037]/70 pointer-events-none">
          <motion.div
            animate={{ scale: isDragging ? 1.1 : 1, rotate: isDragging ? 5 : 0 }}
            className="mb-2 text-[#b8860b]"
          >
            <Camera size={32} strokeWidth={1.5} />
          </motion.div>
          <span className="font-heading tracking-wider font-bold">拖拽照片到此处</span>
          <span className="text-xs opacity-70 mt-1">或点击选择照片 (最大 5MB)</span>
        </div>
      )}
    </div>
  );
}
