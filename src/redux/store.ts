import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { FLUSH, PAUSE, PERSIST, persistCombineReducers, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import { authSlice } from "./auth_slice";
import { customerSlice } from "./customer_slice";
import { loanSlice } from "./loan_slice";
import { paymentSlice } from "./payment_slice";
import { userSlice } from "./user_slice";
import { emailContactSlice } from "./email_contact_slice";
import { emailSyncConfigSlice } from "./email_sync_config_slice";

const persistConfig = {
  key: 'root',
  storage,
  blacklist: [
    'branch',
  ]
};

const persistedReducer = persistCombineReducers(persistConfig, {
  auth: authSlice.reducer,
  customer:customerSlice.reducer,
  loan:loanSlice.reducer,
  payment:paymentSlice.reducer,
  user:userSlice.reducer,
  emailContact:emailContactSlice.reducer,
  emailSyncConfig:emailSyncConfigSlice.reducer
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