import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import type {RootState} from "@store/store";

interface mainState {
    loading: boolean;
}

const initialState: mainState = {
    "loading": false,
};

const mainSlice = createSlice({
    "name": "main",
    initialState,
    "reducers": {
        "changeLoadingValue": (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

// Export all state in one object to have only to imports : Action and State.
export const mainState = {
    "Loading": (state: RootState) => state.main.loading,
};
export const mainActions = mainSlice.actions;
export default mainSlice.reducer;
