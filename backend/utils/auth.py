from functools import wraps
from flask import request, jsonify, current_app
from utils.database import get_supabase_client, get_service_role_client
import jwt
import os


def get_auth_token():
    """Extract auth token from request headers"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None

    # Expected format: "Bearer <token>"
    try:
        return auth_header.split(' ')[1]
    except IndexError:
        return None


def verify_token(token):
    """Verify JWT token with Supabase"""
    try:
        supabase = get_supabase_client()

        # Verify the token with Supabase
        response = supabase.auth.get_user(token)

        if response.user:
            return response.user
        else:
            return None

    except Exception as e:
        print(f"Token verification error: {e}")
        return None


def require_auth(f):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_auth_token()

        if not token:
            return jsonify({'error': 'No token provided'}), 401

        user = verify_token(token)
        if not user:
            return jsonify({'error': 'Invalid token'}), 401

        # Add user to request context
        request.current_user = user
        return f(*args, **kwargs)

    return decorated_function


def get_or_create_user_profile(auth_user, access_token=None):
    """Get or create user profile in our custom Users table"""
    try:
        # Use service role for querying to bypass RLS during login
        # In production, you might want to create a separate client with the user's token
        service_supabase = get_service_role_client()

        # Check if user profile exists
        result = service_supabase.table('Users').select(
            '*').eq('auth_id', auth_user.id).execute()

        if result.data:
            return result.data[0]

        # Create new user profile if it doesn't exist
        user_data = {
            'auth_id': auth_user.id,
            'email': auth_user.email,
            # Default username from email
            'username': auth_user.email.split('@')[0],
            'email_verified': auth_user.email_confirmed_at is not None
        }

        result = service_supabase.table('Users').insert(user_data).execute()
        return result.data[0] if result.data else None

    except Exception as e:
        print(f"Error getting/creating user profile: {e}")
        return None
