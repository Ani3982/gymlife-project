"""
GymLife HTTP Security Headers Middleware
Injects defensive HTTP headers into every response to protect against
clickjacking, MIME-type sniffing, cross-site scripting (XSS), and data leakage.
"""

class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Defense against clickjacking
        response['X-Frame-Options'] = 'DENY'

        # Defense against MIME-sniffing
        response['X-Content-Type-Options'] = 'nosniff'

        # Modern Cross-Site Scripting protection filter
        response['X-XSS-Protection'] = '1; mode=block'

        # Referrer privacy policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Feature / Permissions Policy
        response['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'

        # Cross-Origin Opener Policy
        response['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'

        return response
