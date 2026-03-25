import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, X, AlertCircle } from 'lucide-react';
import { validateImage, formatFileSize } from '../../utils/imageUtils';

interface ImageUploadProps {
  image: File | null;
  onImageChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ image, onImageChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setValidationError(null);
      const file = acceptedFiles[0];
      if (!file) return;

      const validation = validateImage(file);
      if (!validation.valid) {
        setValidationError(validation.error!);
        return;
      }

      onImageChange(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

  const removeImage = () => {
    onImageChange(null);
    setPreview(null);
    setValidationError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled,
  });

  if (image && preview) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Imagen de la publicacion
        </label>
        <div className="relative rounded-lg border border-gray-300 overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-64 object-contain bg-gray-50"
          />
          <button
            onClick={removeImage}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition-colors disabled:opacity-50"
            aria-label="Eliminar imagen"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 border-t">
            {image.name} ({formatFileSize(image.size)})
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Captura de pantalla (opcional)
      </label>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-chile-blue bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <ImagePlus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? 'Suelta la imagen aqui...'
            : 'Arrastra una captura de pantalla o haz clic para seleccionar'}
        </p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG o WebP (max 5MB)</p>
      </div>
      {validationError && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
