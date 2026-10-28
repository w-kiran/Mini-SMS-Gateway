import { configureStore } from "@reduxjs/toolkit";
import { setUnauthorizedHandler } from "@/lib/api";
import authReducer, { logout } from "./slices/authSlice";
import walletReducer from "./slices/walletSlice";
import smsReducer from "./slices/smsSlice";
import logsReducer from "./slices/logsSlice";
import healthReducer from "./slices/healthSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    sms: smsReducer,
    logs: logsReducer,
    health: healthReducer,
  },
});

// Any 401 from the API drops the session so guards send the user back to login.
setUnauthorizedHandler(() => {
  store.dispatch(logout());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
