from utils.database import init_supabase, test_connection, get_supabase_client, get_service_role_client
from utils.auth import require_auth, get_or_create_user_profile
from config import Config, config
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, date
import os
import uuid

# load environment variables
load_dotenv()

app = Flask(__name__)

config_name = os.getenv('FLASK_ENV', 'development')
app.config.from_object(config[config_name])

jwt = JWTManager(app)
CORS(app)

# initialize supabase connection
try:
    init_supabase()
    print("Supabase connection initialized successfully")
except Exception as e:
    print(f"Failed to initialize Supabase: {e}")


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

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        major = data.get('major')
        year = data.get('year')
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        if not username:
            return jsonify({'error': 'Username is required'}), 400

        supabase = get_supabase_client()

        existing_username = supabase.table("users").select(
            "username").eq("username", username).execute()
        if existing_username.data:
            return jsonify({'error': 'Username already exists'}), 400

        auth_response = supabase.auth.sign_up({
            'email': email,
            'password': password
        })

        if not auth_response.user:
            return jsonify({'error': 'Failed to create auth user'}), 400

        service_supabase = get_service_role_client()

        user_profile_data = {
            'auth_id': auth_response.user.id,
            'email': email,
            'username': username,
            'major': major,
            'year': year,
            'first_name': first_name,
            'last_name': last_name,
            'email_verified': False
        }

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

        auth_response = supabase.auth.sign_in_with_password({
            'email': email,
            'password': password
        })

        if not auth_response.user:
            return jsonify({'error': 'Invalid credentials'}), 401

        print(f"Auth successful for user: {auth_response.user.id}")

        try:
            service_supabase = get_service_role_client()
            user_profile_response = service_supabase.table('users').select(
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

        flask_access_token = create_access_token(
            identity=auth_response.user.id)

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
            'access_token': flask_access_token,
            'supabase_token': auth_response.session.access_token
        }), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """logout user session"""
    try:
        supabase = get_supabase_client()

        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No valid authorization token provided'}), 401

        supabase.auth.sign_out()

        return jsonify({'message': 'Logout successful'}), 200

    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({'error': 'Logout failed', 'details': str(e)}), 500


@app.route('/api/tasks', methods=['POST'])
@jwt_required()
def create_task():
    """create new task"""
    data = request.get_json()
    print("Parsed JSON data:", data)

    if not data:
        return jsonify({'error': 'No JSON data received'}), 400

    title = data.get('title')
    description = data.get('description')
    due_date = data.get('due_date')
    priority = data.get('priority')
    create_date = data.get('create_date')

    if not title or not description or not due_date or not priority:
        return jsonify({'error': 'Missing required fields'}), 400

    auth_id = get_jwt_identity()
    service_supabase = get_service_role_client()
    user_response = service_supabase.table('users').select(
        'id').eq('auth_id', auth_id).execute()

    print(f"User profile query result: {user_response.data}")

    if user_response.data:
        user_profile = user_response.data[0]
        print(f"Found user profile: {user_profile}")
    else:
        print("No user profile found")
        return jsonify({'error': 'User profile not found'}), 404

    user_id = user_response.data[0]['id']

    task_data = {
        'user_id': user_id,
        'title': title,
        'description': description,
        'due_date': due_date,
        'priority': priority,
        'completed': False,
        'create_date': create_date,
        'updated_date': create_date,
        'completed_date': None
    }

    try:
        task_response = service_supabase.table(
            "Tasks").insert(task_data).execute()

        if task_response.data:
            return jsonify({
                'message': 'Task created successfully',
                'task': task_response.data[0]
            }), 201
        else:
            return jsonify({'error': 'Error inserting task'}), 500

    except Exception as e:
        print(f"Error inserting task: {e}")
        return jsonify({'error': 'Internal Error', 'details': str(e)}), 500


