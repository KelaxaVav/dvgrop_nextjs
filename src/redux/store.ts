import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { FLUSH, PAUSE, PERSIST, persistCombineReducers, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import { authSlice } from "./auth_slice";

const persistConfig = {
  key: 'root',
  storage,
  blacklist: [
    'branch',
  ]
};

const persistedReducer = persistCombineReducers(persistConfig, {
  auth: authSlice.reducer,
});

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      immutableCheck: false,
    }),
})

export const persistor = persistStore(store);
export default store;