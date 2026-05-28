import { useRef, useState } from 'react';
import { Upload, X, Loader2, CheckCircle, FileImage } from 'lucide-react';
import api from '../lib/axios';

interface SingleImageUploaderProps {
  label: string;
  value: string;           // current URL
  onChange: (url: string) => void;
  hint?: string;
}

export default function SingleImageUploader({ label, value, onChange, hint }: SingleImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/system/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        onChange(res.data.url as string);
      } else {
        setError('Upload thất bại. Vui lòng thử lại.');
      }
    } catch {
      setError('Không thể kết nối. Thử lại sau.');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
        {label}
      </label>

      {/* If already has a value — show preview */}
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt={label}
            className="w-full h-36 object-cover"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-700 rounded-lg text-xs font-semibold shadow"
            >
              <Upload className="w-3.5 h-3.5" /> Đổi ảnh
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-red-500 text-white rounded-lg shadow"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Done badge */}
          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            <CheckCircle className="w-3 h-3" /> Đã tải lên
          </span>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all select-none ${
            uploading
              ? 'border-emerald-300 bg-emerald-50/30 cursor-not-allowed'
              : dragging
              ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
              : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Đang tải lên...</p>
            </>
          ) : (
            <>
              <div className={`p-2.5 rounded-xl transition-colors ${dragging ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <FileImage className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-600">
                  {dragging ? 'Thả ảnh vào đây...' : 'Kéo thả hoặc bấm để chọn ảnh'}
                </p>
                {hint && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-[10px] text-red-500 font-medium">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={e => handleFile(e.target.files)}
      />
    </div>
  );
}
