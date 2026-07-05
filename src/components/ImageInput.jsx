import { useState, useRef } from 'react';
import { Ico } from './Ico';
import { sb, uploadBlob } from '../lib/supabase';

// 압축해서 Blob 반환 (Storage 업로드용)
export function fileToCompressedBlob(file, maxW = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('이미지 파일이 아닙니다.')); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxW) { height = Math.round(height * maxW / width); width = maxW; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const isPng = file.type === 'image/png';
        canvas.toBlob(
          (blob) => blob ? resolve({ blob, ext: isPng ? 'png' : 'jpg' }) : reject(new Error('압축 실패')),
          isPng ? 'image/png' : 'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('이미지를 읽을 수 없습니다.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsDataURL(file);
  });
}

export function fileToCompressedDataUrl(file, maxW = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('이미지 파일이 아닙니다.')); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxW) { height = Math.round(height * maxW / width); width = maxW; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const isPng = file.type === 'image/png';
        resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('이미지를 읽을 수 없습니다.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsDataURL(file);
  });
}

export function ImageInput({ value, onChange, placeholder = 'https://...', label }) {
  const inputId = useRef('imgup_' + Math.random().toString(36).slice(2, 8));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const isData = typeof value === 'string' && value.startsWith('data:');

  const onPick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setErr(''); setBusy(true);
    try {
      if (sb) {
        // Supabase 연결됨 → 압축 후 Storage 업로드, URL만 저장
        const { blob, ext } = await fileToCompressedBlob(file);
        const url = await uploadBlob(blob, ext);
        onChange(url);
      } else {
        // 미연결(로컬 테스트) → base64 폴백
        const dataUrl = await fileToCompressedDataUrl(file);
        onChange(dataUrl);
      }
    } catch (er) {
      setErr(er.message || '업로드 실패');
    } finally { setBusy(false); }
  };

  return (
    <div>
      {label && <label className="text-[12px] text-muted block mb-1">{label}</label>}
      <div className="flex gap-2">
        <input
          value={isData ? '' : (value || '')}
          onChange={e => onChange(e.target.value)}
          placeholder={isData ? '업로드된 이미지 사용 중' : placeholder}
          disabled={isData}
          className="flex-1 border border-line focus:border-ink outline-none px-2 py-2 text-[13px] bg-transparent disabled:bg-[#F7F7F7] disabled:text-muted"/>
        <label htmlFor={inputId.current}
          className="shrink-0 border border-line hover:border-ink px-3 py-2 text-[12px] cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap">
          {busy ? '처리 중…' : '파일 선택'}
        </label>
        <input id={inputId.current} type="file" accept="image/*" onChange={onPick} className="hidden"/>
        {value && (
          <button onClick={() => { onChange(''); setErr(''); }}
            className="shrink-0 border border-line hover:border-ink px-2 py-2 text-muted hover:text-ink" aria-label="이미지 제거">
            <Ico.trash className="w-4 h-4"/>
          </button>
        )}
      </div>
      {isData && <div className="text-[11px] text-muted mt-1">업로드한 이미지가 적용되어 있어요. (URL을 쓰려면 휴지통으로 비우세요)</div>}
      {err && <div className="text-[11px] text-red-500 mt-1">{err}</div>}
    </div>
  );
}
