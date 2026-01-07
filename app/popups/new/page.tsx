//app/popups/new/page.tsx
"use client";

import { useState } from "react";
import { createPopUp } from "@lib/actions/popup";

export default function NewPopUpPage() {
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, pattern: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (pattern === 'A') setPreviewA(url);
      else setPreviewB(url);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>新規ポップアップ作成</h1>

      <form action={createPopUp} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* セクション1: 基本管理情報 */}
        <section style={sectionBoxStyle}>
          <h2 style={sectionTitleStyle}>管理設定</h2>
          <label style={labelStyle}>
            ポップアップ管理名
            <input name="name" type="text" required style={inputStyle} placeholder="例：2025年夏季キャンペーン" />
          </label>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* セクション2: パターンA (基本) */}
          <section style={sectionBoxStyle}>
            <h2 style={{ ...sectionTitleStyle, borderLeftColor: '#0070f3' }}>パターンA (基本)</h2>
            
            <label style={labelStyle}>
              タイトル
              <input name="title" type="text" required style={inputStyle} placeholder="今だけ10%OFF！" />
            </label>

            <label style={{ ...labelStyle, marginTop: '15px' }}>
              画像
              <input 
                name="imageFile" 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageChange(e, 'A')}
                style={fileInputStyle} 
              />
            </label>

            {previewA && (
              <div style={previewBoxStyle}>
                <img src={previewA} alt="Preview A" style={previewImageStyle} />
              </div>
            )}

            <label style={{ ...labelStyle, marginTop: '15px' }}>
              説明文
              <textarea name="description" required style={{ ...inputStyle, height: '80px' }} />
            </label>

            <label style={{ ...labelStyle, marginTop: '15px' }}>
              ボタン文字
              <input name="buttonText" type="text" defaultValue="詳細を見る" style={inputStyle} />
            </label>
          </section>

          {/* セクション3: パターンB (ABテスト用) */}
          <section style={{ ...sectionBoxStyle, backgroundColor: '#f0f7ff' }}>
            <h2 style={{ ...sectionTitleStyle, borderLeftColor: '#38a169' }}>パターンB (テスト用)</h2>
            <p style={{ fontSize: '11px', color: '#666', marginBottom: '10px' }}>※入力すると自動的にABテストが開始されます</p>
            
            <label style={labelStyle}>
              タイトルB
              <input name="titleB" type="text" style={inputStyle} placeholder="夏物クリアランスセール！" />
            </label>

            <label style={{ ...labelStyle, marginTop: '15px' }}>
              画像B
              <input 
                name="imageFileB" 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageChange(e, 'B')}
                style={fileInputStyle} 
              />
            </label>

            {previewB && (
              <div style={previewBoxStyle}>
                <img src={previewB} alt="Preview B" style={previewImageStyle} />
              </div>
            )}

            <label style={{ ...labelStyle, marginTop: '15px' }}>
              説明文B
              <textarea name="descriptionB" style={{ ...inputStyle, height: '80px' }} />
            </label>

            <label style={{ ...labelStyle, marginTop: '15px' }}>
              ボタン文字B
              <input name="buttonTextB" type="text" placeholder="今すぐチェック" style={inputStyle} />
            </label>
          </section>
        </div>

        {/* セクション4: 共通アクション設定 */}
        <section style={sectionBoxStyle}>
          <h2 style={sectionTitleStyle}>共通リンク設定</h2>
          <label style={labelStyle}>リンクURL (A/B共通)
            <input name="buttonLink" type="text" placeholder="https://example.com" style={inputStyle} />
          </label>
        </section>

        <button type="submit" style={submitButtonStyle}>
          ポップアップを保存して公開
        </button>
      </form>
    </div>
  );
}

// --- 追加・修正したスタイル定義 ---

const containerStyle = {
  padding: '40px 20px',
  maxWidth: '1000px', // ABテスト用に横幅を広げました
  margin: '0 auto',
  fontFamily: '"Helvetica Neue", Arial, sans-serif',
  backgroundColor: '#f5f7f9',
  minHeight: '100vh',
};

const sectionBoxStyle = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  border: '1px solid #e1e4e8',
};

const sectionTitleStyle = {
  fontSize: '17px',
  fontWeight: 'bold',
  marginBottom: '15px',
  color: '#444',
  borderLeft: '4px solid #0070f3',
  paddingLeft: '12px',
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#555',
  width: '100%',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ced4da',
  fontSize: '14px',
  boxSizing: 'border-box' as const,
  outline: 'none',
  backgroundColor: '#fff',
};

const fileInputStyle = {
  ...inputStyle,
  border: '1px dashed #ccc',
  padding: '10px',
  fontSize: '12px'
};

const previewBoxStyle = {
  marginTop: '10px',
  textAlign: 'center' as const,
  backgroundColor: '#f9f9f9',
  padding: '10px',
  borderRadius: '8px'
};

const previewImageStyle = {
  maxWidth: '100%',
  maxHeight: '120px',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const submitButtonStyle = {
  padding: '18px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '18px',
  fontWeight: 'bold',
  boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
};