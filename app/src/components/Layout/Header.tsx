import { Sparkles } from 'lucide-react';

export function Header() {
    return (
        <header className="py-6 px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    AuraPDF
                </h1>
            </div>
            <p className="text-gray-400">
                智能 PDF Logo 插入工具 — 自動識別空白區域，一鍵添加品牌標識
            </p>
        </header>
    );
}
