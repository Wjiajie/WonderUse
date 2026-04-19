import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParchmentInput, ParchmentTextArea } from './ParchmentInput';
import CategoryPicker, { CategoryId } from './CategoryPicker';
import ImageUploader from './ImageUploader';
import { BrassButton } from './BrassButton';

export interface EditProductData {
  name: string;
  category: CategoryId;
  brand?: string;
  purchased_at?: string;
  description?: string;
  image_url?: string;
}

export interface EditProductSubmitData {
  name: string;
  category: CategoryId;
  brand?: string;
  purchased_at?: string;
  description?: string;
  imageFile?: File | null;
  // If the user removed the image completely (no file, no old url)
  isImageRemoved: boolean;
}

interface EditProductModalProps {
  isOpen: boolean;
  initialData: EditProductData | null;
  onClose: () => void;
  onSubmit: (data: EditProductSubmitData) => Promise<void>;
}

export function EditProductModal({ isOpen, initialData, onClose, onSubmit }: EditProductModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [brand, setBrand] = useState('');
  const [purchasedAt, setPurchasedAt] = useState('');
  const [description, setDescription] = useState('');
  
  // Can be a File, a string (old url), or null
  const [imageValue, setImageValue] = useState<File | string | null>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setStep(1);
      setName(initialData.name || '');
      setCategory(initialData.category);
      setBrand(initialData.brand || '');
      setPurchasedAt(initialData.purchased_at || '');
      setDescription(initialData.description || '');
      setImageValue(initialData.image_url || null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        alert('请为它起个名字吧');
        return;
      }
      if (!category) {
        alert('请选择一个分类');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handlePrev = () => {
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const isImageRemoved = imageValue === null;
      const imageFile = imageValue instanceof File ? imageValue : null;

      await onSubmit({
        name,
        category: category as CategoryId,
        brand,
        purchased_at: purchasedAt,
        description,
        imageFile,
        isImageRemoved
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('保存失败，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={!isSubmitting ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md texture-parchment rounded-xl shadow-2xl border-2 border-[#b8860b]/30 p-6 flex flex-col"
            style={{ minHeight: '480px' }}
          >
            <div className="flex justify-between items-center mb-6 border-b border-[#5d4037]/10 pb-4">
              <h2 className="font-heading text-xl font-bold text-[#3e2723]">修改珍爱之物</h2>
              <span className="font-handwriting text-[#b8860b] text-sm">第 {step} 步 / 共 3 步</span>
            </div>

            <div className="flex-1 overflow-y-auto mb-6">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#5d4037]/80">物品名称 *</label>
                    <ParchmentInput
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="例如: Sony 降噪耳机"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#5d4037]/80">分类 *</label>
                    <CategoryPicker value={category} onChange={setCategory} />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#5d4037]/80">品牌 (选填)</label>
                    <ParchmentInput
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      placeholder="例如: Sony"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#5d4037]/80">入手日期 (选填)</label>
                    <ParchmentInput
                      type="date"
                      value={purchasedAt}
                      onChange={e => setPurchasedAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#5d4037]/80">背后的故事 (选填)</label>
                    <ParchmentTextArea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="记录一下这件物品的来历或对你的意义..."
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#5d4037]/80">重留个影 (选填)</label>
                    <p className="text-xs text-[#5d4037]/60 mb-2">上传新照片将替换原有记录，也可以点右上角取消现有照片</p>
                    <ImageUploader 
                      value={imageValue} 
                      onChange={file => setImageValue(file)} 
                      onClear={() => setImageValue(null)}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#5d4037]/10">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-bold text-[#5d4037]/70 hover:text-[#5d4037] transition-colors"
                >
                  上一步
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-bold text-[#5d4037]/70 hover:text-[#5d4037] transition-colors"
                >
                  取消
                </button>
              )}

              {step < 3 ? (
                <BrassButton onClick={handleNext} className="w-32">
                  下一步
                </BrassButton>
              ) : (
                <BrassButton onClick={handleSubmit} disabled={isSubmitting} className="w-32 bg-[#2e7d32]">
                  {isSubmitting ? '保存中...' : '保存修改'}
                </BrassButton>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
