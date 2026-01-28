import { useRef, useCallback, useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import type { StoredLogo } from '../../types';

interface LogoSlotProps {
    slotIndex: number;
    logo: StoredLogo | null;
    isActive: boolean;
    onUpload: (file: File) => void;
    onDelete: () => void;
    onSelect: () => void;
}

export function LogoSlot({
    slotIndex,
    logo,
    isActive,
    onUpload,
    onDelete,
    onSelect,
}: LogoSlotProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
        // Reset input so re-uploading the same file works
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [onUpload]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            onUpload(file);
        }
    }, [onUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    // Hidden file input
    const fileInput = (
        <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.svg"
            className="hidden"
            onChange={handleFileChange}
        />
    );

    // Empty slot
    if (!logo) {
        return (
            <div
                className={`border-2 border-dashed rounded-xl p-3 transition-all cursor-pointer text-center ${
                    isDragOver
                        ? 'border-blue-400 bg-blue-500/10'
                        : 'border-white/20 hover:border-purple-400/50 hover:bg-white/5'
                }`}
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {fileInput}
                <Plus className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Logo {slotIndex + 1}</p>
            </div>
        );
    }

    // Filled slot
    return (
        <div
            className={`rounded-xl p-2 transition-all cursor-pointer ${
                isActive
                    ? 'ring-2 ring-blue-500 bg-blue-500/10'
                    : 'bg-white/5 hover:bg-white/10'
            }`}
            onClick={onSelect}
        >
            {fileInput}
            <div className="relative">
                <img
                    src={logo.previewUrl}
                    alt={logo.name}
                    className="w-full h-14 object-contain rounded-lg bg-white/5 p-1"
                />
                {isActive && (
                    <div className="absolute top-1 left-1 bg-blue-500 rounded-full p-0.5">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full hover:bg-red-500/70 transition-colors"
                    title="移除 Logo"
                >
                    <X className="w-3 h-3 text-gray-300" />
                </button>
            </div>
            <p className="text-xs text-gray-400 truncate mt-1 px-1">{logo.name}</p>
            <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-gray-500">
                    {(logo.size / 1024).toFixed(0)} KB
                </span>
                {isActive && (
                    <span className="text-[10px] text-blue-400 font-medium">
                        使用中
                    </span>
                )}
            </div>
        </div>
    );
}
