from utils.database import init_supabase, test_connection
from config import Config, config
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
import os

# loads environment variables
load_dotenv()

url = os.getenv("SUPABASE_URL")

# Working in backend so using service key
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

# import our custom modules (uncomment as we develop)
# from utils.firebase_auth import verify_token, create_user
# from routes.auth import auth_bp
# from routes.tasks import tasks_bp
# from routes.schedule import schedule_bp
# from routes.gamification import gamification_bp
# from routes.collaboration import collaboration_bp
# from routes.analytics import analytics_bp

app = Flask(__name__)

# load configuration
config_name = os.getenv('FLASK_ENV', 'development')
# enable cors for frontend communication
app.config.from_object(config[config_name])

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


# todo: implement authentication routes


@app.route('/api/auth/register', methods=['POST'])
def register():
    """register new user account - todo: implement user registration logic"""

# TODO: Check for authenticator
# TODO: validate input data and check if everything is as its supposed to
# TODO: check if user already exists
# TODO: store user data in supabase
# TODO: return success response with user data

    data = request.get_json()

    username = data.get('username')
    email = data.get('email')
    major = data.get('major')
    year = data.get('year')
    first_name = data.get('first_name')
    last_name = data.get('last_name')

    response = (supabase.table("Users").insert({
        "email":email,
        "username":username,
        "major":major,
        "year":year, 
        "first_name":first_name,
        "last_name":last_name
        }).execute()
    )
    
    # Status Code 201: Signifies Successful Creation
    if response.status_code == 201:
        return jsonify({"message": "User successfully created", "data": response.data }), 201
    else:
        return jsonify({"error": response.error}), response.status_code
    
   
   # return jsonify({'message': 'register endpoint - todo: implement'}), 501


@app.route('/api/auth/login', methods=['POST'])
def login():
    """authenticate user login - todo: implement login logic"""
    # todo: validate credentials
    # todo: verify with firebase auth
    # todo: generate/return auth token
    # todo: update last login time
    return jsonify({'message': 'login endpoint - todo: implement'}), 501


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """logout user session - todo: implement logout logic"""
    # todo: invalidate auth token
    # todo: clear session data
    return jsonify({'message': 'logout endpoint - todo: implement'}), 501

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
def create_task():
    """create new task - todo: implement task creation"""
    # todo: verify auth token
    # todo: validate task data (title, description, due_date, priority)
    # todo: save task to database
    # todo: return created task data
    return jsonify({'message': 'create task endpoint - todo: implement'}), 501


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
# 1. implement config.py with proper configuration classes
# 2. set up database connection and models in utils/database.py
# 3. implement firebase authentication in utils/firebase_auth.py
# 4. create route modules in routes/ directory for better organization
# 5. implement task crud operations with postgresql
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
