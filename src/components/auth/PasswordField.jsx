// src/components/auth/PasswordField.jsx
import { useState } from "react";
import FormField from "./FormField";

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  disabled,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      id={id}
      label={label}
      type={visible ? "text" : "password"}
      value={value}
      onChange={onChange}
      error={error}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      rightElement={
        <button
          type="button"
          className="form-field__toggle-btn"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      }
    />
  );
}
