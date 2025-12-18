
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Package, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { Item } from '../types';
import { analyzeItemImage } from '../services/geminiService';

interface AddItemModalProps {
  onClose: () => void;
  // 修改 onSave 邏輯：傳回資料以及（如果是編輯的話）原始 ID
  onSave: (item: Omit<Item, 'id' | 'createdAt'>, id?: string) => void;
  initialData?: Item;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onSave, initialData }) => {
  // 使用 Ref 鎖定模式，確保在 Modal 開啟期間「編輯模式」不會因為外部狀態改變而跳掉
  const isEditMode = useRef(!!initialData);
  const [photo, setPhoto] = useState<string | null>(initialData?.photo || null);
  const [name, setName] = useState(initialData?.name || '');
  const [size, setSize] = useState(initialData?.size || '');
  const [quantity, setQuantity] = useState(initialData?.quantity || 1);
  const [location, setLocation] = useState(initialData?.location || '');
  const [category, setCategory] = useState(initialData?.category || '未分類');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIAnalysis = async () => {
    if (!photo) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeItemImage(photo);
      setName(result.name);
      setSize(result.size);
      setCategory(result.category);
      setLocation(result.suggestedLocation);
    } catch (error) {
      alert("AI 分析失敗，請手動輸入。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // 將資料傳回，如果是編輯模式，則帶上原始 ID
    onSave({
      name: name.trim(),
      photo: photo || '',
      size,
      quantity,
      location,
      category,
    }, initialData?.id);
    
    // 注意：onClose 會由父元件在完成儲存後或直接在此處調用
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white sm:bg-slate-900/60 sm:backdrop-blur-md z-[100] flex items-end sm:items-center justify-center overflow-hidden">
      <div className="bg-white w-full sm:max-w-xl h-screen sm:h-auto sm:max-h-[90vh] sm:rounded-[40px] flex flex-col relative animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {isEditMode.current ? '編輯項目' : '新增物品'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-6 py-6 pb-48 sm:pb-10">
          <div className="space-y-6">
            
            {/* 照片區 */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div 
                className={`relative w-16 h-16 flex-shrink-0 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                  photo ? 'border-indigo-400' : 'border-slate-300 bg-white'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {photo ? (
                  <img src={photo} alt="預覽" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="flex-grow">
                <div className="text-xs font-bold text-slate-500 mb-2">物品照片 (選填)</div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[11px] font-bold bg-white border border-slate-200 px-3 py-2 rounded-lg text-slate-600 active:bg-slate-50 transition-all">
                    {photo ? '換一張' : '上傳照片'}
                  </button>
                  {photo && (
                    <button type="button" onClick={handleAIAnalysis} disabled={isAnalyzing} className="text-[11px] font-bold bg-indigo-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 active:scale-95 disabled:opacity-50">
                      {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI 填表
                    </button>
                  )}
                </div>
              </div>
              {photo && (
                <button type="button" onClick={() => setPhoto(null)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
            </div>

            {/* 輸入欄位 */}
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">物品名稱 *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white focus:border-indigo-500 outline-none text-base font-bold" placeholder="請輸入物品名稱" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">分類</label>
                  <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white outline-none text-base" placeholder="未分類" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">數量</label>
                  <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white outline-none text-base font-bold text-indigo-600" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">尺寸規格</label>
                <input type="text" value={size} onChange={e => setSize(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white outline-none text-base" placeholder="例如：241x45x87" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">存放位置</label>
                <textarea value={location} onChange={e => setLocation(e.target.value)} rows={2} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white outline-none text-base resize-none font-bold" placeholder="輸入存放位置" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="fixed sm:absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 flex gap-3 z-[110] pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-15px_40px_rgba(0,0,0,0.05)]">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-500 active:bg-slate-50 transition-colors text-base"
          >
            取消
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting || isAnalyzing}
            className="flex-[2] bg-indigo-600 active:bg-indigo-700 disabled:opacity-50 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-base"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditMode.current ? '儲存修改' : '儲存物品')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
