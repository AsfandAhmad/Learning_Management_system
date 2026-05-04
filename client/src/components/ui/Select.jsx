export default function Select({ label, required, error, options = [], ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-text-dark mb-1">
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-4 py-2 bg-white border rounded-lg text-text-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
