from utils.database import init_supabase, test_connection, get_supabase_client, get_service_role_client
from utils.auth import require_auth, get_or_create_user_profile
from config import Config, config
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
import os

# loads environment variables
load_dotenv()

app = Flask(__name__)

# load configuration
config_name = os.getenv('FLASK_ENV', 'development')
# enable cors for frontend communication
app.config.from_object(config[config_name])

jwt = JWTManager(app) 
CORS(app)

# initialize supabase connection
try:
    init_supabase()
    print("Supabase connection initialized successfully")
except Exception as e:
    print(f"Failed to initialize Supabase: {e}")


# basic health check route
@app.route('/api/health')
def health_check():
    """Enhanced health check endpoint with database connectivity"""
    db_connected, db_message = test_connection()

    return jsonify({
        'message': 'SwampScheduler backend is running!',
        'status': 'healthy',
        'app': 'swampscheduler',
        'version': '0.1.0',
        'database': {
            'connected': db_connected,
            'message': db_message
        },
        'environment': os.getenv('FLASK_ENV', 'development')
    })


@app.route('/api/auth/register', methods=['POST'])
def register():
    """register new user account"""
    try:
        data = request.get_json()

        # validate required fields
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        major = data.get('major')
        year = data.get('year')
        first_name = data.get('firstName')
        last_name = data.get('lastName')

        # validate required fields
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        if not username:
            return jsonify({'error': 'Username is required'}), 400

        supabase = get_supabase_client()

        # check if username already exists
        existing_username = supabase.table("Users").select(
            "username").eq("username", username).execute()
        if existing_username.data:
            return jsonify({'error': 'Username already exists'}), 400

        # create user with Supabase Auth (this handles password hashing, etc.)
        auth_response = supabase.auth.sign_up({
            'email': email,
            'password': password
        })

        if not auth_response.user:
            return jsonify({'error': 'Failed to create auth user'}), 400

        service_supabase = get_service_role_client()

        # create user profile in users table
        user_profile_data = {
            'auth_id': auth_response.user.id,  # link to supabase auth
            'email': email,
            'username': username,
            'major': major,
            'year': year,
            'first_name': first_name,
            'last_name': last_name,
            'email_verified': False  # will be true after email confirmation
        }

        # insert into our custom users table
        profile_response = service_supabase.table(
            "Users").insert(user_profile_data).execute()

        if profile_response.data:
            return jsonify({
                'message': 'User successfully created',
                'user': {
                    'id': profile_response.data[0]['id'],
                    'email': email,
                    'username': username,
                    'major': major,
                    'year': year,
                    'first_name': first_name,
                    'last_name': last_name
                },
                'access_token': auth_response.session.access_token if auth_response.session else None,
                'note': 'Please check your email to verify your account'
            }), 201
        else:
            return jsonify({'error': 'Failed to create user profile'}), 400

    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """authenticate user login"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        supabase = get_supabase_client()

        # authenticate with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            'email': email,
            'password': password
        })

        if not auth_response.user:
            return jsonify({'error': 'Invalid credentials'}), 401

        print(f"Auth successful for user: {auth_response.user.id}")

        # bypass RLS to get the user profile
        try:
            service_supabase = get_service_role_client()
            user_profile_response = service_supabase.table('Users').select(
                '*').eq('auth_id', auth_response.user.id).execute()

            print(f"User profile query result: {user_profile_response.data}")

            if user_profile_response.data:
                user_profile = user_profile_response.data[0]
                print(f"Found user profile: {user_profile}")
            else:
                print("No user profile found")
                return jsonify({'error': 'User profile not found'}), 404

        except Exception as profile_error:
            print(f"Profile retrieval error: {profile_error}")
            return jsonify({'error': 'Profile retrieval failed', 'details': str(profile_error)}), 500

        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user_profile['id'],
                'email': user_profile['email'],
                'username': user_profile['username'],
                'major': user_profile.get('major'),
                'year': user_profile.get('year'),
                'first_name': user_profile.get('first_name'),
                'last_name': user_profile.get('last_name'),
                'email_verified': user_profile['email_verified']
            },
            'access_token': auth_response.session.access_token
        }), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """logout user session"""
    try:
        supabase = get_supabase_client()

        # get the authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No valid authorization token provided'}), 401

        # sign out from supabase
        supabase.auth.sign_out()

        return jsonify({'message': 'Logout successful'}), 200

    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({'error': 'Logout failed', 'details': str(e)}), 500


# todo: implement task management routes
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """get all tasks for authenticated user - todo: implement task retrieval"""
    # todo: verify auth token
    # todo: get user id from token
    # todo: query tasks from database
    # todo: return tasks with proper formatting
    return jsonify({'message': 'get tasks endpoint - todo: implement'}), 501


@app.route('/api/tasks', methods=['POST'])
@jwt_required()
def create_task():
    """create new task - todo: implement task creation"""
#TODO: have some sort of health check print statement for python terminal
        # like "task completed successfully"

    # gets data from app.js task logic
    data = request.get_json()
    print("Parsed JSON data:", data)

    if not data:
        return jsonify({'error': 'No JSON data received'}), 400

    title=data.get('title')
    description=data.get('description')
    due_date=data.get('due_date')
    priority=data.get('priority')
    create_date=data.get('create_date')

    # checks for title, description, and priority
    if not title or not description or not due_date or not priority:
        return jsonify({'error': 'Missing required fields'}), 400

    auth_id = get_jwt_identity()
    service_supabase = get_service_role_client()
    user_response = service_supabase.table('Users').select('id').eq('auth_id', auth_id).execute()

    print(f"User profile query result: {user_response.data}")

    if user_response.data:
        user_profile = user_response.data[0]
        print(f"Found user profile: {user_profile}")
    else:
        print("No user profile found")
        return jsonify({'error': 'User profile not found'}), 404
    
    user_id = user_response.data[0]['id']

    task_data = {
        'user_id' : user_id,
        'title' : title,
        'description' : description,
        'due_date' : due_date,
        'priority' : priority,
        'completed' : False,
        'create_date' : create_date,
        'updated_date' : create_date, # the last time task would have been updated was on creation
        'completed_date' : None
    }

    # inserts task_data into tasks DB schema
    try:
        task_response = service_supabase.table("Tasks").insert(task_data).execute()

        if task_response.data:
            return jsonify({
                'message': 'Task created successfully',
                'task': task_response.data[0]
            }), 201
        else:
            return jsonify({'error': 'Error inserting task'}), 500
    
    except Exception as e:
        # returns error
        print(f"Error inserting task: {e}")
        return jsonify({'error': 'Internal Error', 'details':str(e)}), 500


@app.route('/api/tasks', methods=['GET'])
@jwt_required
def get_tasks():
    """Gets tasks from database to display back to front end"""

    #TODO: verify auth token
    #TODO: check tasks associated to user
    #TODO: validate tasks
    #TODO: return tasks back to frontend

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """update existing task - todo: implement task updates"""
    # todo: verify auth token
    # todo: check task ownership
    # todo: validate update data
    # todo: update task in database
    # todo: return updated task data
    return jsonify({'message': f'update task {task_id} endpoint - todo: implement'}), 501


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """delete task - todo: implement task deletion"""
    # todo: verify auth token
    # todo: check task ownership
    # todo: delete from database
    # todo: return success response
    return jsonify({'message': f'delete task {task_id} endpoint - todo: implement'}), 501

@app.route('/api/tasks/<int:task_id>/complete', methods=['POST'])
def complete_task(task_id):
    """mark task as complete - todo: implement task completion"""
    # todo: verify auth token
    # todo: check task ownership
    # todo: update task status in database
    # todo: award xp points for completion
    # todo: update user stats
    # todo: return updated task and xp data
    return jsonify({'message': f'complete task {task_id} endpoint - todo: implement'}), 501

# todo: implement adaptive scheduling routes


@app.route('/api/schedule/generate', methods=['POST'])
def generate_schedule():
    """generate adaptive schedule - todo: implement scheduling algorithm"""
    # todo: verify auth token
    # todo: get user's tasks and preferences
    # todo: implement scheduling algorithm (priority-based, deadline-based)
    # todo: consider user's class schedule and break times
    # todo: return generated schedule
    return jsonify({'message': 'generate schedule endpoint - todo: implement'}), 501


@app.route('/api/schedule', methods=['GET'])
def get_schedule():
    """get current schedule for user - todo: implement schedule retrieval"""
    # todo: verify auth token
    # todo: get schedule from database
    # todo: return schedule data (daily, weekly views)
    return jsonify({'message': 'get schedule endpoint - todo: implement'}), 501

# todo: implement gamification/xp system routes


@app.route('/api/xp', methods=['GET'])
def get_user_xp():
    """get user's current xp and level - todo: implement xp retrieval"""
    # todo: verify auth token
    # todo: get user xp data from database
    # todo: calculate current level and progress
    # todo: return xp and level data
    return jsonify({'message': 'get xp endpoint - todo: implement'}), 501


