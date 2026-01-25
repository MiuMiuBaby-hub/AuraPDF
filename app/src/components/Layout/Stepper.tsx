import { Check } from 'lucide-react';
import type { AppStep } from '../../types';

interface StepperProps {
    currentStep: AppStep;
}

const steps = [
    { id: 'upload' as const, label: '上傳檔案', number: 1 },
    { id: 'preview' as const, label: '預覽調整', number: 2 },
    { id: 'download' as const, label: '下載結果', number: 3 },
];

export function Stepper({ currentStep }: StepperProps) {
    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="flex items-center justify-center gap-4 py-6">
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = step.id === currentStep;

                return (
                    <div key={step.id} className="flex items-center gap-2">
                        <div
                            className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                transition-all duration-300
                ${isCompleted
                                    ? 'bg-green-500 text-white'
                                    : isCurrent
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                                        : 'bg-gray-700 text-gray-400'
                                }
              `}
                        >
                            {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                        </div>

                        <span
                            className={`
                text-sm font-medium transition-colors
                ${isCurrent ? 'text-white' : 'text-gray-500'}
              `}
                        >
                            {step.label}
                        </span>

                        {index < steps.length - 1 && (
                            <div
                                className={`
                  w-12 h-0.5 mx-2 transition-colors
                  ${index < currentIndex ? 'bg-green-500' : 'bg-gray-700'}
                `}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
