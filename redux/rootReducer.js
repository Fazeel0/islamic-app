import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import themeReducer from "./slice/themeSlice";
import habitsReducer from "./slice/habitsSlice";

const rootReducer = combineReducers({
    auth: authReducer,
    theme: themeReducer,
    habits: habitsReducer,
})

export default rootReducer;