@app.route('/api/achievements', methods=['GET'])
def get_achievements():
    """get user's achievements and badges - todo: implement achievements"""
    # todo: verify auth token
    # todo: get user achievements from database
    # todo: check for new achievements to unlock
    # todo: return achievements data
    return jsonify({'message': 'get achievements endpoint - todo: implement'}), 501

# todo: implement pomodoro timer routes


@app.route('/api/pomodoro/session', methods=['POST'])
def start_pomodoro_session():
    """start new pomodoro session - todo: implement pomodoro tracking"""
    # todo: verify auth token
    # todo: create new focus session record
    # todo: return session id and start time
    return jsonify({'message': 'start pomodoro session endpoint - todo: implement'}), 501


@app.route('/api/pomodoro/session/<int:session_id>/complete', methods=['POST'])
def complete_pomodoro_session(session_id):
    """complete pomodoro session - todo: implement session completion"""
    # todo: verify auth token
    # todo: update session with end time and duration
    # todo: award xp for completed session
    # todo: update focus time analytics
    # todo: return session data and xp earned
    return jsonify({'message': f'complete pomodoro session {session_id} endpoint - todo: implement'}), 501

# todo: implement collaboration routes


@app.route('/api/boards', methods=['GET'])
def get_shared_boards():
    """get user's shared task boards - todo: implement board retrieval"""
    # todo: verify auth token
    # todo: get boards where user is member/owner
    # todo: return boards with member info
    return jsonify({'message': 'get shared boards endpoint - todo: implement'}), 501


