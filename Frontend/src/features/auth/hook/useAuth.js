import { useDispatch } from "react-redux";
import { register, login, getMe, logoutApi } from "../service/auth.api";
import { setUser, setLoading, setError, logout } from "../service/auth.slice";

export function useAuth() {
    const dispatch = useDispatch();

    async function handleRegister({ email, username, password }) {
        try {
            dispatch(setLoading(true));
            const data = await register({ email, username, password });
            return data;
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration failed"));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true));
            const data = await login({ email, password });
            dispatch(setUser(data.user));
            return data;
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Login failed"));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogout() {
        try {
            await logoutApi();
        } catch (_) {
            // Ignore server-side logout failures and clear local auth state anyway
        } finally {
            dispatch(logout());
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true));
            const data = await getMe();
            dispatch(setUser(data.user));
            return data;
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Failed to fetch user data"));
            dispatch(logout());
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout,
    };
}