import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { apiFetch, serializeError, type SerializedApiError } from "@/lib/api";
import type { SendResult } from "@/lib/types";

export interface SendPayload {
  to: string[];
  message: string;
  idempotencyKey: string;
}

interface SmsState {
  result: SendResult | null;
  status: "idle" | "loading" | "failed";
  error: SerializedApiError | null;
}

const initialState: SmsState = {
  result: null,
  status: "idle",
  error: null,
};

export const sendSms = createAsyncThunk<SendResult, SendPayload, { state: RootState }>(
  "sms/send",
  async (payload, { getState, rejectWithValue }) => {
    try {
      return await apiFetch<SendResult>("/sms/send", {
        method: "POST",
        token: getState().auth.token,
        body: { to: payload.to, message: payload.message },
        headers: { "Idempotency-Key": payload.idempotencyKey },
      });
    } catch (err) {
      return rejectWithValue(serializeError(err));
    }
  }
);

const smsSlice = createSlice({
  name: "sms",
  initialState,
  reducers: {
    resetSend(state) {
      state.result = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendSms.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.result = null;
      })
      .addCase(sendSms.fulfilled, (state, action) => {
        state.status = "idle";
        state.result = action.payload;
      })
      .addCase(sendSms.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as SerializedApiError;
      });
  },
});

export const { resetSend } = smsSlice.actions;
export default smsSlice.reducer;
