import axios from 'axios';

const api = axios.create({
  // Link chuẩn của Somee
  baseURL: 'https://anhvu-asp.somee.com/api', 
  headers: { 'Content-Type': 'application/json' }
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
          // VŨ KHÍ TỐI THƯỢNG: Dùng .set() để ép cứng Token vào Header
          if (config.headers && config.headers.set) {
              config.headers.set('Authorization', `Bearer ${token}`);
          } else {
              config.headers['Authorization'] = `Bearer ${token}`;
          }
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