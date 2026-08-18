"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DepositPanel } from "@/components/DepositPanel";
import { useLanguage } from "@/components/LanguageProvider";
import {
  getRecoveryToken,
  saveRecoveryToken,
  saveRift,
  validId,
  validToken,
} from "@/lib/rift-history";
import type { Shift } from "@/lib/sideshift-shared";

export function RiftStatusClient({ id }: { id: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [shift, setShift] = useState<Shift | null>(null);
  const [state, setState] = useState<"loading" | "missing" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function load() {
      if (!validId(id)) {
        setState("error");
        return;
      }

      const fragmentToken = new URLSearchParams(
        window.location.hash.slice(1),
      ).get("token");
      const token = validToken(fragmentToken)
        ? fragmentToken
        : getRecoveryToken(id);

      if (!token) {
        setState("missing");
        return;
      }

      saveRecoveryToken(id, token);
      if (window.location.hash) {
        window.history.replaceState(null, "", `/rift/${encodeURIComponent(id)}`);
      }

      try {
        const response = await fetch(`/api/shift/${encodeURIComponent(id)}`, {
          headers: { "x-rift-shift-token": token },
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) throw new Error("status unavailable");
        if (!active) return;
        const next = { ...(data as Shift), pollToken: token };
        saveRift(next);
        setShift(next);
      } catch {
        if (active) setState("error");
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [id]);

  if (shift) {
    return (
      <DepositPanel
        shift={shift}
        onBack={() => router.push("/")}
        onRefresh={(next) => {
          const updated = { ...next, pollToken: shift.pollToken };
          saveRift(updated);
          setShift(updated);
        }}
      />
    );
  }

  return (
    <main className="rift-status-message">
      <p className="docs-kicker">Private Rift</p>
      <h1>
        {state === "loading"
          ? t("loadingRift")
          : state === "missing"
            ? t("missingToken")
            : t("riftUnavailable")}
      </h1>
      <p>{id}</p>
      <Link className="nav-button" href="/rift">
        {t("riftsTitle")}
      </Link>
    </main>
  );
}
