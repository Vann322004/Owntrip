import { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import api from '../lib/axios';

interface UploadedImage {
  id: string;
  url: string;
  preview: string;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

interface ImageUploaderProps {
  images: string[];           // current list of URL strings
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<UploadedImage[]>([]);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/system/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        return res.data.url as string;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const remaining = maxImages - images.length;
    const toProcess = Array.from(files).slice(0, remaining);

    // Create placeholder entries with local preview while uploading
    const placeholders: UploadedImage[] = toProcess.map(file => ({
      id: `${Date.now()}_${file.name}`,
      url: '',
      preview: URL.createObjectURL(file),
      status: 'uploading',
    }));

    setUploading(prev => [...prev, ...placeholders]);

    // Upload each file concurrently
    const results = await Promise.all(
      toProcess.map(async (file, i) => {
        const url = await uploadFile(file);
        return { id: placeholders[i].id, url, preview: placeholders[i].preview };
      })
    );

    // Update placeholders status
    setUploading(prev =>
      prev.map(p => {
        const result = results.find(r => r.id === p.id);
        if (!result) return p;
        if (result.url) {
          return { ...p, url: result.url, status: 'done' as const };
        }
        return { ...p, status: 'error' as const, error: 'Upload thất bại' };
      })
    );

    // Add successful URLs to parent list
    const newUrls = results.filter(r => r.url).map(r => r.url as string);
    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }

    // Clean up done entries after 2s
    setTimeout(() => {
      setUploading(prev => prev.filter(p => p.status !== 'done'));
    }, 2000);
  }, [images, maxImages, onChange, uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = (url: string) => {
    onChange(images.filter(u => u !== url));
  };

  const removeUploading = (id: string) => {
    setUploading(prev => prev.filter(p => p.id !== id));
  };

  const allImages = [
    ...images.map(url => ({ type: 'done' as const, url, id: url })),
    ...uploading.map(u => ({ type: u.status, url: u.preview, id: u.id, error: u.error })),
  ];

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {images.length + uploading.length < maxImages && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all select-none ${
            dragging
              ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
              : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50'
          }`}
        >
          <div className={`p-3 rounded-2xl transition-colors ${dragging ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              {dragging ? 'Thả ảnh vào đây...' : 'Kéo & thả ảnh hoặc bấm để chọn'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              JPG, PNG, WEBP · Tối đa 10MB/ảnh · Còn có thể thêm {maxImages - images.length - uploading.length} ảnh
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Image Grid */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {allImages.map(img => (
            <div
              key={img.id}
              className="relative group aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm"
            >
              <img
                src={img.url}
                alt="Hotel image"
                className="w-full h-full object-cover"
              />

              {/* Uploading overlay */}
              {img.type === 'uploading' && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-1">
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  <span className="text-[10px] font-semibold text-slate-600">Đang tải...</span>
                </div>
              )}

              {/* Done flash overlay */}
              {img.type === 'done' && img.id !== img.url && (
                <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              )}

              {/* Error overlay */}
              {img.type === 'error' && (
                <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center gap-1 p-2">
                  <X className="w-5 h-5 text-white" />
                  <span className="text-[10px] text-white font-semibold text-center">Upload lỗi</span>
                  <button
                    type="button"
                    onClick={() => removeUploading(img.id)}
                    className="text-[9px] text-white underline mt-0.5"
                  >
                    Xóa
                  </button>
                </div>
              )}

              {/* Remove button (completed images) */}
              {img.type === 'done' && img.id === img.url && (
                <button
                  type="button"
                  onClick={() => removeImage(img.url)}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* First image badge */}
              {img.id === images[0] && (
                <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  Ảnh chính
                </span>
              )}
            </div>
          ))}

          {/* Add more button (inside grid) */}
          {images.length + uploading.length < maxImages && allImages.length > 0 && (
            <div
              onClick={() => inputRef.current?.click()}
              className="aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/30 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <ImageIcon className="w-5 h-5 text-slate-300" />
              <span className="text-[10px] font-semibold text-slate-400">Thêm ảnh</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
