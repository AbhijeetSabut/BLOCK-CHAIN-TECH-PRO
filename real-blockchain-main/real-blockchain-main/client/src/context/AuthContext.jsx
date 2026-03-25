import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { fetchCurrentUser, loginUser, registerUser } from "../lib/api.js";

const STORAGE_KEY = "secure-file-share-session";
const AuthContext = createContext(null);

const readStoredSession = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: "", user: null };
  } catch (_error) {
    return { token: "", user: null };
  }
};

function persistSession(nextSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [loading, setLoading] = useState(Boolean(readStoredSession().token));

  useEffect(() => {
    const syncSession = async () => {
      if (!session.token) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchCurrentUser(session.token);

        setSession((currentSession) => {
          const nextSession = {
            ...currentSession,
            user: data.user
          };

          persistSession(nextSession);
          return nextSession;
        });
      } catch (_error) {
        window.localStorage.removeItem(STORAGE_KEY);
        setSession({ token: "", user: null });
      } finally {
        setLoading(false);
      }
    };

    syncSession();
  }, [session.token]);

  const updateSession = (nextSession) => {
    setSession(nextSession);
    persistSession(nextSession);
  };

  const register = async (payload) => {
    const data = await registerUser(payload);
    updateSession(data);
    return data;
  };

  const login = async (payload) => {
    const data = await loginUser(payload);
    updateSession(data);
    return data;
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession({ token: "", user: null });
  };

  const value = {
    token: session.token,
    user: session.user,
    loading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
};
