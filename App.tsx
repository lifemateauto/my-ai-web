
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Search, Package, Download, Upload } from 'lucide-react';
import { Item } from './types';
import InventoryItem from './components/InventoryItem';
import AddItemModal from './components/AddItemModal';
import * as XLSX from 'xlsx';

const LOCAL_STORAGE_KEY = "inventory_local_data";

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'quantity'>('newest');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalStock = useMemo(() => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0), [items]);

  const saveToLocal = (data: Item[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  const loadFromLocal = () => {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsedData = localData ? JSON.parse(localData) : [];
    setItems(parsedData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadFromLocal();
  }, []);

  const handleExport = () => {
    if (items.length === 0) {
      alert("清單是空的，無法匯出。");
      return;
    }
    const exportData = items.map(item => ({
      '名稱': item.name,
      '尺寸': item.size,
      '數量': item.quantity,
      '存放位置': item.location,
      '分類': item.category,
      '照片數據': item.photo,
      '建立時間': new Date(item.createdAt).toLocaleString(),
      '系統ID': item.id
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "物品清單");
    XLSX.writeFile(workbook, `物品清單_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        if (rawData.length > 0) {
          const validatedData: Item[] = rawData.map(row => ({
            id: String(row['系統ID'] || Math.random().toString(36).substring(2, 11)),
            name: String(row['名稱'] || '未命名物品'),
            size: String(row['尺寸'] || ''),
            quantity: Number(row['數量']) || 1,
            location: String(row['存放位置'] || ''),
            category: String(row['分類'] || '未分類'),
            photo: String(row['照片數據'] || ''),
            createdAt: row['建立時間'] ? new Date(row['建立時間']).getTime() : Date.now(),
          }));
          const updatedItems = [...validatedData, ...items];
          setItems(updatedItems);
          saveToLocal(updatedItems);
          alert(`成功匯入 ${validatedData.length} 筆物品！`);
        } else {
          alert("Excel 檔案中沒有資料。");
        }
      } catch (err) {
        alert("匯入失敗，請確認格式。");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  // 統一的儲存處理函數
  const handleSaveItem = (itemData: Omit<Item, 'id' | 'createdAt'>, id?: string) => {
    let updatedItems: Item[];

    if (id) {
      // 編輯模式：更新現有項目
      updatedItems = items.map(item => 
        item.id === id ? { ...item, ...itemData } : item
      );
    } else {
      // 新增模式：建立新項目
      const newItem: Item = {
        ...itemData,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: Date.now(),
      };
      updatedItems = [newItem, ...items];
    }

    setItems(updatedItems);
    saveToLocal(updatedItems);
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('確定要刪除這項物品嗎？')) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      saveToLocal(updatedItems);
    }
  };

  const handleOpenEdit = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name, 'zh-TW');
        case 'quantity': return (Number(b.quantity) || 0) - (Number(a.quantity) || 0);
        case 'newest': default: return b.createdAt - a.createdAt;
      }
    });
    return result;
  }, [items, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-60 sm:pb-40 relative">
      <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xlsx, .xls" className="hidden" />

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-indigo-100">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight truncate">物品清單</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <button onClick={handleExport} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 text-sm font-bold">
                  <Upload className="w-4 h-4" /> 匯出
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 text-sm font-bold">
                  <Download className="w-4 h-4" /> 匯入
                </button>
              </div>

              <button 
                onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" /> 新增物品
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-8">
        <div className="flex sm:hidden gap-2 mb-6">
           <button onClick={handleExport} className="flex-1 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold flex items-center justify-center gap-2 text-sm">
            <Upload className="w-4 h-4" /> 匯出 Excel
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold flex items-center justify-center gap-2 text-sm">
            <Download className="w-4 h-4" /> 匯入 Excel
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜尋名稱、位置..." 
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-100 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm text-base"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar max-w-full">
            {(['newest', 'name', 'quantity'] as const).map((key) => (
              <button 
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${sortBy === key ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {key === 'newest' ? '最新' : key === 'name' ? '名稱' : '數量'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-40 flex justify-center text-slate-400 font-bold">載入中...</div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedItems.length > 0 ? (
              filteredAndSortedItems.map(item => (
                <InventoryItem key={item.id} item={item} onDelete={handleDeleteItem} onEdit={handleOpenEdit} />
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200 px-8">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                  <Package className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">目前沒有物品</h3>
                <p className="text-slate-400 mt-2 mb-10 max-w-sm">
                  {searchQuery ? "找不到相關物品。" : "點擊右下角「＋」按鈕開始新增！"}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                  >
                    開始新增
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <button 
        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
        className="sm:hidden fixed right-6 bottom-32 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform border-4 border-white"
        aria-label="新增物品"
      >
        <Plus className="w-8 h-8" />
      </button>

      <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bg-slate-900/95 backdrop-blur-xl text-white px-6 sm:px-16 py-3 sm:py-4 rounded-[32px] shadow-2xl flex items-center justify-center gap-8 sm:gap-20 z-30 border border-white/10">
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">品項</span>
          <div className="flex items-baseline gap-1">
             <span className="text-lg sm:text-2xl font-black text-indigo-300">{items.length}</span>
             <span className="text-[10px] font-bold opacity-50">項</span>
          </div>
        </div>
        <div className="w-px h-8 bg-white/10"></div>
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">庫存量</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-2xl font-black text-indigo-300">{totalStock}</span>
            <span className="text-[10px] font-bold opacity-50">件</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddItemModal 
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
          onSave={handleSaveItem}
          initialData={editingItem || undefined}
        />
      )}
    </div>
  );
};

export default App;
