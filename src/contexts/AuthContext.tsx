import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Định nghĩa kiểu dữ liệu (Khớp với dữ liệu trả về từ FastAPI của bạn)
interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

// 2. Khởi tạo Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Tạo Provider để bọc ứng dụng (Đây chính là AuthProvider bị thiếu ở App.tsx)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Tránh chớp nháy giao diện khi reload

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập trước đó chưa bằng cách tìm token trong localStorage
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Lỗi đọc dữ liệu user", error);
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return null; // Hoặc một màn hình Loading tùy bạn

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom Hook để các trang khác gọi hàm login/logout dễ dàng hơn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};