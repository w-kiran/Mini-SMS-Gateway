import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { apiFetch, serializeError, type SerializedApiError } from "@/lib/api";
import type { LogFilters, LogsPage, Message } from "@/lib/types";

export const defaultFilters: LogFilters = { page: 1, limit: 20 };

interface LogsState {
  items: Message[];
  page: number;
  limit: number;
  total: number;
  filters: LogFilters;
  status: "idle" | "loading" | "failed";
  error: SerializedApiError | null;
}

const initialState: LogsState = {
  items: [],
  page: 1,
  limit: 20,
  total: 0,
  filters: defaultFilters,
  status: "idle",
  error: null,
};

export const fetchLogs = createAsyncThunk<LogsPage, LogFilters, { state: RootState }>(
  "logs/fetch",
  async (filters, { getState, rejectWithValue }) => {
    const params = new URLSearchParams();
    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));
    if (filters.status) params.set("status", filters.status);
    if (filters.recipient) params.set("recipient", filters.recipient);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);

    try {
      return await apiFetch<LogsPage>(`/sms/logs?${params.toString()}`, {
        token: getState().auth.token,
      });
    } catch (err) {
      return rejectWithValue(serializeError(err));
    }
  }
);

const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<LogFilters>) {
      state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.total = action.payload.total;
        state.filters = action.meta.arg;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as SerializedApiError;
      });
  },
});

export const { setFilters } = logsSlice.actions;
export default logsSlice.reducer;
