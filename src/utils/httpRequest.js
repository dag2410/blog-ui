import axios from "axios";

let isRefreshing = false;
let tokenListeners = [];

const httpRequest = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

httpRequest.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("token");

  if (!token && !isRefreshing) {
    isRefreshing = true;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      token = res.data.data.accessToken;
      localStorage.setItem("token", token);
      config.headers.Authorization = `Bearer ${token}`;
      window.location.reload();
    } catch (err) {
      clearToken();
      console.warn(err);
    } finally {
      isRefreshing = false;
    }
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const shouldRenewToken = error.response?.status === 401;

    if (shouldRenewToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          const newToken = res.data.data.accessToken;
          localStorage.setItem("token", newToken);
          tokenListeners.forEach((listener) => listener());
          tokenListeners = [];
          isRefreshing = false;
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return httpRequest(error.config);
        } catch (err) {
          isRefreshing = false;
          tokenListeners = [];
          clearToken();
          const refreshError = new Error(
            "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
          );
          refreshError.response = err.response || {
            data: { message: refreshError.message },
          };
          return Promise.reject(refreshError);
        }
      } else {
        return new Promise((resolve) => {
          tokenListeners.push(() => {
            const token = localStorage.getItem("token");
            error.config.headers.Authorization = `Bearer ${token}`;
            resolve(httpRequest(error.config));
          });
        });
      }
    }

    // Xử lý các lỗi khác
    let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại.";
    if (error.response?.data) {
      const { data } = error.response;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        errorMessage = data.errors[0].message; // Lấy thông báo lỗi đầu tiên
      } else if (data.message) {
        errorMessage = data.message; // Lấy thông báo lỗi chung
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error("Axios error:", error);
    console.error("Error message:", errorMessage);

    // Tạo lỗi mới với thông báo cụ thể
    const customError = new Error(errorMessage);
    customError.response = error.response;
    return Promise.reject(customError);
  }
);

export const clearToken = () => {
  localStorage.removeItem("token");
  delete httpRequest.defaults.headers["Authorization"];
};

const send = async (method, url, data, config) => {
  const isPutOrPatch = ["put", "patch"].includes(method.toLowerCase());
  const effectiveMethod = isPutOrPatch ? "post" : method;
  const effectivePath = isPutOrPatch
    ? `${url}${url.includes("?") ? "&" : "?"}_method=${method}`
    : url;
  try {
    const response = await httpRequest.request({
      method: effectiveMethod,
      url: effectivePath,
      data,
      ...config,
    });
    return response?.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      clearToken();
    }
    throw error;
  }
};

export const get = (url, config) => {
  return send("get", url, null, config);
};

export const post = (url, data, config) => {
  return send("post", url, data, config);
};

export const put = (url, data, config) => {
  return httpRequest.put(url, data, config);
};

export const patch = (url, data, config) => {
  return httpRequest.patch(url, data, config);
};

export const del = (url, config) => {
  return send("delete", url, null, config);
};

export default {
  get,
  post,
  put,
  patch,
  del,
  clearToken,
};
