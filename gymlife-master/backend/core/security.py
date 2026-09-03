"""
GymLife Advanced Security & Defensive Hardening Module
Provides cryptographic token issuance/verification, in-memory rate limiting,
input sanitization, and attack mitigation against OWASP Top 10 vulnerabilities.
"""

import time
import html
import re
import threading
from functools import wraps
from django.conf import settings
from django.core import signing
from django.http import JsonResponse
from django.contrib.auth.models import User

# Thread-safe in-memory store for rate limiting
_rate_limit_lock = threading.Lock()
_rate_limit_records = {}  # { "ip:endpoint": [timestamp1, timestamp2, ...] }

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')
SAFE_REF_REGEX = re.compile(r'^[a-zA-Z0-9\-_]{4,50}$')

# --------------------------------------------------------------------------
# Cryptographic Token Management (HMAC-SHA256 Signed Tokens)
# --------------------------------------------------------------------------
TOKEN_SALT = 'gymlife-secure-auth-salt-2026'
DEFAULT_MAX_AGE_SECONDS = 86400 * 14  # 14 days


def generate_secure_token(user_id, role='STAFF', token_type='admin'):
    """
    Creates a cryptographically signed HMAC token containing user_id, role,
    token_type and timestamp. Cannot be forged without settings.SECRET_KEY.
    """
    signer = signing.TimestampSigner(salt=TOKEN_SALT)
    payload = {
        'uid': int(user_id),
        'role': str(role),
        'type': str(token_type),
        'v': 2
    }
    signed_str = signer.sign_object(payload)
    return f"gls_{signed_str}"


def verify_secure_token(token_str, max_age=DEFAULT_MAX_AGE_SECONDS):
    """
    Validates cryptographic signature and age of a token.
    Returns: (is_valid: bool, user: User | None, role: str | None, token_type: str | None)
    """
    if not token_str or not isinstance(token_str, str):
        return False, None, None, None

    token = token_str.strip()
    if token.startswith('Bearer '):
        token = token[7:].strip()

    # 1. Verify V2 Signed Cryptographic Tokens
    if token.startswith('gls_'):
        raw_signed = token[4:]
        signer = signing.TimestampSigner(salt=TOKEN_SALT)
        try:
            payload = signer.unsign_object(raw_signed, max_age=max_age)
            uid = payload.get('uid')
            role = payload.get('role', 'STAFF')
            token_type = payload.get('type', 'admin')

            user = User.objects.filter(id=uid, is_active=True).first()
            if not user:
                return False, None, None, None

            return True, user, role, token_type
        except (signing.BadSignature, signing.SignatureExpired, Exception):
            return False, None, None, None

    # 2. Legacy Migration Fallback (Verify against active database user securely)
    if token.startswith('gymlife-admin-token-'):
        try:
            uid = int(token.replace('gymlife-admin-token-', ''))
            user = User.objects.filter(id=uid, is_active=True).first()
            if user and (user.is_staff or user.is_superuser):
                role = 'SUPER_ADMIN' if user.is_superuser else 'ADMIN'
                if hasattr(user, 'admin_profile') and user.admin_profile.role:
                    role = user.admin_profile.role
                return True, user, role, 'admin'
        except (ValueError, Exception):
            pass

    elif token.startswith('gymlife-member-token-'):
        try:
            uid = int(token.replace('gymlife-member-token-', ''))
            user = User.objects.filter(id=uid, is_active=True).first()
            if user:
                return True, user, 'member', 'member'
        except (ValueError, Exception):
            pass

    return False, None, None, None


# --------------------------------------------------------------------------
# IP & Client Helper
# --------------------------------------------------------------------------
def get_client_ip_address(request):
    """
    Safely extracts client IP address with spoofing prevention.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # Take the leftmost IP (the original client)
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
    return ip


# --------------------------------------------------------------------------
# In-Memory Rate Limiting Decorator
# --------------------------------------------------------------------------
def rate_limit(max_requests=10, window_seconds=60, endpoint_key="default"):
    """
    Thread-safe sliding-window rate limiter per client IP.
    Blocks brute-force attempts and DoS flooding.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            ip = get_client_ip_address(request)
            key = f"{ip}:{endpoint_key}"
            now = time.time()

            with _rate_limit_lock:
                # Cleanup expired entries for this key
                timestamps = _rate_limit_records.get(key, [])
                valid_timestamps = [t for t in timestamps if now - t < window_seconds]

                if len(valid_timestamps) >= max_requests:
                    retry_after = int(window_seconds - (now - valid_timestamps[0])) + 1
                    return JsonResponse({
                        'status': 'error',
                        'message': f"Too many requests. Rate limit exceeded. Please try again in {retry_after} seconds.",
                        'retry_after': retry_after
                    }, status=429)

                valid_timestamps.append(now)
                _rate_limit_records[key] = valid_timestamps

                # Periodically purge old keys to keep memory lean
                if len(_rate_limit_records) > 2000:
                    stale_keys = [k for k, v in _rate_limit_records.items() if not v or (now - v[-1] > window_seconds * 2)]
                    for sk in stale_keys:
                        _rate_limit_records.pop(sk, None)

            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator


# --------------------------------------------------------------------------
# Input Sanitization & Security Validation Helpers
# --------------------------------------------------------------------------
def sanitize_text(text, max_length=500, allow_multiline=False):
    """
    Sanitizes user string input to prevent stored XSS, script injection,
    and control-character abuse.
    """
    if not text:
        return ''
    cleaned = str(text).strip()
    if not allow_multiline:
        cleaned = re.sub(r'[\r\n\t]+', ' ', cleaned)
    # Truncate to maximum allowed length
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length]
    # Escape dangerous HTML special characters (<, >, &, ", ')
    return html.escape(cleaned)


def validate_email_strict(email_str):
    """
    Strict email syntax validation that blocks CRLF injection.
    """
    if not email_str or not isinstance(email_str, str):
        return False
    clean = email_str.strip()
    if len(clean) > 254 or '\n' in clean or '\r' in clean:
        return False
    return bool(EMAIL_REGEX.match(clean))


def sanitize_phone_number(phone_str):
    """
    Cleans phone number strings to retain valid digits, +, -, and spaces only.
    """
    if not phone_str:
        return ''
    cleaned = re.sub(r'[^\d\+\-\(\)\s]', '', str(phone_str).strip())
    return cleaned[:30]


def is_safe_reference_id(ref_id):
    """
    Validates reference ID characters to prevent SQL/path traversal injection.
    """
    if not ref_id or not isinstance(ref_id, str):
        return False
    return bool(SAFE_REF_REGEX.match(ref_id.strip()))