@app.route('/api/boards', methods=['POST'])
def create_shared_board():
    """create new shared task board - todo: implement board creation"""
    # todo: verify auth token
    # todo: validate board data
    # todo: create board in database
    # todo: set creator as admin
    # todo: return created board data
    return jsonify({'message': 'create shared board endpoint - todo: implement'}), 501


@app.route('/api/boards/<int:board_id>/invite', methods=['POST'])
def invite_to_board(board_id):
    """invite user to shared board - todo: implement board invitations"""
    # todo: verify auth token
    # todo: check board admin permissions
    # todo: validate email and send invitation
    # todo: create pending invitation record
    # todo: return success response
    return jsonify({'message': f'invite to board {board_id} endpoint - todo: implement'}), 501

# todo: implement analytics routes


@app.route('/api/analytics/focus', methods=['GET'])
def get_focus_analytics():
    """get focus session analytics - todo: implement analytics"""
    # todo: verify auth token
    # todo: query focus session data
    # todo: calculate productivity metrics
    # todo: generate visualizations data
    # todo: return analytics data
    return jsonify({'message': 'get focus analytics endpoint - todo: implement'}), 501


@app.route('/api/analytics/productivity', methods=['GET'])
def get_productivity_analytics():
    """get productivity trends and patterns - todo: implement productivity analytics"""
    # todo: verify auth token
    # todo: analyze task completion patterns
    # todo: calculate productivity trends
    # todo: identify best productivity hours
    # todo: return analytics with suggestions
    return jsonify({'message': 'get productivity analytics endpoint - todo: implement'}), 501

# error handlers


@app.errorhandler(400)
def bad_request(error):
    """handle bad request errors"""
    return jsonify({'error': 'bad request', 'message': str(error)}), 400


@app.errorhandler(401)
def unauthorized(error):
    """handle unauthorized access errors"""
    return jsonify({'error': 'unauthorized', 'message': 'authentication required'}), 401


@app.errorhandler(403)
def forbidden(error):
    """handle forbidden access errors"""
    return jsonify({'error': 'forbidden', 'message': 'insufficient permissions'}), 403


@app.errorhandler(404)
def not_found(error):
    """handle not found errors"""
    return jsonify({'error': 'not found', 'message': 'resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """handle internal server errors"""
    return jsonify({'error': 'internal server error', 'message': 'something went wrong'}), 500


if __name__ == '__main__':
    # todo: remove debug=True in production
    app.run(
        debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true',
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000))
    )

# todo: major tasks for backend implementation:

# 6. build adaptive scheduling algorithm
# 7. create xp/gamification system with badges and achievements
# 8. implement pomodoro timer session tracking
# 9. build shared task board collaboration features
# 10. create analytics and reporting functionality
# 11. add comprehensive error handling and validation
# 12. implement security measures and rate limiting
# 13. add logging and monitoring
# 14. write unit tests for all functionality
# 15. optimize database queries and add caching where needed


# COMPLETED:
# 1. implement config.py with proper configuration classes
# 2. set up database connection and models in utils/database.py
# 3. implement supabase* authentication 
# 5. implement task crud operations with postgresql
# 4. create route modules in routes/ directory for better organization

