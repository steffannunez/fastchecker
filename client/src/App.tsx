import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PostInput } from './components/input/PostInput';
import { StepProgress } from './components/shared/StepProgress';
import { ErrorAlert } from './components/shared/ErrorAlert';
import { AnalysisReport } from './components/report/AnalysisReport';
import { useFactCheck } from './hooks/useFactCheck';

function App() {
  const { analyze, isLoading, currentStep, result, error, reset } = useFactCheck();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <PostInput onSubmit={analyze} isLoading={isLoading} />

        {isLoading && currentStep && (
          <div className="mt-8">
            <StepProgress currentStep={currentStep} />
          </div>
        )}

        {error && (
          <div className="mt-8">
            <ErrorAlert message={error} onDismiss={reset} />
          </div>
        )}

        {result && !isLoading && (
          <div className="mt-8">
            <AnalysisReport data={result} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
