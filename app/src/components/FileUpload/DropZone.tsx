import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface DropZoneProps {
    onFileSelect: (file: File) => void;
    accept: string;
    label: string;
    description: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export function DropZone({
    onFileSelect,
    accept,
    label,
    description,
    icon,
    disabled = false,
}: DropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onFileSelect(files[0]);
        }
    }, [disabled, onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files[0]);
        }
        // Reset input value to allow re-selecting the same file
        e.target.value = '';
    }, [onFileSelect]);

    return (
        <div
            className={`drop-zone p-8 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'active' : ''
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
                if (!disabled) {
                    document.getElementById(`file-input-${label}`)?.click();
                }
            }}
        >
            <input
                id={`file-input-${label}`}
                type="file"
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
                disabled={disabled}
            />

            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                    {icon || <Upload className="w-8 h-8 text-blue-400" />}
                </div>

                <div>
                    <p className="text-lg font-semibold text-white mb-1">{label}</p>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>

                <p className="text-xs text-gray-500">
                    拖拽檔案到此處或點擊選擇
                </p>
            </div>
        </div>
    );
}
