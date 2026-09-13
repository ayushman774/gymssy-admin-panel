import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ProviderAuthLayout from "../../layouts/ProviderAuthLayout";
import FormField from "../../components/auth/FormField";
import PasswordField from "../../components/auth/PasswordField";
import AlertBanner from "../../components/auth/AlertBanner";
import { useProviderAuth } from "../../context/ProviderAuthContext";
import "../../styles/auth-form.css";
import "../../styles/provider-auth.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

export default function ProviderLogin() {
  const { login } = useProviderAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting) return;

    const errors = validate(values);
    setFieldErrors(errors);
    setFormError("");

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await login(values.email.trim(), values.password);
      navigate("/provider/dashboard", { replace: true });
    } catch (err) {
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProviderAuthLayout>
      <div className="auth-form">
        <div className="auth-form__header">
          <h1 className="auth-form__heading">Welcome Back</h1>
          <p className="auth-form__subtext">
            Login to manage your Gymssy profile and business.
          </p>
        </div>

        <AlertBanner type="error" message={formError} />

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={submitting}
          />

          <PasswordField
            id="password"
            label="Password"
            value={values.password}
            onChange={handleChange}
            error={fieldErrors.password}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={submitting}
          />

          <button
            type="submit"
            className="auth-form__submit-btn"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="auth-form__footer auth-form__footer--stacked">
          <p>
            Don&apos;t have a provider account?{" "}
            <Link to="/provider/register" className="auth-form__link">
              Register here.
            </Link>
          </p>
          <p>
            Are you an administrator?{" "}
            <Link to="/admin/login" className="auth-form__link">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </ProviderAuthLayout>
  );
}
