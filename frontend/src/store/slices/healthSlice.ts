import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { apiFetch, serializeError, type SerializedApiError } from "@/lib/api";
import type { RouteHealth } from "@/lib/types";

interface HealthState {
  routes: RouteHealth[];
  status: "idle" | "loading" | "failed";
  error: SerializedApiError | null;
}

const initialState: HealthState = {
  routes: [],
  status: "idle",
  error: null,
};

export const fetchRouteHealth = createAsyncThunk<{ routes: RouteHealth[] }, void, { state: RootState }>(
  "health/fetch",
  async (_arg, { getState, rejectWithValue }) => {
    try {
      return await apiFetch<{ routes: RouteHealth[] }>("/routes/health", {
        token: getState().auth.token,
      });
    } catch (err) {
      return rejectWithValue(serializeError(err));
    }
  }
);

const healthSlice = createSlice({
  name: "health",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRouteHealth.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRouteHealth.fulfilled, (state, action) => {
        state.status = "idle";
        state.routes = action.payload.routes;
      })
      .addCase(fetchRouteHealth.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as SerializedApiError;
      });
  },
});

export default healthSlice.reducer;
