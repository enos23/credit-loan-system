import { createContext, useContext, useState, useEffect, use } from "react";
import { login as loginApi, register as registerApi } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false); 
    }, []);

    const login = async (data) => {
        const response = await loginApi(data);
        const { token, email, fullName, role } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ email, fullName, role }));
        setUser({ email, fullName, role });
        return response.data;
    };

    const register = async (data) => {
        const response = await registerApi(data);
        const { token, email, fullName, role } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ email, fullName, role }));
        setUser({ email, fullName, role });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth must be used within AuthProvider');
  return context;
};