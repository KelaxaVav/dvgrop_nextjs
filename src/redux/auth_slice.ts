import { createSlice } from "@reduxjs/toolkit";

export interface AuthState {
    user: Record<string, any> | null;
    token: string | null;
     permissions: string[]
}

const initialState: AuthState = {
    user: null,
    token: null,
     permissions: [],
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth(state, action) {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.permissions = user.permissions || [];  
        },
        logout(state) {
            state.user = null;
            state.token = null;
        },
    },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
