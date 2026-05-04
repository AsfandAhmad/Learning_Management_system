export default function Textarea({ label, required, error, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-text-dark mb-1">
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2 bg-white border rounded-lg text-text-dark placeholder-text-light focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-vertical ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
