import { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { TextInput } from './TextInput';
import { ImageUpload } from './ImageUpload';

interface PostInputProps {
  onSubmit: (text?: string, image?: File) => void;
  isLoading: boolean;
}

export function PostInput({ onSubmit, isLoading }: PostInputProps) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const canSubmit = (text.trim().length > 0 || image !== null) && !isLoading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(text.trim() || undefined, image || undefined);
  };

  const handleReset = () => {
    setText('');
    setImage(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-900">Verificar publicacion</h2>
        <p className="text-sm text-gray-500">
          Pega el texto o sube una captura de pantalla de la publicacion que quieres verificar.
        </p>
      </div>

      <TextInput value={text} onChange={setText} disabled={isLoading} />
      <ImageUpload image={image} onImageChange={setImage} disabled={isLoading} />

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2 px-6 py-2.5 bg-chile-blue text-white font-medium rounded-lg hover:bg-chile-blue-dark focus:outline-none focus:ring-2 focus:ring-chile-blue/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Verificar publicacion
            </>
          )}
        </button>

        {(text.trim() || image) && !isLoading && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