@app.route('/api/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = service_supabase.table('users').select(
            'id').eq('auth_id', auth_id).execute()
        if not user_response.data:
            return jsonify({'error': 'User profile not found'}), 404

        user_id = user_response.data[0]['id']

        task_response = service_supabase.table('Tasks').select(
            '*').eq('user_id', user_id).execute()
        tasks = task_response.data if task_response.data else []

        return jsonify({'tasks': tasks}), 200

    except Exception as e:
        print(f"Error fetching tasks: {e}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500


@app.route('/api/tasks/<task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """Update task title only"""
    try:
        auth_id = get_jwt_identity()

        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({'error': 'Title is required'}), 400

        new_title = data.get('title')
        if not new_title or not new_title.strip():
            return jsonify({'error': 'Title cannot be empty'}), 400

        service_supabase = get_service_role_client()
        user_response = service_supabase.table('users').select(
            'id').eq('auth_id', auth_id).execute()

        if not user_response.data:
            return jsonify({'error': 'User not found'}), 404

        user_id = user_response.data[0]['id']

        task_response = service_supabase.table('Tasks').update({
            'title': new_title.strip()
        }).eq('id', task_id).eq('user_id', user_id).execute()

        if not task_response.data:
            return jsonify({'error': 'Task not found or unauthorized'}), 404

        return jsonify({
            'message': 'Task updated successfully',
            'task': task_response.data[0]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """Delete task with ownership check"""
    try:
        auth_id = get_jwt_identity()

        service_supabase = get_service_role_client()
        user_response = service_supabase.table('users').select(
            'id').eq('auth_id', auth_id).execute()

        if not user_response.data:
            return jsonify({'error': 'User not found'}), 404

        user_id = user_response.data[0]['id']

        delete_response = service_supabase.table('Tasks').delete().eq(
            'id', task_id).eq('user_id', user_id).execute()

        if not delete_response.data:
            return jsonify({'error': 'Task not found or unauthorized'}), 404

        return jsonify({
            'message': 'Task deleted successfully',
            'task_id': task_id
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/tasks/<task_id>/complete', methods=['POST'])
@jwt_required()
def complete_task(task_id):
    """Toggle task completion status"""
    try:
        auth_id = get_jwt_identity()

        service_supabase = get_service_role_client()
        user_response = service_supabase.table('users').select(
            'id').eq('auth_id', auth_id).execute()

        if not user_response.data:
            return jsonify({'error': 'User not found'}), 404

        user_id = user_response.data[0]['id']

        task_response = service_supabase.table('Tasks').select(
            '*').eq('id', task_id).eq('user_id', user_id).execute()

        if not task_response.data:
            return jsonify({'error': 'Task not found or unauthorized'}), 404

        task = task_response.data[0]
        new_completed = not task['completed']

        update_data = {
            'completed': new_completed,
            'completed_date': datetime.utcnow().isoformat() if new_completed else None
        }

        update_response = service_supabase.table('Tasks').update(
            update_data).eq('id', task_id).execute()

        if not update_response.data:
            return jsonify({'error': 'Failed to update task'}), 500

        xp_awarded = 0
        if new_completed and task['completed_date'] is None:
            xp_response = service_supabase.table('user_xp').select(
                '*').eq('user_id', auth_id).execute()

            if xp_response.data:
                current_xp = xp_response.data[0]['total_xp']
                new_xp = current_xp + 10
                service_supabase.table('user_xp').update({
                    'total_xp': new_xp
                }).eq('user_id', auth_id).execute()
            else:
                service_supabase.table('user_xp').insert({
                    'user_id': auth_id,
                    'total_xp': 10
                }).execute()

            xp_awarded = 10

            try:
                today = date.today().isoformat()
                
                existing_stats = service_supabase.table('daily_task_stats').select('*').eq(
                    'user_id', auth_id).eq('date', today).execute()
                
                if existing_stats.data:
                    current_count = existing_stats.data[0]['tasks_completed']
                    service_supabase.table('daily_task_stats').update({
                        'tasks_completed': current_count + 1
                    }).eq('user_id', auth_id).eq('date', today).execute()
                else:
                    service_supabase.table('daily_task_stats').insert({
                        'user_id': auth_id,
                        'date': today,
                        'tasks_completed': 1
                    }).execute()
            except Exception as stats_error:
                print(f"Failed to update daily stats: {stats_error}")

            from utils.achievements import check_task_achievements, get_user_stats
            try:
                total_tasks, _ = get_user_stats(auth_id, service_supabase)
                newly_earned_achievements = check_task_achievements(
                    auth_id, total_tasks, service_supabase)
            except Exception as achievement_error:
                print(f"Failed to check achievements: {achievement_error}")
                newly_earned_achievements = []

        response_data = {
            'message': f'Task {"completed" if new_completed else "uncompleted"} successfully',
            'task': update_response.data[0],
            'xp_awarded': xp_awarded
        }

        if new_completed and newly_earned_achievements:
            response_data['achievements_earned'] = newly_earned_achievements

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/schedule/generate', methods=['POST'])
def generate_schedule():
    """generate adaptive schedule"""
    return jsonify({'message': 'generate schedule endpoint - todo: implement'}), 501


@app.route('/api/schedule', methods=['GET'])
def get_schedule():
    """get current schedule for user"""
    return jsonify({'message': 'get schedule endpoint - todo: implement'}), 501


@app.route('/api/xp', methods=['GET'])
@jwt_required()
def get_user_xp():
    """Get user's current XP, level, and progress"""
    try:
        from utils.level_system import get_level_info

        auth_id = get_jwt_identity()

        service_supabase = get_service_role_client()
        xp_response = service_supabase.table('user_xp').select(
            '*').eq('user_id', auth_id).execute()

        if xp_response.data:
            xp_data = xp_response.data[0]
            total_xp = xp_data['total_xp']

            level_info = get_level_info(total_xp)

            return jsonify({
                'total_xp': total_xp,
                'level': level_info['level'],
                'level_name': level_info['level_name'],
                'xp_to_next_level': level_info['xp_to_next_level'],
                'progress_percent': level_info['progress_percent'],
                'min_xp_for_level': level_info['min_xp_for_level'],
                'max_xp_for_level': level_info['max_xp_for_level']
            }), 200
        else:
            return jsonify({
                'total_xp': 0,
                'level': 1,
                'level_name': 'Hatchling',
                'xp_to_next_level': 100,
                'progress_percent': 0,
                'min_xp_for_level': 0,
                'max_xp_for_level': 100
            }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/achievements', methods=['GET'])
def get_achievements():
    """get user's achievements and badges"""
    return jsonify({'message': 'get achievements endpoint - todo: implement'}), 501


@app.route('/api/pomodoro/start', methods=['POST'])
@jwt_required()
def start_pomodoro_session():
    """Start a new pomodoro session"""
    try:
        auth_id = get_jwt_identity()
        
        service_supabase = get_service_role_client()
        user_response = service_supabase.table('users').select('id').eq('auth_id', auth_id).execute()
        
        if not user_response.data:
            return jsonify({'error': 'User profile not found'}), 404
            
        user_id = user_response.data[0]['id']

        new_session = service_supabase.table('focus_sessions').insert({
            'user_id': auth_id,
            'start_time': datetime.utcnow().isoformat(),
            'duration': 1500,
            'completed': False
        }).execute()

        if new_session.data:
            session = new_session.data[0]
            return jsonify({
                'session_id': session['id'],
                'start_time': session['start_time']
            }), 201
        else:
            return jsonify({'error': 'Failed to create session'}), 500

    except Exception as e:
        import traceback
        print(f"Pomodoro start error: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/pomodoro/<session_id>/complete', methods=['POST'])
@jwt_required()
def complete_pomodoro_session(session_id):
    """Complete a pomodoro session"""
    try:
        auth_id = get_jwt_identity()
        
        service_supabase = get_service_role_client()
        user_response = service_supabase.table('users').select('id').eq('auth_id', auth_id).execute()
        
        if not user_response.data:
            return jsonify({'error': 'User profile not found'}), 404
            
        user_id = user_response.data[0]['id']

        session_result = service_supabase.table('focus_sessions').select(
            '*').eq('id', session_id).eq('user_id', auth_id).execute()

        if not session_result.data:
            return jsonify({'error': 'Session not found or unauthorized'}), 404

        session = session_result.data[0]

        if session['completed']:
            return jsonify({'error': 'Session already completed'}), 400

        update_result = service_supabase.table('focus_sessions').update({
            'completed': True
        }).eq('id', session_id).execute()

        if update_result.data:
            xp_awarded = 5

            xp_response = service_supabase.table('user_xp').select(
                '*').eq('user_id', auth_id).execute()

            if xp_response.data:
                current_xp = xp_response.data[0]['total_xp']
                new_xp = current_xp + xp_awarded
                service_supabase.table('user_xp').update({
                    'total_xp': new_xp
                }).eq('user_id', auth_id).execute()
            else:
                service_supabase.table('user_xp').insert({
                    'user_id': auth_id,
                    'total_xp': xp_awarded
                }).execute()

            from utils.achievements import check_focus_achievements, get_user_stats
            newly_earned_achievements = []
            try:
                _, total_focus = get_user_stats(auth_id, service_supabase)
                newly_earned_achievements = check_focus_achievements(
                    auth_id, total_focus, service_supabase)
            except Exception as achievement_error:
                print(f"Failed to check achievements: {achievement_error}")

            response_data = {
                'message': 'Session completed successfully',
                'session_id': session_id,
                'completed': True,
                'xp_awarded': xp_awarded
            }

            if newly_earned_achievements:
                response_data['achievements_earned'] = newly_earned_achievements

            return jsonify(response_data), 200
        else:
            return jsonify({'error': 'Failed to update session'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/boards', methods=['GET'])
@jwt_required()
def get_shared_boards():
    """get user's shared task boards"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = service_supabase.table('users').select('id').eq('auth_id', auth_id).execute()
        if not user_response.data:
            return jsonify({'error': 'User profile not found'}), 404

        user_id = user_response.data[0]['id']

        board_response = service_supabase.table('SharedBoards').select('*').eq('user_id', user_id).execute()
        boards = board_response.data if board_response.data else []

        return jsonify({'boards': boards}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/boards', methods=['POST'])
@jwt_required()
def create_shared_board():
    """create new shared task board"""
    try:
        data = request.get_json()
        name = data.get('name')
        if not name:
            return jsonify({'error': 'Board name is required'}), 400

        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = service_supabase.table('users').select('id').eq('auth_id', auth_id).execute()
        if not user_response.data:
            return jsonify({'error': 'User profile not found'}), 404

        user_id = user_response.data[0]['id']

        board_data = {
            'id': str(uuid.uuid4()),
            'name': name,
            'user_id': user_id,
            # No create_date since it sets to now() default in Supabase - Ant
        }

        insert_response = service_supabase.table('SharedBoards').insert(board_data).execute()
        if insert_response.data:
            return jsonify({
                'message': 'Board created successfully',
                'board': insert_response.data[0]
            }), 201
        else:
            return jsonify({'error': 'Failed to create board'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/api/boards/<string:board_id>/invite', methods=['POST'])
@jwt_required()
def invite_to_board(board_id):
    """invite user to shared board"""
    try:
        data = request.get_json()
        invited_email = data.get('email')

        if not invited_email:
            return jsonify({'error': 'Email to invite is required'}), 400

        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        # Get requesting user's internal user ID
        user_response = service_supabase.table('users').select('id').eq('auth_id', auth_id).execute()
        if not user_response.data:
            return jsonify({'error': 'User not found'}), 404
        user_id = user_response.data[0]['id']

        # Check if board exists and is owned by this user
        board_check = service_supabase.table('SharedBoards').select('id').eq('id', board_id).eq('user_id', user_id).execute()
        if not board_check.data:
            return jsonify({'error': 'Board not found or unauthorized'}), 403

        # Insert invite
        invite_data = {
            'board_id': board_id,
            'invited_email': invited_email,
            'invited_by': user_id,
            'status': 'pending'
        }

        invite_response = service_supabase.table('BoardInvites').insert(invite_data).execute()

        if invite_response.data:
            return jsonify({
                'message': f'User invited to board {board_id}',
                'invite': invite_response.data[0]
            }), 201
        else:
            return jsonify({'error': 'Failed to send invite'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/boards/<string:board_id>', methods=['DELETE'])
@jwt_required()
def delete_board(board_id):
    """Delete a shared board (only owner can delete)"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()
        
        user_response = service_supabase.table('users').select('id').eq('auth_id', auth_id).execute()
        if not user_response.data:
            return jsonify({'error': 'User profile not found'}), 404
        
        user_id = user_response.data[0]['id']
        
        board_check = service_supabase.table('SharedBoards').select('id').eq('id', board_id).eq('user_id', user_id).execute()
        if not board_check.data:
            return jsonify({'error': 'Board not found or you do not have permission to delete it'}), 403
        
        service_supabase.table('BoardInvites').delete().eq('board_id', board_id).execute()
        
        delete_response = service_supabase.table('SharedBoards').delete().eq('id', board_id).execute()
        
        if delete_response.data:
            return jsonify({'message': 'Board deleted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to delete board'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
@app.route('/api/analytics/tasks', methods=['GET'])
@jwt_required()
def get_task_analytics():
    """Get task completion statistics"""
    try:
        auth_id = get_jwt_identity()
        
        service_supabase = get_service_role_client()

        start_date = request.args.get('start_date', date.today().isoformat())
        end_date = request.args.get('end_date', date.today().isoformat())

        stats_response = service_supabase.table('daily_task_stats').select('*').eq(
            'user_id', auth_id
        ).gte('date', start_date).lte('date', end_date).order('date').execute()

        stats = stats_response.data if stats_response.data else []
        total_completed = sum(stat['tasks_completed'] for stat in stats)

        return jsonify({
            'start_date': start_date,
            'end_date': end_date,
            'total_completed': total_completed,
            'daily_stats': stats,
            'days_tracked': len(stats)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics/focus', methods=['GET'])
def get_focus_analytics():
    """get focus session analytics"""
    return jsonify({'message': 'get focus analytics endpoint - todo: implement'}), 501


@app.route('/api/analytics/productivity', methods=['GET'])
def get_productivity_analytics():
    """get productivity trends and patterns"""
    return jsonify({'message': 'get productivity analytics endpoint - todo: implement'}), 501


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
    app.run(
        debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true',
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000))
    )
