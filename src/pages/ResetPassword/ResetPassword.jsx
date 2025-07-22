import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Input, Button } from "../../components";
import styles from "./ResetPassword.module.scss";
import instance from "../../utils/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [tokenErrorMessage, setTokenErrorMessage] = useState("");

  const validateToken = async () => {
    if (!token) {
      setIsTokenValid(false);
      setTokenErrorMessage("Token không tồn tại trong URL.");
      return;
    }

    try {
      await instance.get(`/auth/reset-password?token=${token}`);
      navigate("/reset-password", {
        replace: true,
      });
      setIsTokenValid(true);
    } catch (error) {
      setIsTokenValid(false);
      const message =
        error?.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.";
      setTokenErrorMessage(message);
    }
  };

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu mới.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await instance.post(`/auth/reset-password?token=${token}`, {
        password: formData.password,
        confirm: formData.confirmPassword,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Reset password failed:", error);
      setErrors({
        submit:
          error?.response?.data?.message ||
          "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isTokenValid === null) {
    return <div className={styles.loading}>Đang kiểm tra token...</div>;
  }

  if (!isTokenValid) {
    return (
      <div className={styles.invalidToken}>
        <h1>Liên kết không hợp lệ</h1>
        <p>{tokenErrorMessage}</p>
        <Link to="/forgot-password" className={styles.link}>
          ← Gửi lại yêu cầu đặt lại mật khẩu
        </Link>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className={styles.success}>
        <h1>Đặt lại mật khẩu thành công</h1>
        <p>Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.</p>
        <Link to="/login" className={styles.link}>
          → Quay lại trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Đặt lại mật khẩu</h1>
      <p className={styles.subtitle}>
        Nhập mật khẩu mới của bạn bên dưới để đặt lại.
      </p>

      {errors.submit && <div className={styles.error}>{errors.submit}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Mật khẩu mới"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
