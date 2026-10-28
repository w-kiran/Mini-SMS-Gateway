"use client";

import { useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { hydrate } from "@/store/slices/authSlice";
import { readAuth } from "@/lib/token";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrate(readAuth()));
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
