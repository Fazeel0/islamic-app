import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isGuest: true, // Track if user is in guest mode
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isGuest = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isGuest = false;
    },
    setGuest: (state) => {
      state.isGuest = true;
      state.user = null;
      state.token = null;
    }
  }
})

export const { login, logout, setGuest } = authSlice.actions;
export default authSlice.reducer;
