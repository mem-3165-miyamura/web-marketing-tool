//components/EditPopUpForm.tsx
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePopUp } from "@lib/actions/popup";
import { FormState } from "@lib/types/popup";

export default function EditPopUpForm({ popup }: { popup: any }) {
  const router = useRouter();
  
  const [previewUrl, setPreviewUrl] = useState(popup.imageUrl);

  const [state, formAction, isPending] = useActionState(updatePopUp, {
    success: false,
    message: "",
  } as FormState);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/'); 
        router.refresh(); 
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]); // state.successを監視するように修正

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div className={`p-4 rounded-md text-sm font-bold animate-fade-in ${
          state.success 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {state.message}
          {state.success && " 2秒後に一覧画面に戻ります..."}
        </div>
      )}

      <input type="hidden" name="id" value={popup.id} />

      {/* キャンペーン名 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">キャンペーン名</label>
        <input 
          name="name" 
          defaultValue={popup.name} 
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
      </div>

      {/* タイトル */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">タイトル</label>
        <input 
          name="title" 
          defaultValue={popup.title} 
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* 説明 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">説明</label>
        <textarea 
          name="description" 
          rows={4}
          defaultValue={popup.description || ""} 
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* ボタン設定 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">ボタンテキスト</label>
          <input 
            name="buttonText" 
            defaultValue={popup.buttonText || ""} 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">ボタンリンク</label>
          <input 
            name="buttonLink" 
            defaultValue={popup.buttonLink || ""} 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* 画像プレビュー */}
      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <label className="text-sm font-semibold text-gray-700">画像変更</label>
        <input 
          type="file" 
          name="imageFile" 
          accept="image/*" 
          onChange={handleFileChange}
          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
        />
        {previewUrl && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">プレビュー:</p>
            <img src={previewUrl} alt="Preview" className="w-32 h-auto rounded border shadow-sm bg-white" />
          </div>
        )}
      </div>

      {/* 💡 ボタンエリア（保存とキャンセルを横並びに） */}
      <div className="flex gap-4 pt-6">
        <button 
          type="submit" 
          disabled={isPending}
          className={`flex-[2] text-white font-bold py-3 rounded-md transition duration-200 shadow-md ${
            isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
          }`}
        >
          {isPending ? '更新処理中...' : '更新内容を保存する'}
        </button>

        <button 
          type="button" 
          onClick={() => router.back()}
          disabled={isPending}
          className="flex-1 bg-white text-gray-600 font-semibold py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition active:scale-[0.98] disabled:opacity-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}