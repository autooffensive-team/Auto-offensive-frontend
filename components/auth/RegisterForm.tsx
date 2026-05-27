"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { EyeOff, Lock, Mail, Rocket, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type RegisterFormState = {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  alias_name: string;
  avatar_profile: string;
};

const initialFormState: RegisterFormState = {
  username: "",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  alias_name: "",
  avatar_profile: "",
};

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<RegisterFormState>(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!agreed || pending) {
      return;
    }

    setPending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const registerPayload = {
        ...form,
        alias_name: form.alias_name.trim() || form.username.trim(),
        avatar_profile: form.avatar_profile.trim(),
      };

      const response = await fetch("/api/backend/users", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(registerPayload),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; detail?: string | { message?: string }[] }
        | null;

      if (!response.ok) {
        const detailText =
          typeof payload?.detail === "string"
            ? payload.detail
            : Array.isArray(payload?.detail)
              ? payload.detail
                  .map((item) => item.message)
                  .filter(Boolean)
                  .join(", ")
              : "";

        setErrorMessage(
          detailText || payload?.message || "Unable to create account. Please try again.",
        );
        return;
      }

      setSuccessMessage("Account created successfully. You can log in now.");
      setForm(initialFormState);
      setAgreed(false);

      const callbackUrl = searchParams.get("callbackUrl");
      const nextUrl =
        callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
          ? `/login?manual=1&prompt=login&callbackUrl=${encodeURIComponent(callbackUrl)}`
          : "/login?manual=1&prompt=login&callbackUrl=%2Fuserdashboard";

      window.setTimeout(() => {
        router.replace(nextUrl);
      }, 1200);
    } catch {
      setErrorMessage("Unable to reach the registration service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="mb-1 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        Create Account
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Initialize your security console access.
      </p>

      <div className="mb-6">
        <Link
          href="/login?manual=1"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9086c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9086-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1018-1.17.2827-1.71V4.9582H.9574C.3477 6.173 0 7.5482 0 9s.3477 2.827.9574 4.0418L3.964 10.71z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5814-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Link>
      </div>

      <div className="mb-6 flex items-center">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <span className="px-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Verification Required
        </span>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="taluntun"
              required
              autoComplete="username"
              className="w-full rounded-xl bg-slate-100 px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-teal-400 dark:bg-gray-800 dark:text-gray-200"
            />
            <UserRound className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="Ta"
              required
              autoComplete="given-name"
              className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-teal-400 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Tun"
              required
              autoComplete="family-name"
              className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-teal-400 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              required
              autoComplete="email"
              className="w-full rounded-xl bg-slate-100 px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-teal-400 dark:bg-gray-800 dark:text-gray-200"
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl bg-slate-100 px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-teal-400 dark:bg-gray-800 dark:text-gray-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Lock size={16} />}
            </button>
          </div>
          <p className="mt-1.5 text-center text-xs text-gray-400 dark:text-gray-500">
            Use at least 8 characters for your password.
          </p>
        </div>

        {errorMessage ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            {successMessage}
          </p>
        ) : null}

        <div className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary"
          />
          <label className="text-sm text-gray-500 dark:text-gray-400">
            I accept the{" "}
            <span className="font-semibold text-primary">Security Protocols</span> and{" "}
            <span className="font-semibold text-primary">Data Governance</span>.
          </label>
        </div>

        <button
          type="submit"
          disabled={!agreed || pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 py-3.5 font-semibold text-black disabled:opacity-50"
        >
          {pending ? "Creating Account..." : "Create Account"} <Rocket size={18} />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-teal-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
