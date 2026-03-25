import { Check, Loader2 } from 'lucide-react';
import type { PipelineStepName } from '@shared/types';
import { PIPELINE_MESSAGES } from '@shared/types';

interface StepProgressProps {
  currentStep: PipelineStepName;
}

const STEPS: PipelineStepName[] = [
  'extracting_text',
  'identifying_claims',
  'searching',
  'analyzing',
  'complete',
];

export function StepProgress({ currentStep }: StepProgressProps) {
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="space-y-3">
        {STEPS.filter((s) => s !== 'complete').map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div key={step} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                ) : isActive ? (
                  <div className="w-6 h-6 rounded-full bg-chile-blue/10 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-chile-blue animate-spin" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-100" />
                )}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? 'text-chile-blue font-medium'
                    : isCompleted
                      ? 'text-gray-500'
                      : 'text-gray-400'
                }`}
              >
                {PIPELINE_MESSAGES[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
