export default function FormInput({ 
  label, 
  name, 
  type = 'text', 
  register, 
  error, 
  placeholder,
  options = [],
  ...props 
}) {
  const inputClasses = `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    error ? 'border-red-500' : 'border-gray-300'
  }`;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {type === 'select' ? (
        <select {...register(name)} className={inputClasses} {...props}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : type === 'file' ? (
        <input
          type="file"
          {...register(name)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          {...props}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          {...register(name)}
          className={inputClasses}
          {...props}
        />
      )}
      
      {error && (
        <p className="text-red-500 text-sm">{error.message}</p>
      )}
    </div>
  );
}