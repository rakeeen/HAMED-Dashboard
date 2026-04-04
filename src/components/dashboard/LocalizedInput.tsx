import React, { useState, useRef } from 'react';
import { SketchyInput } from './SketchyInput';
import { SketchyTextarea } from './SketchyTextarea';
import { Image, Upload, Loader2 } from 'lucide-react';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface LocalizedProps {
  label: string;
  value: { [key: string]: string } | string;
  onChange: (val: any) => void;
  isTextArea?: boolean;
}

export const LocalizedInput: React.FC<LocalizedProps> = ({ label, value, onChange }) => {
  const val = typeof value === 'string' ? { en: value, ar: '', it: '' } : value;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SketchyInput 
        label={`${label} (EN)`} 
        value={val?.en || ''} 
        onChange={(e) => onChange({ ...val, en: e.target.value })} 
      />
      <SketchyInput 
        label={`${label} (AR)`} 
        value={val?.ar || ''} 
        dir="rtl"
        onChange={(e) => onChange({ ...val, ar: e.target.value })} 
      />
      <SketchyInput 
        label={`${label} (IT)`} 
        value={val?.it || ''} 
        onChange={(e) => onChange({ ...val, it: e.target.value })} 
      />
    </div>
  );
};

export const LocalizedTextarea: React.FC<LocalizedProps> = ({ label, value, onChange }) => {
  const val = typeof value === 'string' ? { en: value, ar: '', it: '' } : value;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SketchyTextarea 
        label={`${label} (EN)`} 
        value={val?.en || ''} 
        onChange={(e) => onChange({ ...val, en: e.target.value })} 
      />
      <SketchyTextarea 
        label={`${label} (AR)`} 
        value={val?.ar || ''} 
        dir="rtl"
        onChange={(e) => onChange({ ...val, ar: e.target.value })} 
      />
      <SketchyTextarea 
        label={`${label} (IT)`} 
        value={val?.it || ''} 
        onChange={(e) => onChange({ ...val, it: e.target.value })} 
      />
    </div>
  );
};

export const ImageInput: React.FC<{ label?: string; value: string; onChange: (e: any) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload failed", error);
          alert("Image upload failed!");
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          // Simulate the change event structure expected by Dashboard.tsx handlers
          onChange({ target: { value: downloadURL } });
          setUploading(false);
        }
      );
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1 w-full">
      {label && <label className="text-[10px] uppercase tracking-widest text-secondary font-black ml-1 opacity-80">{label}</label>}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <SketchyInput 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder || "Image URL..."} 
            className="pl-10"
          />
          <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" />
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-3 sketchy-border bg-ink/5 hover:bg-ink/10 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
        </button>
      </div>
      {value && (
        <div className="mt-2 aspect-video bg-ink/5 overflow-hidden sketchy-border border-dashed border-ink/10 relative group">
          <img src={value} alt="Preview" className="w-full h-full object-contain opacity-80 transition-opacity group-hover:opacity-100" />
          <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
             <span className="text-white text-[10px] font-black uppercase tracking-widest">Active Asset</span>
          </div>
        </div>
      )}
    </div>
  );
};
