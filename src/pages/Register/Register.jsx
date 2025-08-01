import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Input, Button } from "@/components";
import styles from "./Register.module.scss";
import { postRegister } from "@/features/auth/authAsync";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Họ phải được nhập. ";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "Họ phải 2 kí tự trở lên.";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Tên phải được nhập.";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Tên phải 2 kí tự trở lên.";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email phải được nhập";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Vui lòng nhập đúng định dạng email.";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Mật khẩu phải được nhập.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu tối thiểu là 8 kí tự.";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Mật khẩu phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một số.";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu nhập ở trên.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword =
        "Mật khẩu nhập lại không khớp với mật khẩu ở trên.";
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms =
        "Bạn phải đồng ý với các điều khoản và điều kiện.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const formatErrors = (errorArray = []) => {
    const formatted = {};
    errorArray.forEach((err) => {
      formatted[err.field] = err.message;
    });
    return formatted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        confirm: formData.confirmPassword,
      };
      const user = await dispatch(postRegister(payload)).unwrap();
      toast.success("Đăng ký thành công! Bạn vui lòng kiểm tra email.", {
        autoClose: 10000,
        closeOnClick: false,
        draggable: false,
        position: "top-right",
      });
      console.log("Registration successful:", user);
      // console.log(user);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
      });
    } catch (error) {
      console.error("Registration failed:", error.errors[0].message);

      if (error.errors.length > 0) {
        // setErrors(formatErrors(error.errors));
      }
      toast.error(error.errors[0].message || "Đăng ký thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, label: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    const colors = ["", "#ef4444", "#f59e0b", "#10b981", "#059669", "#047857"];

    return {
      strength: Math.min(strength, 5),
      label: labels[Math.min(strength, 5)],
      color: colors[Math.min(strength, 5)],
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Create Your Account</h1>
        <p className={styles.subtitle}>
          Join our community to start reading and sharing amazing content.
        </p>
        {/* Submit Error */}
        {errors.submit && (
          <div className={styles.submitError}>{errors.submit}</div>
        )}
      </div>

      {/* Form */}
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Name Fields */}
        <div className={styles.nameFields}>
          <Input
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            error={errors.firstName}
            placeholder="John"
          />
          <Input
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            error={errors.lastName}
            placeholder="Doe"
          />
        </div>

        {/* Email Field */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          placeholder="john.doe@example.com"
        />

        {/* Password Field */}
        <div className={styles.passwordField}>
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            placeholder="Create a strong password"
          />
          {formData.password && (
            <div
              className={styles.passwordStrength}
              style={{
                "--strength-width": `${(passwordStrength.strength / 5) * 100}%`,
                "--strength-color": passwordStrength.color,
              }}
            >
              <div className={styles.strengthBar}>
                <div className={styles.strengthFill} />
              </div>
              <span className={styles.strengthLabel}>
                {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
        />

        {/* Terms Agreement */}
        <div className={styles.termsSection}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              I agree to the{" "}
              <Link to="/terms" className={styles.link}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className={styles.link}>
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreeToTerms && (
            <div className={styles.fieldError}>{errors.agreeToTerms}</div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      {/* Social Register */}
      <div className={styles.socialSection}>
        <div className={styles.divider}>
          <span>Or sign up with</span>
        </div>

        <div className={styles.socialButtons}>
          <button className={styles.socialButton} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button className={styles.socialButton} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 0c-6.627 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            Continue with GitHub
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>
          Already have an account?{" "}
          <Link to="/login" className={styles.loginLink}>
            Sign in here
          </Link>
        </p>
      </div>
    </>
  );
};

export default Register;
