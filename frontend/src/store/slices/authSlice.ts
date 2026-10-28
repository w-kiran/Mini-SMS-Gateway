import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { apiFetch, serializeError, type SerializedApiError } from "@/lib/api";
import { clearAuth, saveAuth, type StoredAuth } from "@/lib/token";
import type { LoginResult, RegisterResult } from "@/lib/types";

export interface AuthState {
  token: string | null;
  email: string | null;
  hydrated: boolean;
  status: "idle" | "loading" | "failed";
  error: SerializedApiError | null;
}

const initialState: AuthState = {
  token: null,
  email: null,
  hydrated: false,
  status: "idle",
  error: null,
};

export const register = createAsyncThunk<RegisterResult, { email: string; password: string }>(
  "auth/register",
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await apiFetch<RegisterResult>("/auth/register", {
        method: "POST",
        body: credentials,
      });
      saveAuth(result.token, result.user.email);
      return result;
    } catch (err) {
      return rejectWithValue(serializeError(err));
    }
  }
);

export const login = createAsyncThunk<LoginResult, { email: string; password: string }>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await apiFetch<LoginResult>("/auth/login", {
        method: "POST",
        body: credentials,
      });
      saveAuth(result.token, credentials.email);
      return result;
    } catch (err) {
      return rejectWithValue(serializeError(err));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<StoredAuth>) {
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.hydrated = true;
    },
    logout(state) {
      state.token = null;
      state.email = null;
      state.status = "idle";
      state.error = null;
      clearAuth();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "idle";
        state.token = action.payload.token;
        state.email = action.payload.user.email;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as SerializedApiError) ?? {
          status: 0,
          code: "UNKNOWN",
          message: "Registration failed",
        };
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle";
        state.token = action.payload.token;
        state.email = action.meta.arg.email;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as SerializedApiError) ?? {
          status: 0,
          code: "UNKNOWN",
          message: "Login failed",
        };
      });
  },
});

export const { hydrate, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
