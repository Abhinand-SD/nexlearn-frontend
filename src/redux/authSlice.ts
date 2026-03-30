import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface User {
  id?: string;
  name?: string;
  mobile?: string;
  email?: string;
  profile_image?: string;
  qualification?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
}

const initialState: AuthState = {
  isAuthenticated: !!Cookies.get('access_token'),
  accessToken: Cookies.get('access_token') || null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      Cookies.set('access_token', action.payload.accessToken, { expires: 1 }); // 1 day Example expiration
      if (action.payload.refreshToken) {
        Cookies.set('refresh_token', action.payload.refreshToken, { expires: 30 });
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logoutUser: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
    },
  },
});

export const { setCredentials, setUser, logoutUser } = authSlice.actions;

export default authSlice.reducer;
