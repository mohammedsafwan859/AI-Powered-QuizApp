import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// Helper function to set the auth token for all axios requests
const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null,
};

export const AuthContext = createContext(initialState);

const authReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload,
      };
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', payload.token);
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
        loading: false,
        error: null, // Clear any previous errors on success
      };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: payload,
      };
    // --- NEW: Action to clear errors ---
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token);
      loadUser();
    } else {
      setAuthToken(null);
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, [state.token]);

  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth');
      dispatch({ type: 'USER_LOADED', payload: res.data });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  const register = async formData => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    try {
      const res = await axios.post('/api/users/register', formData, config);
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR', payload: err.response.data.msg });
    }
  };

  const login = async formData => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    try {
      const res = await axios.post('/api/users/login', formData, config);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR', payload: err.response.data.msg });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  }

  // --- NEW: Function to clear errors ---
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        clearError, // --- NEW: Expose the clearError function ---
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};