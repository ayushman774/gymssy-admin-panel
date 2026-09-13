import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ProviderAuthLayout from "../../layouts/ProviderAuthLayout";
import FormField from "../../components/auth/FormField";
import PasswordField from "../../components/auth/PasswordField";
import SelectField from "../../components/auth/SelectField";
import CheckboxField from "../../components/auth/CheckboxField";
import AlertBanner from "../../components/auth/AlertBanner";
import { registerProvider } from "../../services/providerService";
import {
  PROVIDER_TYPES,
  PROVIDER_TYPE_VALUES,
} from "../../constants/providerTypes";
import "../../styles/auth-form.css";
import "../../styles/provider-auth.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;

const initialValues = {
  name: "",
  email: "",
  phone: "",
  providerType: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
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

  if (!values.providerType) {
    errors.providerType = "Please select a provider type.";
  } else if (!PROVIDER_TYPE_VALUES.includes(values.providerType)) {
    errors.providerType = "Please select a valid provider type.";
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

  if (!values.acceptTerms) {
    errors.acceptTerms = "You must accept the terms to continue.";
  }

  return errors;
}

export default function ProviderRegister() {
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

  function handleCheckboxChange(e) {
    const { checked } = e.target;
    setValues((prev) => ({ ...prev, acceptTerms: checked }));
    setFieldErrors((prev) => ({ ...prev, acceptTerms: undefined }));
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
      // NOTE: accountType is fixed to "business" inside providerService.
      // This page must never submit accountType: "admin".
      await registerProvider({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        providerType: values.providerType,
      });

      setValues(initialValues);
      setSuccessMessage(
        "Your provider account has been created successfully. Please sign in to continue.",
      );

      // Provider registration never authenticates into the Admin Panel.
      // No admin token/session is created here.
      setTimeout(() => {
        navigate("/provider/login", { replace: true });
      }, 1800);
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
          <h1 className="auth-form__heading">Join Gymssy as a provider</h1>
          <p className="auth-form__subtext">
            List your services, reach more customers, and grow your business
            with Gymssy.
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
            placeholder="Arjun Mehta"
            autoComplete="name"
            disabled={submitting}
          />

          <div className="form-row">
            <FormField
              id="email"
              label="Email Address"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={fieldErrors.email}
              placeholder="arjun@example.com"
              autoComplete="email"
              disabled={submitting}
            />

            <FormField
              id="phone"
              label="Phone Number"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              error={fieldErrors.phone}
              placeholder="9876543212"
              autoComplete="tel"
              disabled={submitting}
            />
          </div>

          <SelectField
            id="providerType"
            label="Provider Type"
            value={values.providerType}
            onChange={handleChange}
            error={fieldErrors.providerType}
            options={PROVIDER_TYPES}
            placeholder="Select your provider type"
            helperText="Choose the category that best describes your business or professional service."
            disabled={submitting}
          />

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

          <CheckboxField
            id="acceptTerms"
            checked={values.acceptTerms}
            onChange={handleCheckboxChange}
            error={fieldErrors.acceptTerms}
            disabled={submitting}
          >
            I agree to Gymssy's Terms of Service and Privacy Policy.
          </CheckboxField>

          <button
            type="submit"
            className="auth-form__submit-btn"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Create Provider Account"}
          </button>
        </form>

        <div className="auth-form__footer auth-form__footer--stacked">
          <p>
            Already registered?{" "}
            <Link to="/provider/login" className="auth-form__link">
              Provider login
            </Link>
          </p>
          <p>
            Are you an administrator?{" "}
            <Link to="/admin/login" className="auth-form__link">
              Admin login
            </Link>
          </p>
        </div>
      </div>
    </ProviderAuthLayout>
  );
}
