"use client";

import { NextIntlClientProvider } from 'next-intl';

export default function IntlProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider>
      {children}
    </NextIntlClientProvider>
  );
}