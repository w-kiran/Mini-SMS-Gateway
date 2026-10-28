"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { fetchWallet } from "@/store/slices/walletSlice";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const email = useAppSelector((state) => state.auth.email);
  const credits = useAppSelector((state) => state.wallet.credits);
  const walletStatus = useAppSelector((state) => state.wallet.status);

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  function onLogout() {
    dispatch(logout());
    router.replace("/login");
  }

  const creditText =
    credits === null ? (walletStatus === "loading" ? "…" : "–") : credits.toLocaleString();

  return (
    <header className="border-b border-slate-800 bg-slate-900/50">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">Mini SMS Gateway</h1>
          {email && <p className="truncate text-xs text-slate-400">{email}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm">
            <span className="text-slate-400">Credits </span>
            <span className="font-semibold text-indigo-300">{creditText}</span>
          </div>
          <Button variant="secondary" onClick={onLogout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
