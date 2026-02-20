import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import themeReducer from "./slice/themeSlice";

const rootReducer = combineReducers({
    auth: authReducer,
    theme: themeReducer,
})

export default rootReducer;
