import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'https://localhost:7173/api'
});

// Interceptor chặn request để nhét Token
api.interceptors.request.use(
  (config) => {
    try {
      // 1. Lấy chuỗi JSON từ túi 'user'
      const userStr = localStorage.getItem('user');
      
      if (userStr) {
        // 2. Phá băng chuỗi JSON để thành Object
        const userData = JSON.parse(userStr);
        
        // 3. Lấy Token ra
        const token = userData.token;

        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        console.warn('⚠️ Không tìm thấy thông tin đăng nhập [user] trong localStorage!');
      }
    } catch (err) {
      console.error('❌ Lỗi khi đọc Token:', err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor bắt lỗi 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('🚨 Lỗi 401: Backend từ chối Token hoặc Token đã hết hạn!');
    }
    return Promise.reject(error);
  }
);

export default api;
