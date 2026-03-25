import { useState, useCallback, useRef, useEffect } from 'react';
import { postAnalysis } from '../services/api';
import type { AnalysisResponse, PipelineStepName } from '@shared/types';

const STEP_SEQUENCE: PipelineStepName[] = [
  'extracting_text',
  'identifying_claims',
  'searching',
  'analyzing',
  'complete',
];

const STEP_DURATIONS: Record<PipelineStepName, number> = {
  extracting_text: 4000,
  identifying_claims: 5000,
  searching: 6000,
  analyzing: 8000,
  complete: 0,
};

export function useFactCheck() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<PipelineStepName | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasImageRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);

  const clearStepTimer = useCallback(() => {
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  const advanceSteps = useCallback(
    (startIndex: number, generation: number) => {
      if (startIndex >= STEP_SEQUENCE.length - 1) return;
      if (generation !== generationRef.current) return;

      const step = STEP_SEQUENCE[startIndex];
      setCurrentStep(step);

      stepTimerRef.current = setTimeout(() => {
        advanceSteps(startIndex + 1, generation);
      }, STEP_DURATIONS[step]);
    },
    []
  );

  const analyze = useCallback(
    async (text?: string, image?: File) => {
      // Abort any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Invalidate any pending step timers from a previous call
      clearStepTimer();
      const generation = ++generationRef.current;

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);
      setResult(null);
      hasImageRef.current = !!image;

      const startIndex = image ? 0 : 1;
      advanceSteps(startIndex, generation);

      try {
        const response = await postAnalysis(text, image, controller.signal);

        // Ignore result if a newer call has been made
        if (generation !== generationRef.current) return;

        clearStepTimer();
        setCurrentStep('complete');
        setResult(response);
      } catch (err) {
        // Ignore aborted requests
        if (controller.signal.aborted) return;
        if (generation !== generationRef.current) return;

        clearStepTimer();
        setCurrentStep(null);
        setError(err instanceof Error ? err.message : 'Error inesperado');
      } finally {
        if (generation === generationRef.current) {
          setIsLoading(false);
        }
      }
    },
    [advanceSteps, clearStepTimer]
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    generationRef.current++;
    clearStepTimer();
    setIsLoading(false);
    setCurrentStep(null);
    setResult(null);
    setError(null);
  }, [clearStepTimer]);

  useEffect(() => {
    return () => {
      clearStepTimer();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [clearStepTimer]);

  return {
    analyze,
    isLoading,
    currentStep,
    result,
    error,
    reset,
  };
}
