import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { apiFetch, serializeError, type SerializedApiError } from "@/lib/api";
import type { WalletResult } from "@/lib/types";

interface WalletState {
  credits: number | null;
  status: "idle" | "loading" | "failed";
  error: SerializedApiError | null;
}

const initialState: WalletState = {
  credits: null,
  status: "idle",
  error: null,
};

export const fetchWallet = createAsyncThunk<WalletResult, void, { state: RootState }>(
  "wallet/fetch",
  async (_arg, { getState, rejectWithValue }) => {
    try {
      return await apiFetch<WalletResult>("/wallet", { token: getState().auth.token });
    } catch (err) {
      return rejectWithValue(serializeError(err));
    }
  }
);

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.status = "idle";
        state.credits = action.payload.credits;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as SerializedApiError;
      });
  },
});

export default walletSlice.reducer;
