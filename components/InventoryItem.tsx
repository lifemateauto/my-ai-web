
import React from 'react';
import { Item } from '../types';
import { MapPin, Ruler, Layers, Trash2, ImageOff, Pencil } from 'lucide-react';

interface InventoryItemProps {
  item: Item;
  onDelete: (id: string) => void;
  onEdit: (item: Item) => void;
}

const InventoryItem: React.FC<InventoryItemProps> = ({ item, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 hover:border-indigo-200 transition-all duration-200 overflow-hidden group">
      <div className="flex flex-col p-5 sm:p-6 gap-4">
        {/* 上半部：照片與標題 */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
            {item.photo ? (
              <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <ImageOff className="w-8 h-8 text-slate-200" />
            )}
          </div>
          <div className="flex-grow min-w-0 pt-1">
            <h3 className="font-bold text-slate-800 text-xl sm:text-2xl leading-tight mb-2 break-words">
              {item.name}
            </h3>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wide">
              {item.category || '未分類'}
            </span>
          </div>
        </div>

        {/* 中部：尺寸與數量 (大幅強化數量顯示) */}
        <div className="flex items-center justify-between py-4 border-y border-slate-50 gap-4">
          <div className="flex flex-col gap-1 min-w-0 flex-grow">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Ruler className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">尺寸</span>
            </div>
            <span className="text-lg font-bold text-slate-700 truncate">
              {item.size || '-'}
            </span>
          </div>
          
          <div className="flex flex-col gap-0 items-end flex-shrink-0">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">數量</span>
            </div>
            <span className="text-4xl font-black text-indigo-600 whitespace-nowrap leading-none tabular-nums">
              x{item.quantity}
            </span>
          </div>
        </div>

        {/* 下半部：存放位置 (字體特大化) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">存放位置</span>
          </div>
          <span className="text-xl font-extrabold text-slate-800 leading-snug">
            {item.location || '-'}
          </span>
        </div>

        {/* 操作按鈕 */}
        <div className="flex gap-3 mt-2">
          <button 
            onClick={() => onEdit(item)}
            className="flex-1 py-4 flex justify-center items-center gap-2 text-slate-600 bg-slate-50 rounded-2xl font-bold active:scale-95 transition-all text-base"
          >
            <Pencil className="w-5 h-5" /> 編輯
          </button>
          <button 
            onClick={() => onDelete(item.id)}
            className="flex-1 py-4 flex justify-center items-center gap-2 text-red-500 bg-red-50/50 rounded-2xl font-bold active:scale-95 transition-all text-base"
          >
            <Trash2 className="w-5 h-5" /> 刪除
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryItem;
