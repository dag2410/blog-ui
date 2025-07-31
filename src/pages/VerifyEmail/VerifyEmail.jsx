import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyEmail } from "@/features/auth/authAsync";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, setMessage] = useState("Đang xác thực tài khoản...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setMessage("Thiếu mã xác thực.");
      return;
    }

    dispatch(verifyEmail(token))
      .unwrap()
      .then((res) => {
        setMessage(res.message || "Xác thực thành công!");
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch((err) => {
        setMessage(
          err || "Xác thực thất bại. Token không hợp lệ hoặc đã hết hạn."
        );
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl p-8 rounded-xl text-center max-w-md">
        <h2 className="text-xl font-semibold mb-4">Xác thực Email</h2>
        <p>{message}</p>
        {message.includes("thành công") && (
          <p className="mt-2 text-green-600">
            Đang chuyển hướng tới trang đăng nhập...
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
