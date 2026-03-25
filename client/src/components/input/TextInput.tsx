interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TextInput({ value, onChange, disabled }: TextInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="post-text" className="block text-sm font-medium text-gray-700">
        Texto de la publicacion
      </label>
      <textarea
        id="post-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Pega aqui el texto de la publicacion que quieres verificar..."
        rows={5}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-chile-blue focus:ring-2 focus:ring-chile-blue/20 focus:outline-none resize-y disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {value.length > 0 && (
        <p className="text-xs text-gray-400 text-right">{value.length} caracteres</p>
      )}
    </div>
  );
}
