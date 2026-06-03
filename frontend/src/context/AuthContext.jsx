import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, updateProfile as updateProfileApi } from "../api/authApi";
import { getPreferences } from "../api/userPreferencesApi";

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
    const [preferences, setPreferences] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const prefsData = localStorage.getItem('preferences');
        if (token && userData) {
            setUser(JSON.parse(userData));
            if (prefsData) setPreferences(JSON.parse(prefsData));
            // Refresh preferences from server in the background — handles changes
            // made on another device or via direct DB edit.
            getPreferences()
                .then(res => persistPreferences(res.data))
                .catch(() => { /* preferences are optional — UI uses defaults if missing */ });
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

    const persistPreferences = (prefs) => {
        localStorage.setItem('preferences', JSON.stringify(prefs));
        setPreferences(prefs);
    };

    const login = async (data) => {
        const response = await loginApi(data);
        persistUser(response.data);
        // Pull preferences for this user; fire-and-forget so login isn't blocked.
        getPreferences()
            .then(res => persistPreferences(res.data))
            .catch(() => { /* defaults will be used */ });
        return response.data;
    };

    const updateUser = async (profileData) => {
        const response = await updateProfileApi(profileData);
        persistUser(response.data);
        return response.data;
    };

    const updatePreferencesInContext = (prefs) => {
        persistPreferences(prefs);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('preferences');
        setUser(null);
        setPreferences(null);
    };

    return (
        <AuthContext.Provider value={{ user, preferences, login, logout, updateUser, updatePreferencesInContext, loading }}>
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
