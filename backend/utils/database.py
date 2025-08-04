import os

from supabase import Client, create_client

supabase_client: Client = None


def init_supabase():
    """Initialize Supabase client"""
    global supabase_client
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")

    if not url or not key:
        raise ValueError("Missing Supabase configuration. Check your .env file.")

    supabase_client = create_client(url, key)
    return supabase_client


def get_supabase_client():
    """Get the initialized Supabase client"""
    global supabase_client
    if supabase_client is None:
        init_supabase()
    return supabase_client


def get_service_role_client():
    """get Supabase client with service role (bypasses RLS)"""
    import os

    from supabase import create_client

    url = os.getenv("SUPABASE_URL")
    # You'll need to add this to .env
    service_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not url or not service_key:
        raise Exception("Missing Supabase URL or Service Key")

    return create_client(url, service_key)


def test_connection():
    """Test the database connection"""
    try:
        client = get_supabase_client()

        # Test connection by trying to access the auth user (this doesn't require any tables)
        # This is a simple way to verify the Supabase client is working
        client.auth.get_session()

        # If we get here without an exception, the connection is working
        return True, "Supabase connection successful"

    except Exception as e:
        return False, f"Connection failed: {e!s}"
