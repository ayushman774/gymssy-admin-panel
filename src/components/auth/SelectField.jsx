export default function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  error,
  placeholder = "Select an option",
  helperText,
  disabled,
}) {
  const describedBy = error
    ? `${id}-error`
    : helperText
      ? `${id}-helper`
      : undefined;

  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`form-field__input form-field__select ${
          error ? "form-field__input--error" : ""
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {helperText && !error && (
        <p id={`${id}-helper`} className="form-field__helper">
          {helperText}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
