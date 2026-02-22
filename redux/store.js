import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import rootReducer from "./rootReducer";

const getStorage = () => {
    if (Platform.OS === 'web') {
        return require('redux-persist/lib/storage').default;
    }
    return AsyncStorage
};

const persistConfig = {
    key : 'root',
    storage : getStorage(),
    whitelist : ['auth', 'theme', 'habits']
}

const persistedReducer = persistReducer(
    persistConfig,
    rootReducer
)

export const store = configureStore({
    reducer : persistedReducer,
    middleware : (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck : false
        })
})

export const persistor = persistStore(store);
