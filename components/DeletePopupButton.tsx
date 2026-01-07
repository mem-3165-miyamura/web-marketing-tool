"use client";

import { deletePopUp } from "@lib/actions/popup";
import { useRouter } from "next/navigation";

interface Props {
  popupId: string;
}

export default function DeletePopupButton({ popupId }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("この設定を削除してもよろしいですか？")) return;

    await deletePopUp(popupId);
    router.refresh(); // ページをリフレッシュ
  };

  return (
    <button
      onClick={handleDelete}
      style={{
        fontSize: '13px', 
        color: '#e53e3e', 
        backgroundColor: 'transparent',
        border: '1px solid #e53e3e', 
        padding: '4px 8px', 
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      削除
    </button>
  );
}
