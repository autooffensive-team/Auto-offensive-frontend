"use client";

export default function GuestSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Basic settings for your guest session
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Theme Preferences
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Theme settings are available in the sidebar. Additional settings will be unlocked when you create an account.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-800/50">
            <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
              Limited Access
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Create an account to access advanced settings, preferences, and customization options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}