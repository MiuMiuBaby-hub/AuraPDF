import { useState, useRef, useCallback, useEffect } from 'react';
import { FileText, AlertTriangle, Check, ChevronDown, CreditCard, User, Languages } from 'lucide-react';

interface DisclaimerModalProps {
  onAgree: () => void;
}

type Language = 'zh' | 'en';

interface DisclaimerSection {
  icon: React.ReactNode;
  heading: string;
  content: string[];
}

interface DisclaimerContent {
  title: string;
  sections: DisclaimerSection[];
  agreeButtonText: string;
  scrollHint: string;
}

const contentZh: DisclaimerContent = {
  title: '使用條款與免責聲明',
  sections: [
    {
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      heading: '測試用途聲明',
      content: [
        '本工具僅供測試和評估目的使用',
        '所有上傳的檔案均在瀏覽器本地處理，不會儲存或上傳至任何伺服器',
        '您的資料安全由您自己的設備保護',
      ],
    },
    {
      icon: <CreditCard className="w-5 h-5 text-green-400" />,
      heading: '使用限制與付費說明',
      content: [
        '如需處理大量或商業用途的 PDF 檔案，請使用個人或公司帳戶',
        '測試版本可能有功能或處理量限制',
        '付費帳戶可享有更高的處理效能和優先支援',
      ],
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      heading: '免責條款',
      content: [
        '本服務按「現狀」提供，不提供任何明示或暗示的保證',
        '使用者須自行承擔使用本工具的風險',
        '對於因使用本工具而導致的任何損失，我們不承擔責任',
      ],
    },
    {
      icon: <User className="w-5 h-5 text-purple-400" />,
      heading: '使用者責任',
      content: [
        '使用者應確保有權處理上傳的 PDF 檔案和圖片',
        '禁止用於任何非法或未經授權的目的',
        '請遵守相關著作權和智慧財產權法規',
      ],
    },
  ],
  agreeButtonText: '我已閱讀並同意',
  scrollHint: '請滾動至底部以啟用同意按鈕',
};

const contentEn: DisclaimerContent = {
  title: 'Terms of Use & Disclaimer',
  sections: [
    {
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      heading: 'Testing Purpose Statement',
      content: [
        'This tool is for testing and evaluation purposes only',
        'All uploaded files are processed locally in your browser and are not stored or uploaded to any server',
        'Your data security is protected by your own device',
      ],
    },
    {
      icon: <CreditCard className="w-5 h-5 text-green-400" />,
      heading: 'Usage Limits & Payment',
      content: [
        'For processing large volumes or commercial use of PDF files, please use a personal or company account',
        'The test version may have feature or processing limitations',
        'Paid accounts enjoy higher processing performance and priority support',
      ],
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      heading: 'Disclaimer',
      content: [
        'This service is provided "as is" without any express or implied warranties',
        'Users assume all risks associated with using this tool',
        'We are not liable for any losses resulting from the use of this tool',
      ],
    },
    {
      icon: <User className="w-5 h-5 text-purple-400" />,
      heading: 'User Responsibilities',
      content: [
        'Users must ensure they have the right to process uploaded PDF files and images',
        'Use for any illegal or unauthorized purposes is prohibited',
        'Please comply with relevant copyright and intellectual property laws',
      ],
    },
  ],
  agreeButtonText: 'I have read and agree',
  scrollHint: 'Please scroll to the bottom to enable the agree button',
};

export function DisclaimerModal({ onAgree }: DisclaimerModalProps) {
  const [language, setLanguage] = useState<Language>('zh');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const content = language === 'zh' ? contentZh : contentEn;

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  }, []);

  // Check if content is short enough that no scrolling is needed
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight) {
      setHasScrolledToBottom(true);
    }
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'zh' ? 'en' : 'zh'));
    setHasScrolledToBottom(false);
    // Reset scroll position when switching language
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-card max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
            >
              <Languages className="w-4 h-4 text-gray-300" />
              <span className="text-gray-300">
                {language === 'zh' ? 'EN' : '中文'}
              </span>
            </button>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {content.title}
            </h2>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {content.sections.map((section, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {section.icon}
                {section.heading}
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm pl-7">
                {section.content.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          {/* Scroll hint */}
          {!hasScrolledToBottom && (
            <p className="text-center text-sm text-gray-400 mb-4 flex items-center justify-center gap-2">
              <ChevronDown className="w-4 h-4 animate-bounce" />
              {content.scrollHint}
            </p>
          )}

          <button
            onClick={onAgree}
            disabled={!hasScrolledToBottom}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {content.agreeButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
