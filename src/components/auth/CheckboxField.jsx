export default function CheckboxField({
  id,
  checked,
  onChange,
  error,
  disabled,
  children,
}) {
  return (
    <div className="checkbox-field">
      <label htmlFor={id} className="checkbox-field__label">
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="checkbox-field__input"
        />
        <span className="checkbox-field__text">{children}</span>
      </label>

      {error && (
        <p id={`${id}-error`} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
