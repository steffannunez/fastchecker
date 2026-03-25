import { ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chile-blue text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FastChecker</h1>
            <p className="text-sm text-gray-500">
              Verificador de publicaciones en redes sociales
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
