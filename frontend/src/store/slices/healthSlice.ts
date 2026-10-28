import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { apiFetch, serializeError, type SerializedApiError } from "@/lib/api";
import type { RouteHealth } from "@/lib/types";

interface HealthState {
  routes: RouteHealth[];
  status: "idle" | "loading" | "failed";
  error: SerializedApiError | null;
  togglingId: string | null;
}

const initialState: HealthState = {
  routes: [],
  status: "idle",
  error: null,
  togglingId: null,
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

export const toggleRouteActive = createAsyncThunk<
  { id: string; active: boolean },
  { id: string; active: boolean },
  { state: RootState }
>("health/toggle", async ({ id, active }, { getState, dispatch, rejectWithValue }) => {
  try {
    const result = await apiFetch<{ id: string; name: string; active: boolean }>(`/routes/${id}`, {
      method: "PATCH",
      body: { active },
      token: getState().auth.token,
    });
    dispatch(fetchRouteHealth());
    return { id: result.id, active: result.active };
  } catch (err) {
    return rejectWithValue(serializeError(err));
  }
});

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
      })
      .addCase(toggleRouteActive.pending, (state, action) => {
        state.togglingId = action.meta.arg.id;
        state.error = null;
        const route = state.routes.find((r) => r.id === action.meta.arg.id);
        if (route) route.active = action.meta.arg.active;
      })
      .addCase(toggleRouteActive.fulfilled, (state, action) => {
        state.togglingId = null;
        const route = state.routes.find((r) => r.id === action.payload.id);
        if (route) route.active = action.payload.active;
      })
      .addCase(toggleRouteActive.rejected, (state, action) => {
        state.togglingId = null;
        state.error = action.payload as SerializedApiError;
        const id = action.meta.arg.id;
        const route = state.routes.find((r) => r.id === id);
        if (route) route.active = !action.meta.arg.active;
      });
  },
});

export default healthSlice.reducer;
