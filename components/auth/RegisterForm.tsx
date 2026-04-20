"use client";

import { useState } from "react";
import {  EyeOff, UserRound, Mail, Lock, Rocket } from "lucide-react";
import Link from "next/link";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="w-full max-w-md">
      
      {/* Title */}
      <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">
        Create Account
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Initialize your security console access.
      </p>

     {/* Social Buttons */}
      <div className="flex gap-3 mb-6">
        <button className="flex-1 border border-gray-200 text-gray-800 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-black transition">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
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
         <span className="text-taupe-950 dark:text-white"> Google</span>
        </button>
        <button className="flex-1 border border-gray-200 text-gray-800 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm hover:bg-gray-50  dark:hover:bg-black transition">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="dark:hidden">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="black" />
        </svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="hidden dark:block">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="white" />
        </svg>
      <span className="text-taupe-950 dark:text-white"> GitHub</span>
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center mb-6">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="px-4 text-gray-400 dark:text-gray-500 text-xs font-semibold tracking-widest uppercase">
          Verification Required
        </span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Full Name */}
      <div className="mb-4">
        <label className="block text-xs font-bold tracking-widest text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
          Full Name
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Ta lun Tun"
            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-400 transition text-sm pr-10"
          />
          <UserRound className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-xs font-bold tracking-widest text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
          Email
        </label>
        <div className="relative">
          <input
            type="email"
            placeholder="example@gmail.com"
            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-400 transition text-sm pr-10"
          />
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {/* Password */}
      <div className="mb-2">
        <label className="block text-xs font-bold tracking-widest text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-400 transition text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          >
            {showPassword ? <EyeOff size={16} /> : <Lock size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">
          Min. 12 characters with symbolic entropy.
        </p>
      </div>

      {/* Checkbox */}
      <div className="flex items-start gap-3 mb-6 mt-4">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-primary"
        />
        <label className="text-sm text-gray-500 dark:text-gray-400">
          I accept the{" "}
          <span className="text-primary font-semibold">Security Protocols</span>{" "}
          and{" "}
          <span className="text-primary font-semibold">Data Governance</span>.
        </label>
      </div>

      {/* Button */}
      <button
        disabled={!agreed}
        className="w-full bg-teal-400 hover:bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        Create Account <Rocket size={18} />
      </button>

      {/* Login */}
      <p className="text-center text-sm mt-6 text-gray-500 dark:text-gray-400">
        Already registered?{" "}
        <Link
          href="/login"
          className="text-primary font-semibold hover:text-teal-600"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}