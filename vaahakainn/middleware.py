"""
Adds security response headers (Content-Security-Policy, Permissions-Policy)
to every response. Implemented as a tiny middleware so we don't pull in an
extra dependency.

NOTE on the CSP: this codebase relies heavily on inline <script> blocks, inline
style="" attributes and inline event handlers (onclick / onmouseover), so
'unsafe-inline' is required for script-src/style-src — a nonce-only policy would
break the site. Even with 'unsafe-inline', the policy still meaningfully reduces
risk: it blocks scripts from untrusted external origins, blocks <object>/<embed>,
locks down <base>, restricts where forms can post, and controls who may frame the
site. frame-ancestors intentionally allows Telegram so the Mini App keeps working.
"""

# Sources the site genuinely uses:
#   - Telegram Mini App SDK:        https://telegram.org
#   - Google Fonts CSS:             https://fonts.googleapis.com
#   - Google Fonts files:           https://fonts.gstatic.com
#   - Cover images (Cloudinary) + inline data: SVGs
#   - Embedding in the Telegram Web client (iframe): https://*.telegram.org
CONTENT_SECURITY_POLICY = "; ".join([
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' https://telegram.org",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'self' https://*.telegram.org",
])

PERMISSIONS_POLICY = "camera=(), microphone=(), geolocation=(), interest-cohort=()"


class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # setdefault so we never clobber a header set elsewhere
        response.setdefault("Content-Security-Policy", CONTENT_SECURITY_POLICY)
        response.setdefault("Permissions-Policy", PERMISSIONS_POLICY)
        return response
