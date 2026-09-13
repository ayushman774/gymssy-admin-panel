import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import FormField from "../../components/auth/FormField";
import PasswordField from "../../components/auth/PasswordField";
import AlertBanner from "../../components/auth/AlertBanner";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth-form.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;

const initialValues = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  adminSecret: "",
};

function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Full name is required.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Full name must be at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!values.adminSecret) {
    errors.adminSecret = "Admin creation secret is required.";
  }

  return errors;
}

export default function AdminRegister() {
  const { registerAdmin } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
    setSuccessMessage("");

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerAdmin({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        adminSecret: values.adminSecret,
      });

      // Clear sensitive field from memory/state immediately.
      setValues((prev) => ({ ...prev, adminSecret: "" }));

      if (result.authenticated) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        setSuccessMessage(
          "Admin account created successfully. Please sign in.",
        );
        setTimeout(() => {
          navigate("/admin/login", { replace: true });
        }, 1500);
      }
    } catch (err) {
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-form">
        <div className="auth-form__header">
          <h1 className="auth-form__heading">Create admin account</h1>
          <p className="auth-form__subtext">
            Set up an administrator account for the Gymssy platform.
          </p>
        </div>

        <AlertBanner type="error" message={formError} />
        <AlertBanner type="success" message={successMessage} />

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="name"
            label="Full Name"
            value={values.name}
            onChange={handleChange}
            error={fieldErrors.name}
            placeholder="Gymssy Admin"
            autoComplete="name"
            disabled={submitting}
          />

          <div className="form-row">
            <FormField
              id="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={fieldErrors.email}
              placeholder="admin@gymssy.com"
              autoComplete="email"
              disabled={submitting}
            />

            <FormField
              id="phone"
              label="Phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              error={fieldErrors.phone}
              placeholder="9999999999"
              autoComplete="tel"
              disabled={submitting}
            />
          </div>

          <div className="form-row">
            <PasswordField
              id="password"
              label="Password"
              value={values.password}
              onChange={handleChange}
              error={fieldErrors.password}
              placeholder="Create a password"
              autoComplete="new-password"
              disabled={submitting}
            />

            <PasswordField
              id="confirmPassword"
              label="Confirm Password"
              value={values.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              disabled={submitting}
            />
          </div>

          <PasswordField
            id="adminSecret"
            label="Admin Creation Secret"
            value={values.adminSecret}
            onChange={handleChange}
            error={fieldErrors.adminSecret}
            placeholder="Provided by platform owner"
            autoComplete="off"
            disabled={submitting}
          />

          <button
            type="submit"
            className="auth-form__submit-btn"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Create Admin Account"}
          </button>
        </form>

        <p className="auth-form__footer">
          Already have an account?{" "}
          <Link to="/admin/login" className="auth-form__link">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
