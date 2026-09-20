"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { AuthError, register, signIn } from "@/lib/api/auth";
import { BRAND } from "@/lib/brand";

type Mode = "signin" | "register";

const MIN_PASSWORD_LENGTH = 12;

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="max-w-sm mx-auto px-4 py-16 text-sm text-text-subtle">Loading…</div>}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = params?.get("next") ?? "/learn";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "register") {
        await register(email, displayName, password);
      } else {
        await signIn(email, password);
      }
      await refresh();
      router.push(next);
    } catch (caught) {
      setError(
        caught instanceof AuthError
          ? caught.message
          : "Could not reach the server. Is the API running?",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-xl font-bold tracking-tight text-text mb-1">
        {mode === "signin" ? "Sign in" : `Join ${BRAND.name}`}
      </h1>
      <p className="text-[13px] text-text-muted mb-6">
        {mode === "signin"
          ? "Signing in lets you run code and keep your progress."
          : "New accounts start as learners: read every lesson, drive the visuals, and run the code each lesson ships."}
      </p>

      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && (
          <Field
            label="Display name"
            value={displayName}
            onChange={setDisplayName}
            autoComplete="name"
            required
            minLength={2}
          />
        )}

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />

        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
          minLength={mode === "register" ? MIN_PASSWORD_LENGTH : 1}
          hint={
            mode === "register"
              ? `At least ${MIN_PASSWORD_LENGTH} characters, mixing letters with numbers or symbols.`
              : undefined
          }
        />

        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger-soft border border-danger-border">
            <AlertCircle className="w-4 h-4 mt-0.5 text-danger shrink-0" aria-hidden="true" />
            <p className="text-[12px] text-text-muted">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                     bg-accent text-text-inverse text-sm font-semibold hover:bg-accent-hover
                     disabled:opacity-60 transition-colors"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-[13px] text-text-subtle">
        {mode === "signin" ? "No account yet? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => { setMode(mode === "signin" ? "register" : "signin"); setError(null); }}
          className="text-accent hover:text-accent-hover font-medium"
        >
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>

      <p className="mt-6 text-[12px] text-text-subtle">
        You can read every lesson without an account.{" "}
        <Link href="/learn" className="text-accent hover:text-accent-hover">
          Browse the curriculum →
        </Link>
      </p>
    </div>
  );
}

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
}> = ({ label, value, onChange, type = "text", autoComplete, required, minLength, hint }) => (
  <label className="block">
    <span className="block text-xs font-medium text-text mb-1">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      autoComplete={autoComplete}
      required={required}
      minLength={minLength}
      className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text
                 placeholder:text-text-subtle focus:border-accent outline-none transition-colors"
    />
    {hint && <span className="block text-[11px] text-text-subtle mt-1">{hint}</span>}
  </label>
);
