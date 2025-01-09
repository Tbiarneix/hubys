import { ChangeEvent, useRef } from 'react';
import { Upload } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  currentImage?: string;
}

export function ImageUpload({ onImageSelect, currentImage }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onImageSelect(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        {currentImage ? (
          <Image 
            src={currentImage} 
            alt="Avatar" 
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload className="w-8 h-8 text-white" />
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
}
