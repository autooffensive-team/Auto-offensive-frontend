import createMiddleware from 'next-intl/middleware';
import { routing } from './routing';

export default createMiddleware({
  ...routing,
  localeDetection: true
});

export const config = {
  matcher: ['/', '/(en|kh)/:path*']
};