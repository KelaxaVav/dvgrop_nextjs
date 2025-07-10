import { createSlice } from "@reduxjs/toolkit";
import { IUser } from "../types/user";

export interface UserState {
    users: IUser[],
    count:null
}

const initialState: UserState = {
    users: [],
    count: null
};

export const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUsers(state, action) {
            const { data, count } = action.payload;
            state.users = data;
            state.count =count;
        },
       
    }
})

export const { setUsers } = userSlice.actions;
export default userSlice.reducer;