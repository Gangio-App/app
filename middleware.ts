// This middleware file is kept for compatibility but doesn't do any URL-based localization
// All localization is now handled through the LanguageContext

export default function middleware() {
  // No-op middleware - we're not doing URL-based localization
  return;
}

export const config = {
  // Skip all paths
  matcher: []
};
