import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, updateProfile as updateProfileApi } from "../api/authApi";

const AuthContext = createContext(null);

const parseUser = (data) => ({
    email: data.email,
    fullName: data.fullName,
    role: data.role,
    phone: data.phone ?? null,
    bio: data.bio ?? null,
    avatarGradient: data.avatarGradient ?? 'blue',
});

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

    const persistUser = (data) => {
        const parsed = parseUser(data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(parsed));
        setUser(parsed);
        return parsed;
    };

    const login = async (data) => {
        const response = await loginApi(data);
        persistUser(response.data);
        return response.data;
    };

    const updateUser = async (profileData) => {
        const response = await updateProfileApi(profileData);
        persistUser(response.data);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
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
