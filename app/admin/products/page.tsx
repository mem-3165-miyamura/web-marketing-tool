"use client";
import { useState, useEffect } from "react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    stock: ""
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setForm({ name: "", description: "", price: "", imageUrl: "", category: "", stock: "" });
        fetchProducts();
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">📦 商品マスター管理 (Headless CMS)</h1>
      </div>
      
      {/* 登録フォーム */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-12">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">新規商品登録</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">商品名</label>
            <input 
              className="w-full border-b-2 border-gray-100 p-2 outline-none focus:border-blue-500 transition-colors" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              placeholder="例: 高機能マウンテンパーカー"
              required 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">商品詳細説明</label>
            <textarea 
              className="w-full border-2 border-gray-50 p-3 rounded-xl outline-none focus:border-blue-500 transition-colors h-24" 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="商品の特徴を入力してください"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">価格 (円)</label>
            <input 
              type="number" 
              className="w-full border-b-2 border-gray-100 p-2 outline-none focus:border-blue-500" 
              value={form.price} 
              onChange={e => setForm({...form, price: e.target.value})} 
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">カテゴリー</label>
            <input 
              className="w-full border-b-2 border-gray-100 p-2 outline-none focus:border-blue-500" 
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})} 
              placeholder="例: アウター"
              required
            />
          </div>
          <div className="col-span-2">
            <button type="submit" className="bg-blue-600 text-white w-full py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              マスターに登録する
            </button>
          </div>
        </div>
      </form>

      {/* 一覧表示 */}
      <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">登録済み商品一覧</h2>
      {loading ? (
        <p className="text-center py-12 text-gray-400 animate-pulse">読み込み中...</p>
      ) : (
        <div className="grid gap-4">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 text-[10px] font-bold">IMAGE</div>
                <div>
                  <p className="font-bold text-gray-800">{p.name}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    {p.category} / ¥{p.price.toLocaleString()} / 在庫: {p.stock}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${p.isPublished ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {p.isPublished ? "Live" : "Draft"}
                </span>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-center py-12 text-gray-300 italic">登録されている商品はありません</p>}
        </div>
      )}
    </div>
  );
}