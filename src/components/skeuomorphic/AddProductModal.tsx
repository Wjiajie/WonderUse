import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParchmentInput, ParchmentTextArea } from './ParchmentInput';
import CategoryPicker, { CategoryId } from './CategoryPicker';
import ImageUploader from './ImageUploader';
import { BrassButton } from './BrassButton';
import { LeatherCard } from './LeatherCard';

const MagicalStepper = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
  return (
    <div className="flex items-center justify-center space-x-6">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isPast = step < currentStep;
        return (
          <React.Fragment key={step}>
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={false}
                animate={{
                  boxShadow: isActive ? '0 0 15px rgba(218,165,32,0.8)' : 'none',
                  borderColor: isActive || isPast ? '#DAA520' : 'rgba(240,226,200,0.2)',
                  backgroundColor: isActive ? '#DAA520' : isPast ? '#B8860B' : 'transparent',
                }}
                className={`w-3 h-3 rounded-full border-2 z-10 ${isActive ? 'ring-4 ring-[#DAA520]/20 ring-offset-2 ring-offset-[#2C1A12]' : ''}`}
              />
            </div>
            {step < totalSteps && (
              <div className="w-16 h-[2px] bg-[rgba(240,226,200,0.1)] relative">
                <motion.div 
                  initial={false}
                  animate={{ width: isPast ? '100%' : '0%' }}
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#B8860B] to-[#DAA520]"
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: CategoryId;
    brand?: string;
    purchased_at?: string;
    description?: string;
    imageFile?: File | null;
  }) => Promise<void>;
}

export function AddProductModal({ isOpen, onClose, onSubmit }: AddProductModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [brand, setBrand] = useState('');
  const [purchasedAt, setPurchasedAt] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setStep(1);
      setName('');
      setCategory(null);
      setBrand('');
      setPurchasedAt('');
      setDescription('');
      setImageFile(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

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
      await onSubmit({
        name,
        category: category as CategoryId,
        brand,
        purchased_at: purchasedAt,
        description,
        imageFile
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(`保存失败: ${err.message || '请稍后再试'}`);
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
            className="relative w-full max-w-2xl flex flex-col max-h-[90vh]"
            style={{ minHeight: 'min(560px, 90vh)' }}
          >
            <LeatherCard className="flex flex-col flex-1 p-6 sm:p-8 relative overflow-hidden w-full shadow-2xl border border-[rgba(184,134,11,0.3)]">
            <div className="flex flex-col items-center justify-center mb-8 border-b border-[rgba(218,165,32,0.2)] pb-6 relative">
              <h2 className="font-heading text-2xl font-bold text-[#F5C842] mb-6 tracking-widest" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(218,165,32,0.3)' }}>封入新珍爱之物</h2>
              <MagicalStepper currentStep={step} totalSteps={3} />
            </div>

            <div className="flex-1 overflow-y-auto mb-6">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <label className="block text-xs font-heading tracking-widest uppercase text-[rgba(218,165,32,0.8)]">物品名称</label>
                    <ParchmentInput
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="例如: Sony 降噪耳机"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs font-heading tracking-widest uppercase text-[rgba(218,165,32,0.8)]">档案分类</label>
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
                  <div className="space-y-3">
                    <label className="block text-xs font-heading tracking-widest uppercase text-[rgba(218,165,32,0.8)]">品牌印记 (选填)</label>
                    <ParchmentInput
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      placeholder="例如: Sony"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs font-heading tracking-widest uppercase text-[rgba(218,165,32,0.8)]">入手纪元 (选填)</label>
                    <ParchmentInput
                      type="date"
                      value={purchasedAt}
                      onChange={e => setPurchasedAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs font-heading tracking-widest uppercase text-[rgba(218,165,32,0.8)]">背后的故事 (选填)</label>
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
                  <div className="space-y-3">
                    <label className="block text-xs font-heading tracking-widest uppercase text-[rgba(218,165,32,0.8)]">留存影像 (选填)</label>
                    <p className="text-xs text-[rgba(240,226,200,0.5)] font-handwriting italic mb-4">"给它拍张照片，让回忆永远鲜活"</p>
                    <ImageUploader value={imageFile} onChange={setImageFile} />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="modal-footer">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                  className="btn-ghost"
                >
                  回溯上一卷
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="btn-ghost"
                >
                  放弃封入
                </button>
              )}

              {step < 3 ? (
                <BrassButton onClick={handleNext} className="min-w-[140px] shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  揭开下一卷
                </BrassButton>
              ) : (
                <BrassButton onClick={handleSubmit} disabled={isSubmitting} className="min-w-[140px] shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  {isSubmitting ? '正在施加封印...' : '完成铭刻'}
                </BrassButton>
              )}
            </div>
            </LeatherCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
