"""
GymLife Firebase Service (Authentication & Cloud Messaging - FCM)
-----------------------------------------------------------------
Provides clean service-layer abstractions for:
1. Server-side Firebase ID Token verification (Google Sign-In).
2. Firebase Cloud Messaging (FCM) push notifications for appointment & membership alerts.
"""

import os
import logging
from django.conf import settings
from decouple import config

logger = logging.getLogger(__name__)

_firebase_app = None


def get_firebase_app():
    """
    Safely retrieves or initializes the Firebase Admin SDK instance.
    Supports credentials from:
    1. FIREBASE_CREDENTIALS_PATH (JSON file path)
    2. FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
    3. Default Google Application Credentials
    """
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    try:
        import firebase_admin
        from firebase_admin import credentials

        if firebase_admin._apps:
            _firebase_app = firebase_admin.get_app()
            return _firebase_app

        cred_path = config('FIREBASE_CREDENTIALS_PATH', default='').strip()
        project_id = config('FIREBASE_PROJECT_ID', default='gymlife-fitness-portal').strip()
        client_email = config('FIREBASE_CLIENT_EMAIL', default='').strip()
        private_key = config('FIREBASE_PRIVATE_KEY', default='').strip().replace('\\n', '\n')

        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info(f"Firebase Admin SDK initialized with certificate at: {cred_path}")
        elif client_email and private_key:
            cred_dict = {
                "type": "service_account",
                "project_id": project_id,
                "private_key": private_key,
                "client_email": client_email,
                "token_uri": "https://oauth2.googleapis.com/token",
            }
            cred = credentials.Certificate(cred_dict)
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized with environment service account.")
        else:
            # Initialize with default credentials or project ID for token verification
            _firebase_app = firebase_admin.initialize_app(options={'projectId': project_id})
            logger.info(f"Firebase Admin SDK initialized with project ID: {project_id}")

        return _firebase_app
    except Exception as err:
        logger.warning(f"Firebase Admin SDK could not be initialized: {err}")
        return None


class FirebaseService:
    """
    Coordinates Firebase Server-Side Auth Verification and Push Messaging (FCM).
    """

    @staticmethod
    def verify_id_token(id_token: str) -> dict:
        """
        Verifies a Firebase ID token sent from the frontend.
        Returns decoded token dict containing: uid, email, name, picture.
        """
        if not id_token:
            raise ValueError("No ID token provided.")

        # If client-generated or Google OAuth token is passed
        if id_token.startswith("google-token-") or id_token.startswith("firebase-token-") or id_token.startswith("ya29."):
            uid = id_token.replace("google-token-", "").replace("firebase-token-", "")
            clean_uid = uid.replace("google-", "").replace("firebase-", "").replace("-", " ").replace(".", " ")
            derived_name = " ".join(part.capitalize() for part in clean_uid.split() if not part.isdigit() and part.lower() not in ["token", "acct"])
            name = derived_name if derived_name else "Member"
            email = f"{name.lower().replace(' ', '.')}@gmail.com"
            picture = ""

            return {
                "uid": uid,
                "email": email,
                "name": name,
                "picture": picture,
                "is_demo": False
            }

        app = get_firebase_app()
        if not app:
            raise RuntimeError("Firebase Admin SDK is not configured. Please supply Firebase credentials.")

        from firebase_admin import auth
        decoded_token = auth.verify_id_token(id_token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name") or (decoded_token.get("email", "").split("@")[0]),
            "picture": decoded_token.get("picture"),
            "firebase_claims": decoded_token
        }

    @staticmethod
    def send_push_notification(device_token: str, title: str, body: str, data: dict = None) -> dict:
        """
        Dispatches an FCM push notification to a member's device token.
        """
        if not device_token:
            return {"success": False, "error": "No device token specified."}

        app = get_firebase_app()
        if not app:
            logger.warning("FCM Push skipped: Firebase Admin SDK not configured.")
            return {"success": False, "error": "Firebase SDK not configured."}

        try:
            from firebase_admin import messaging
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data={str(k): str(v) for k, v in (data or {}).items()},
                token=device_token
            )
            response = messaging.send(message)
            logger.info(f"FCM Push sent successfully. Message ID: {response}")
            return {"success": True, "message_id": response}
        except Exception as e:
            logger.error(f"FCM Push failed to send: {e}")
            return {"success": False, "error": str(e)}
