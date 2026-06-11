"use client";

export default function GuestSupport() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Support
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get help with your basic scanning experience
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Getting Started
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Learn how to use the basic scanning features available in guest mode.
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Run up to 3 scans per day</li>
            <li>• Basic vulnerability detection</li>
            <li>• Limited tool selection</li>
            <li>• No scan history storage</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Need More Help?
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            For advanced support and premium features, consider upgrading your account.
          </p>
          <div className="space-y-3">
            <a
              href="mailto:support@autooffensive.com"
              className="block rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50"
            >
              Contact Support
            </a>
            <a
              href="/docs"
              className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              View Documentation
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 dark:border-teal-800 dark:bg-teal-900/20">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-800/50">
            <svg className="h-4 w-4 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-teal-800 dark:text-teal-200">
              Upgrade for Premium Support
            </h3>
            <p className="text-sm text-teal-700 dark:text-teal-300">
              Get priority support, advanced features, and unlimited scanning with a premium account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}