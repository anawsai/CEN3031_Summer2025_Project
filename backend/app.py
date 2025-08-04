import os
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path

from config import config
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt_identity,
    jwt_required,
)

from utils.database import (
    get_service_role_client,
    get_supabase_client,
    init_supabase,
    test_connection,
)

load_dotenv()

app = Flask(__name__)

config_name = os.getenv("FLASK_ENV", "development")
app.config.from_object(config[config_name])

jwt = JWTManager(app)
CORS(app)

try:
    init_supabase()
    print("Supabase connection initialized successfully")
except Exception as e:
    print(f"Failed to initialize Supabase: {e}")


@app.route("/api/health")
def health_check():
    """Enhanced health check endpoint with database connectivity"""
    db_connected, db_message = test_connection()

    return jsonify(
        {
            "message": "SwampScheduler backend is running!",
            "status": "healthy",
            "app": "swampscheduler",
            "version": "0.1.0",
            "database": {"connected": db_connected, "message": db_message},
            "environment": os.getenv("FLASK_ENV", "development"),
        }
    )


@app.route("/api/auth/register", methods=["POST"])
def register():
    """register new user account"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        email = data.get("email")
        password = data.get("password")
        username = data.get("username")
        major = data.get("major")
        year = data.get("year")
        first_name = data.get("firstName")
        last_name = data.get("lastName")
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        if not username:
            return jsonify({"error": "Username is required"}), 400

        if len(password) < 6:
            return jsonify(
                {"error": "Password must be at least 6 characters long"}
            ), 400
        if not any(char.isdigit() for char in password):
            return jsonify({"error": "Password must contain at least one number"}), 400
        if not any(char in '!@#$%^&*(),.?":{}|<>' for char in password):
            return jsonify({"error": "Password must contain at least one symbol"}), 400

        supabase = get_supabase_client()

        existing_username = (
            supabase.table("users")
            .select("username")
            .eq("username", username)
            .execute()
        )
        if existing_username.data:
            return jsonify({"error": "Username already exists"}), 400

        auth_response = supabase.auth.sign_up({"email": email, "password": password})

        if not auth_response.user:
            return jsonify({"error": "Failed to create auth user"}), 400

        service_supabase = get_service_role_client()

        user_profile_data = {
            "auth_id": auth_response.user.id,
            "email": email,
            "username": username,
            "major": major,
            "year": year,
            "first_name": first_name,
            "last_name": last_name,
            "email_verified": False,
        }

        profile_response = (
            service_supabase.table("users").insert(user_profile_data).execute()
        )

        if profile_response.data:
            return jsonify(
                {
                    "message": "User successfully created",
                    "user": {
                        "id": profile_response.data[0]["id"],
                        "email": email,
                        "username": username,
                        "major": major,
                        "year": year,
                        "first_name": first_name,
                        "last_name": last_name,
                    },
                    "access_token": auth_response.session.access_token
                    if auth_response.session
                    else None,
                    "note": "Please check your email to verify your account",
                }
            ), 201
        return jsonify({"error": "Failed to create user profile"}), 400

    except Exception as e:
        error_message = str(e)
        print(f"Registration error: {error_message}")

        if "User already registered" in error_message:
            return jsonify({"error": "An account with this email already exists"}), 400
        if (
            "duplicate key value violates unique constraint" in error_message
            and "username" in error_message
        ):
            return jsonify({"error": "Username already exists"}), 400

        return jsonify({"error": "Registration failed", "details": error_message}), 500


@app.route("/api/auth/check-username", methods=["POST"])
def check_username():
    """Check if username is available"""
    try:
        data = request.get_json()
        username = data.get("username", "").strip()

        if not username:
            return jsonify({"available": False, "message": "Username is required"}), 200

        if len(username) < 3:
            return jsonify(
                {
                    "available": False,
                    "message": "Username must be at least 3 characters",
                }
            ), 200

        if not username.replace("_", "").replace("-", "").isalnum():
            return jsonify(
                {
                    "available": False,
                    "message": "Username can only contain letters, numbers, - and _",
                }
            ), 200

        service_supabase = get_service_role_client()
        existing = (
            service_supabase.table("users")
            .select("id")
            .eq("username", username)
            .execute()
        )

        if existing.data:
            return jsonify(
                {"available": False, "message": "Username already taken"}
            ), 200

        return jsonify({"available": True, "message": "Username available"}), 200

    except Exception as e:
        print(f"Username check error: {e}")
        return jsonify({"error": "Failed to check username"}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    """authenticate user login"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        supabase = get_supabase_client()

        auth_response = supabase.auth.sign_in_with_password(
            {"email": email, "password": password}
        )

        if not auth_response.user:
            return jsonify({"error": "Invalid credentials"}), 401

        print(f"Auth successful for user: {auth_response.user.id}")

        try:
            service_supabase = get_service_role_client()
            user_profile_response = (
                service_supabase.table("users")
                .select("*")
                .eq("auth_id", auth_response.user.id)
                .execute()
            )

            print(f"User profile query result: {user_profile_response.data}")

            if user_profile_response.data:
                user_profile = user_profile_response.data[0]
                print(f"Found user profile: {user_profile}")
            else:
                print("No user profile found")
                return jsonify({"error": "User profile not found"}), 404

        except Exception as profile_error:
            print(f"Profile retrieval error: {profile_error}")
            return jsonify(
                {"error": "Profile retrieval failed", "details": str(profile_error)}
            ), 500

        flask_access_token = create_access_token(identity=auth_response.user.id)

        return jsonify(
            {
                "message": "Login successful",
                "user": {
                    "id": user_profile["id"],
                    "email": user_profile["email"],
                    "username": user_profile["username"],
                    "major": user_profile.get("major"),
                    "year": user_profile.get("year"),
                    "first_name": user_profile.get("first_name"),
                    "last_name": user_profile.get("last_name"),
                    "email_verified": user_profile["email_verified"],
                },
                "access_token": flask_access_token,
                "supabase_token": auth_response.session.access_token,
            }
        ), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"error": "Login failed", "details": str(e)}), 500


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    """logout user session"""
    try:
        supabase = get_supabase_client()

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "No valid authorization token provided"}), 401

        supabase.auth.sign_out()

        return jsonify({"message": "Logout successful"}), 200

    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({"error": "Logout failed", "details": str(e)}), 500


@app.route("/api/tasks", methods=["POST"])
@jwt_required()
def create_task():
    """create new task"""
    data = request.get_json()
    print("Parsed JSON data:", data)

    if not data:
        return jsonify({"error": "No JSON data received"}), 400

    title = data.get("title")
    description = data.get("description")
    due_date = data.get("due_date")
    priority = data.get("priority")
    create_date = data.get("create_date")

    if not title or not description or not due_date or not priority:
        return jsonify({"error": "Missing required fields"}), 400

    auth_id = get_jwt_identity()
    service_supabase = get_service_role_client()
    user_response = (
        service_supabase.table("users").select("id").eq("auth_id", auth_id).execute()
    )

    print(f"User profile query result: {user_response.data}")

    if user_response.data:
        user_profile = user_response.data[0]
        print(f"Found user profile: {user_profile}")
    else:
        print("No user profile found")
        return jsonify({"error": "User profile not found"}), 404

    user_id = user_response.data[0]["id"]

    task_data = {
        "user_id": user_id,
        "title": title,
        "description": description,
        "due_date": due_date,
        "priority": priority,
        "completed": False,
        "create_date": create_date,
        "updated_date": create_date,
        "completed_date": None,
    }

    try:
        task_response = service_supabase.table("Tasks").insert(task_data).execute()

        if task_response.data:
            return jsonify(
                {"message": "Task created successfully", "task": task_response.data[0]}
            ), 201
        return jsonify({"error": "Error inserting task"}), 500

    except Exception as e:
        print(f"Error inserting task: {e}")
        return jsonify({"error": "Internal Error", "details": str(e)}), 500


@app.route("/api/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User profile not found"}), 404

        user_id = user_response.data[0]["id"]

        task_response = (
            service_supabase.table("Tasks").select("*").eq("user_id", user_id).execute()
        )
        tasks = task_response.data if task_response.data else []

        return jsonify({"tasks": tasks}), 200

    except Exception as e:
        print(f"Error fetching tasks: {e}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


@app.route("/api/tasks/<task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    """Update task title only"""
    try:
        auth_id = get_jwt_identity()

        data = request.get_json()
        if not data or "title" not in data:
            return jsonify({"error": "Title is required"}), 400

        new_title = data.get("title")
        if not new_title or not new_title.strip():
            return jsonify({"error": "Title cannot be empty"}), 400

        service_supabase = get_service_role_client()
        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )

        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_id = user_response.data[0]["id"]

        task_response = (
            service_supabase.table("Tasks")
            .update({"title": new_title.strip()})
            .eq("id", task_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not task_response.data:
            return jsonify({"error": "Task not found or unauthorized"}), 404

        return jsonify(
            {"message": "Task updated successfully", "task": task_response.data[0]}
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/tasks/<task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    """Delete task with ownership check"""
    try:
        auth_id = get_jwt_identity()

        service_supabase = get_service_role_client()
        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )

        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_id = user_response.data[0]["id"]

        delete_response = (
            service_supabase.table("Tasks")
            .delete()
            .eq("id", task_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not delete_response.data:
            return jsonify({"error": "Task not found or unauthorized"}), 404

        return jsonify(
            {"message": "Task deleted successfully", "task_id": task_id}
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/tasks/<task_id>/complete", methods=["POST"])
@jwt_required()
def complete_task(task_id):
    """Toggle task completion status"""
    try:
        auth_id = get_jwt_identity()

        service_supabase = get_service_role_client()
        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )

        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_id = user_response.data[0]["id"]

        task_response = (
            service_supabase.table("Tasks")
            .select("*")
            .eq("id", task_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not task_response.data:
            return jsonify({"error": "Task not found or unauthorized"}), 404

        task = task_response.data[0]
        new_completed = not task["completed"]

        update_data = {
            "completed": new_completed,
            "completed_date": datetime.utcnow().isoformat() if new_completed else None,
        }

        update_response = (
            service_supabase.table("Tasks")
            .update(update_data)
            .eq("id", task_id)
            .execute()
        )

        if not update_response.data:
            return jsonify({"error": "Failed to update task"}), 500

        xp_awarded = 0
        if new_completed and task["completed_date"] is None:
            xp_response = (
                service_supabase.table("user_xp")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )

            if xp_response.data:
                current_xp = xp_response.data[0]["total_xp"]
                new_xp = current_xp + 10
                service_supabase.table("user_xp").update({"total_xp": new_xp}).eq(
                    "user_id", user_id
                ).execute()
            else:
                service_supabase.table("user_xp").insert(
                    {"user_id": user_id, "total_xp": 10}
                ).execute()

            xp_awarded = 10

            try:
                today = date.today().isoformat()

                existing_stats = (
                    service_supabase.table("daily_task_stats")
                    .select("*")
                    .eq("user_id", user_id)
                    .eq("date", today)
                    .execute()
                )

                if existing_stats.data:
                    current_count = existing_stats.data[0]["tasks_completed"]
                    service_supabase.table("daily_task_stats").update(
                        {"tasks_completed": current_count + 1}
                    ).eq("user_id", user_id).eq("date", today).execute()
                else:
                    service_supabase.table("daily_task_stats").insert(
                        {"user_id": user_id, "date": today, "tasks_completed": 1}
                    ).execute()
            except Exception as stats_error:
                print(f"Failed to update daily stats: {stats_error}")

            from utils.achievements_with_db import check_and_award_achievements

            newly_earned_achievements = []
            try:
                newly_earned_achievements = check_and_award_achievements(
                    user_id, service_supabase
                )

                if newly_earned_achievements:
                    print(f"Newly earned achievements: {newly_earned_achievements}")
                    achievement_xp = sum(
                        a["xp_reward"] for a in newly_earned_achievements
                    )
                    xp_awarded += achievement_xp
                    print(f"Total XP awarded (task + achievements): {xp_awarded}")

            except Exception as achievement_error:
                print(f"Failed to check achievements: {achievement_error}")
                import traceback

                traceback.print_exc()
                newly_earned_achievements = []

        response_data = {
            "message": f"Task {'completed' if new_completed else 'uncompleted'} successfully",
            "task": update_response.data[0],
            "xp_awarded": xp_awarded,
        }

        if new_completed and newly_earned_achievements:
            response_data["achievements_earned"] = newly_earned_achievements

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/schedule/generate", methods=["POST"])
def generate_schedule():
    """generate adaptive schedule"""
    return jsonify({"message": "generate schedule endpoint - todo: implement"}), 501


@app.route("/api/schedule", methods=["GET"])
def get_schedule():
    """get current schedule for user"""
    return jsonify({"message": "get schedule endpoint - todo: implement"}), 501


@app.route("/api/admin/adjust-xp", methods=["POST"])
@jwt_required()
def admin_adjust_xp():
    """Admin endpoint to adjust any user's XP"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        admin_response = (
            service_supabase.table("users")
            .select("is_admin")
            .eq("auth_id", auth_id)
            .execute()
        )

        if not admin_response.data or not admin_response.data[0].get("is_admin", False):
            return jsonify({"error": "Unauthorized - Admin access required"}), 403

        data = request.get_json()
        target_email = data.get("email")
        xp_change = data.get("xp_change", 0)

        if not target_email:
            return jsonify({"error": "Email is required"}), 400

        target_user = (
            service_supabase.table("users")
            .select("id, email, username")
            .eq("email", target_email)
            .execute()
        )

        if not target_user.data:
            return jsonify({"error": "User not found"}), 404

        target_user_id = target_user.data[0]["id"]

        xp_response = (
            service_supabase.table("user_xp")
            .select("total_xp")
            .eq("user_id", target_user_id)
            .execute()
        )

        if xp_response.data:
            current_xp = xp_response.data[0]["total_xp"]
            new_xp = max(0, current_xp + xp_change)

            service_supabase.table("user_xp").update({"total_xp": new_xp}).eq(
                "user_id", target_user_id
            ).execute()
        else:
            new_xp = max(0, xp_change)
            service_supabase.table("user_xp").insert(
                {"user_id": target_user_id, "total_xp": new_xp}
            ).execute()

        return jsonify(
            {
                "message": "XP adjusted successfully",
                "user": target_user.data[0]["username"],
                "new_xp": new_xp,
                "change": xp_change,
            }
        ), 200

    except Exception as e:
        print(f"Admin XP adjustment error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/xp", methods=["GET"])
@jwt_required()
def get_user_xp():
    """Get user's current XP, level, and progress"""
    try:
        from utils.level_system import get_level_info

        auth_id = get_jwt_identity()

        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )

        if not user_response.data:
            # User profile doesn't exist, return default values
            return jsonify(
                {
                    "total_xp": 0,
                    "level": 1,
                    "level_name": "Hatchling",
                    "xp_to_next_level": 100,
                    "progress_percent": 0,
                    "min_xp_for_level": 0,
                    "max_xp_for_level": 100,
                }
            ), 200

        user_id = user_response.data[0]["id"]

        xp_response = (
            service_supabase.table("user_xp")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        if xp_response.data:
            xp_data = xp_response.data[0]
            total_xp = xp_data["total_xp"]

            level_info = get_level_info(total_xp)

            response_data = {
                "total_xp": total_xp,
                "level": level_info["level"],
                "level_name": level_info["level_name"],
                "xp_to_next_level": level_info["xp_to_next_level"],
                "progress_percent": level_info["progress_percent"],
                "min_xp_for_level": level_info["min_xp_for_level"],
            }

            if level_info["level"] < 10:
                response_data["max_xp_for_level"] = level_info["max_xp_for_level"]

            return jsonify(response_data), 200
        return jsonify(
            {
                "total_xp": 0,
                "level": 1,
                "level_name": "Hatchling",
                "xp_to_next_level": 100,
                "progress_percent": 0,
                "min_xp_for_level": 0,
                "max_xp_for_level": 100,
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/user/is-admin", methods=["GET"])
@jwt_required()
def check_admin_status():
    """Check if current user is admin"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("is_admin")
            .eq("auth_id", auth_id)
            .execute()
        )

        if not user_response.data:
            return jsonify({"is_admin": False}), 200

        return jsonify({"is_admin": user_response.data[0].get("is_admin", False)}), 200

    except Exception as e:
        print(f"Admin check error: {e}")
        return jsonify({"is_admin": False}), 200


@app.route("/api/user/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """Update user profile (major and year only)"""
    try:
        auth_id = get_jwt_identity()
        data = request.get_json()

        # Validate input
        major = data.get("major", "").strip()
        year = data.get("year", "").strip()

        service_supabase = get_service_role_client()

        update_response = (
            service_supabase.table("users")
            .update({"major": major, "year": year})
            .eq("auth_id", auth_id)
            .execute()
        )

        if update_response.data:
            return jsonify(
                {
                    "message": "Profile updated successfully",
                    "user": update_response.data[0],
                }
            ), 200
        return jsonify({"error": "Failed to update profile"}), 400

    except Exception as e:
        print(f"Profile update error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/analytics/daily-completions", methods=["GET"])
@jwt_required()
def get_daily_completions():
    """Get daily task completions for the past 7 days"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )

        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_id = user_response.data[0]["id"]

        today = date.today()
        dates = [(today - timedelta(days=i)).isoformat() for i in range(6, -1, -1)]

        stats_response = (
            service_supabase.table("daily_task_stats")
            .select("date, tasks_completed")
            .eq("user_id", user_id)
            .in_("date", dates)
            .execute()
        )

        stats_dict = {
            stat["date"]: stat["tasks_completed"]
            for stat in (stats_response.data or [])
        }

        daily_data = []
        labels = []
        for date_str in dates:
            day_date = datetime.fromisoformat(date_str)
            labels.append(day_date.strftime("%a"))
            daily_data.append(stats_dict.get(date_str, 0))

        return jsonify({"labels": labels, "data": daily_data, "dates": dates}), 200

    except Exception as e:
        print(f"Daily analytics error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/achievements", methods=["GET"])
@jwt_required()
def get_achievements():
    """Get user's achievements with emoji badges"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        total_tasks = 0
        total_focus = 0
        user_level = 1

        try:
            user_id_response = (
                service_supabase.table("users")
                .select("id")
                .eq("auth_id", auth_id)
                .execute()
            )

            if user_id_response.data:
                user_id = user_id_response.data[0]["id"]

                tasks_response = (
                    service_supabase.table("Tasks")
                    .select("id")
                    .eq("user_id", user_id)
                    .eq("completed", True)
                    .execute()
                )
                total_tasks = len(tasks_response.data) if tasks_response.data else 0
        except Exception as e:
            print(f"Error getting task count: {e}")

        try:
            focus_response = (
                service_supabase.table("focus_sessions")
                .select("id")
                .eq("user_id", user_id)
                .eq("completed", True)
                .execute()
            )
            total_focus = len(focus_response.data) if focus_response.data else 0
        except Exception as e:
            print(f"Error getting focus count: {e}")

        try:
            from utils.level_system import get_level_info

            xp_response = (
                service_supabase.table("user_xp")
                .select("total_xp")
                .eq("user_id", user_id)
                .execute()
            )
            if xp_response.data:
                total_xp = xp_response.data[0]["total_xp"]
                level_info = get_level_info(total_xp)
                user_level = level_info["level"]
            else:
                user_level = 1
        except Exception as e:
            print(f"Error getting user level: {e}")

        achievements_response = (
            service_supabase.table("achievements")
            .select("*")
            .order("sort_order")
            .execute()
        )

        if not achievements_response.data:
            return jsonify({"error": "No achievements found in database"}), 500

        all_achievements = []
        for db_achievement in achievements_response.data:
            unlocked = False
            if db_achievement["category"] == "tasks":
                unlocked = total_tasks >= db_achievement["requirement_value"]
            elif db_achievement["category"] == "focus":
                unlocked = total_focus >= db_achievement["requirement_value"]
            elif db_achievement["category"] == "level":
                unlocked = user_level >= db_achievement["requirement_value"]

            achievement = {
                "id": db_achievement["id"],
                "name": db_achievement["name"],
                "description": db_achievement["description"],
                "icon": db_achievement["icon"],
                "xp_reward": db_achievement["xp_reward"],
                "criteria": f"{db_achievement['category']} >= {db_achievement['requirement_value']}",
                "unlocked": unlocked,
                "category": db_achievement["category"],
                "requirement_value": db_achievement["requirement_value"],
            }
            all_achievements.append(achievement)

        earned_response = (
            service_supabase.table("user_achievements")
            .select("achievement_id, earned_at")
            .eq("user_id", user_id)
            .execute()
        )

        earned_dates = {}
        if earned_response.data:
            for item in earned_response.data:
                earned_dates[item["achievement_id"]] = item["earned_at"]

        total_earned = 0
        for achievement in all_achievements:
            if achievement["unlocked"]:
                total_earned += 1
                if achievement["id"] in earned_dates:
                    achievement["earned_at"] = earned_dates[achievement["id"]]

        print(
            f"User stats - Tasks: {total_tasks}, Focus: {total_focus}, Level: {user_level}"
        )

        return jsonify(
            {
                "achievements": all_achievements,
                "total_earned": total_earned,
                "stats": {
                    "tasks_completed": total_tasks,
                    "focus_sessions": total_focus,
                    "level": user_level,
                },
            }
        ), 200

    except Exception as e:
        print(f"Error fetching achievements: {e}")
        return jsonify({"error": "Failed to fetch achievements"}), 500


@app.route("/api/pomodoro/start", methods=["POST"])
@jwt_required()
def start_pomodoro_session():
    """Start a new pomodoro session"""
    try:
        auth_id = get_jwt_identity()

        service_supabase = get_service_role_client()
        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )

        if not user_response.data:
            return jsonify({"error": "User profile not found"}), 404

        user_id = user_response.data[0]["id"]

        new_session = (
            service_supabase.table("focus_sessions")
            .insert(
                {
                    "user_id": user_id,
                    "start_time": datetime.utcnow().isoformat(),
                    "duration": 1500,
                    "completed": False,
                }
            )
            .execute()
        )

        if new_session.data:
            session = new_session.data[0]
            return jsonify(
                {"session_id": session["id"], "start_time": session["start_time"]}
            ), 201
        return jsonify({"error": "Failed to create session"}), 500

    except Exception as e:
        import traceback

        print(f"Pomodoro start error: {e!s}")
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/pomodoro/<session_id>/complete", methods=["POST"])
@jwt_required()
def complete_pomodoro_session(session_id):
    """Complete a pomodoro session"""
    try:
        auth_id = get_jwt_identity()

        service_supabase = get_service_role_client()
        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )

        if not user_response.data:
            return jsonify({"error": "User profile not found"}), 404

        user_id = user_response.data[0]["id"]

        session_result = (
            service_supabase.table("focus_sessions")
            .select("*")
            .eq("id", session_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not session_result.data:
            return jsonify({"error": "Session not found or unauthorized"}), 404

        session = session_result.data[0]

        if session["completed"]:
            return jsonify({"error": "Session already completed"}), 400

        update_result = (
            service_supabase.table("focus_sessions")
            .update({"completed": True})
            .eq("id", session_id)
            .execute()
        )

        if update_result.data:
            xp_awarded = 5

            xp_response = (
                service_supabase.table("user_xp")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )

            if xp_response.data:
                current_xp = xp_response.data[0]["total_xp"]
                new_xp = current_xp + xp_awarded
                service_supabase.table("user_xp").update({"total_xp": new_xp}).eq(
                    "user_id", user_id
                ).execute()
            else:
                service_supabase.table("user_xp").insert(
                    {"user_id": user_id, "total_xp": xp_awarded}
                ).execute()

            from utils.achievements_with_db import check_and_award_achievements

            newly_earned_achievements = []
            try:
                if user_id:
                    newly_earned_achievements = check_and_award_achievements(
                        user_id, service_supabase
                    )

                    if newly_earned_achievements:
                        achievement_xp = sum(
                            a["xp_reward"] for a in newly_earned_achievements
                        )
                        xp_awarded += achievement_xp

            except Exception as achievement_error:
                print(f"Failed to check achievements: {achievement_error}")

            response_data = {
                "message": "Session completed successfully",
                "session_id": session_id,
                "completed": True,
                "xp_awarded": xp_awarded,
            }

            if newly_earned_achievements:
                response_data["achievements_earned"] = newly_earned_achievements

            return jsonify(response_data), 200
        return jsonify({"error": "Failed to update session"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/boards", methods=["GET"])
@jwt_required()
def get_shared_boards():
    """get user's shared task boards (owned and joined)"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id, email")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User profile not found"}), 404

        user_id = user_response.data[0]["id"]
        user_email = user_response.data[0]["email"]

        owned_boards = (
            service_supabase.table("SharedBoards")
            .select("*, users!inner(username)")
            .eq("user_id", user_id)
            .execute()
        )

        boards = []
        if owned_boards.data:
            for board in owned_boards.data:
                boards.append(
                    {
                        "id": board["id"],
                        "name": board["name"],
                        "description": board.get("description", ""),
                        "created_by": board["users"]["username"],
                        "created_at": board["create_date"],
                        "role": "admin",
                    }
                )

        accepted_invites = (
            service_supabase.table("BoardInvites")
            .select("*, SharedBoards!inner(*, users!inner(username))")
            .eq("invited_email", user_email)
            .eq("status", "Accepted")
            .execute()
        )

        if accepted_invites.data:
            for invite in accepted_invites.data:
                board = invite["SharedBoards"]
                boards.append(
                    {
                        "id": board["id"],
                        "name": board["name"],
                        "description": board.get("description", ""),
                        "created_by": board["users"]["username"],
                        "created_at": board["create_date"],
                        "role": "member",
                    }
                )

        return jsonify({"boards": boards}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/boards", methods=["POST"])
@jwt_required()
def create_shared_board():
    """create new shared task board"""
    try:
        data = request.get_json()
        name = data.get("name")
        if not name:
            return jsonify({"error": "Board name is required"}), 400

        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User profile not found"}), 404

        user_id = user_response.data[0]["id"]

        board_data = {
            "id": str(uuid.uuid4()),
            "name": name,
            "description": data.get("description", ""),
            "user_id": user_id,
            # No create_date since it sets to now() default in Supabase - Ant
        }

        insert_response = (
            service_supabase.table("SharedBoards").insert(board_data).execute()
        )
        if insert_response.data:
            return jsonify(
                {
                    "message": "Board created successfully",
                    "board": insert_response.data[0],
                }
            ), 201
        return jsonify({"error": "Failed to create board"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/boards/<string:board_id>/invite", methods=["POST"])
@jwt_required()
def invite_to_board(board_id):
    """invite user to shared board by username"""
    try:
        data = request.get_json()
        username = data.get("username")
        message = data.get("message", "Hi! I'd like to invite you to my Taskboard!")

        if not username:
            return jsonify({"error": "Username is required"}), 400

        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User not found"}), 404
        user_id = user_response.data[0]["id"]

        board_check = (
            service_supabase.table("SharedBoards")
            .select("id, name")
            .eq("id", board_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not board_check.data:
            return jsonify({"error": "Board not found or unauthorized"}), 403

        invited_user = (
            service_supabase.table("users")
            .select("id, email")
            .eq("username", username)
            .execute()
        )
        if not invited_user.data:
            return jsonify({"error": f"User '{username}' not found"}), 404

        invited_email = invited_user.data[0]["email"]

        existing_invite = (
            service_supabase.table("BoardInvites")
            .select("id")
            .eq("board_id", board_id)
            .eq("invited_email", invited_email)
            .eq("status", "Pending")
            .execute()
        )
        if existing_invite.data:
            return jsonify({"error": "User already has a pending invite"}), 400

        invite_data = {
            "board_id": board_id,
            "invited_email": invited_email,
            "invited_by": user_id,
            "status": "Pending",
            "message": message,
        }

        invite_response = (
            service_supabase.table("BoardInvites").insert(invite_data).execute()
        )

        if invite_response.data:
            return jsonify(
                {
                    "message": f"User '{username}' invited to board",
                    "invite": invite_response.data[0],
                }
            ), 201
        return jsonify({"error": "Failed to send invite"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/invites", methods=["GET"])
@jwt_required()
def get_user_invites():
    """Get pending invites for the current user"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("email")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_email = user_response.data[0]["email"]

        invites_response = (
            service_supabase.table("BoardInvites")
            .select(
                "*, SharedBoards!inner(name, description), users!invited_by(username)"
            )
            .eq("invited_email", user_email)
            .eq("status", "Pending")
            .execute()
        )

        invites = []
        if invites_response.data:
            for invite in invites_response.data:
                invites.append(
                    {
                        "id": invite["id"],
                        "board_id": invite["board_id"],
                        "board_name": invite["SharedBoards"]["name"],
                        "board_description": invite["SharedBoards"]["description"],
                        "invited_by": invite["users"]["username"],
                        "message": invite.get(
                            "message", "Hi! I'd like to invite you to my Taskboard!"
                        ),
                        "invite_date": invite["invite_date"],
                    }
                )

        return jsonify({"invites": invites}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/invites/<string:invite_id>/accept", methods=["POST"])
@jwt_required()
def accept_invite(invite_id):
    """Accept a board invite"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id, email")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_email = user_response.data[0]["email"]

        invite_response = (
            service_supabase.table("BoardInvites")
            .select("*, SharedBoards!inner(name)")
            .eq("id", invite_id)
            .eq("invited_email", user_email)
            .eq("status", "Pending")
            .execute()
        )

        if not invite_response.data:
            return jsonify({"error": "Invite not found or already processed"}), 404

        invite = invite_response.data[0]
        board_id = invite["board_id"]

        update_response = (
            service_supabase.table("BoardInvites")
            .update({"status": "Accepted"})
            .eq("id", invite_id)
            .execute()
        )

        if update_response.data:
            return jsonify(
                {
                    "message": "Invite accepted successfully",
                    "board_id": board_id,
                    "board_name": invite["SharedBoards"]["name"],
                }
            ), 200

        return jsonify({"error": "Failed to accept invite"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/invites/<string:invite_id>/decline", methods=["POST"])
@jwt_required()
def decline_invite(invite_id):
    """Decline a board invite"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("email")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_email = user_response.data[0]["email"]

        update_response = (
            service_supabase.table("BoardInvites")
            .update({"status": "Declined"})
            .eq("id", invite_id)
            .eq("invited_email", user_email)
            .eq("status", "Pending")
            .execute()
        )

        if update_response.data:
            return jsonify({"message": "Invite declined"}), 200

        return jsonify({"error": "Invite not found or already processed"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/boards/<string:board_id>/members", methods=["GET"])
@jwt_required()
def get_board_members(board_id):
    """Get all members of a board"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id, email")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_id = user_response.data[0]["id"]
        user_email = user_response.data[0]["email"]

        board_response = (
            service_supabase.table("SharedBoards")
            .select("*, users!inner(username, email)")
            .eq("id", board_id)
            .execute()
        )

        if not board_response.data:
            return jsonify({"error": "Board not found"}), 404

        board = board_response.data[0]
        is_owner = board["user_id"] == user_id

        if not is_owner:
            invite_check = (
                service_supabase.table("BoardInvites")
                .select("id")
                .eq("board_id", board_id)
                .eq("invited_email", user_email)
                .eq("status", "Accepted")
                .execute()
            )
            if not invite_check.data:
                return jsonify({"error": "Unauthorized"}), 403

        members = [
            {
                "id": board["user_id"],
                "username": board["users"]["username"],
                "email": board["users"]["email"],
                "role": "owner",
            }
        ]

        accepted_invites = (
            service_supabase.table("BoardInvites")
            .select("*, users!inner(id, username, email)")
            .eq("board_id", board_id)
            .eq("status", "Accepted")
            .execute()
        )

        if accepted_invites.data:
            for invite in accepted_invites.data:
                member_user = (
                    service_supabase.table("users")
                    .select("id, username, email")
                    .eq("email", invite["invited_email"])
                    .execute()
                )
                if member_user.data:
                    members.append(
                        {
                            "id": member_user.data[0]["id"],
                            "username": member_user.data[0]["username"],
                            "email": member_user.data[0]["email"],
                            "role": "member",
                        }
                    )

        return jsonify({"members": members, "is_owner": is_owner}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route(
    "/api/boards/<string:board_id>/members/<string:member_id>", methods=["DELETE"]
)
@jwt_required()
def remove_board_member(board_id, member_id):
    """Remove a member from a board (owner only)"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_id = user_response.data[0]["id"]

        board_check = (
            service_supabase.table("SharedBoards")
            .select("id")
            .eq("id", board_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not board_check.data:
            return jsonify(
                {"error": "Unauthorized - only board owner can remove members"}
            ), 403

        member_response = (
            service_supabase.table("users")
            .select("email")
            .eq("id", member_id)
            .execute()
        )
        if not member_response.data:
            return jsonify({"error": "Member not found"}), 404

        member_email = member_response.data[0]["email"]

        update_response = (
            service_supabase.table("BoardInvites")
            .update({"status": "Removed"})
            .eq("board_id", board_id)
            .eq("invited_email", member_email)
            .eq("status", "Accepted")
            .execute()
        )

        if update_response.data:
            return jsonify({"message": "Member removed successfully"}), 200

        return jsonify({"error": "Member not found in board"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/boards/<string:board_id>/tasks", methods=["GET"])
@jwt_required()
def get_board_tasks(board_id):
    """Get tasks for a shared board"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id, email")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_id = user_response.data[0]["id"]
        user_email = user_response.data[0]["email"]

        board_check = (
            service_supabase.table("SharedBoards")
            .select("id")
            .eq("id", board_id)
            .eq("user_id", user_id)
            .execute()
        )

        has_access = bool(board_check.data)

        if not has_access:
            invite_check = (
                service_supabase.table("BoardInvites")
                .select("id")
                .eq("board_id", board_id)
                .eq("invited_email", user_email)
                .eq("status", "Accepted")
                .execute()
            )
            has_access = bool(invite_check.data)

        if not has_access:
            return jsonify({"error": "Unauthorized"}), 403

        tasks_response = (
            service_supabase.table("board_tasks")
            .select("*, Tasks!inner(*), users!added_by(username)")
            .eq("board_id", board_id)
            .execute()
        )

        tasks = []
        if tasks_response.data:
            for board_task in tasks_response.data:
                task = board_task["Tasks"]
                status = "todo"
                if task.get("completed", False):
                    status = "done"
                tasks.append(
                    {
                        "id": task["id"],
                        "title": task["title"],
                        "description": task.get("description", ""),
                        "status": board_task.get("status", status),
                        "priority": task.get("priority", "medium"),
                        "due_date": task.get("due_date"),
                        "added_by": board_task["users"]["username"],
                        "added_at": board_task["added_at"],
                        "assigned_to": task.get("assigned_to", ""),
                    }
                )

        return jsonify({"tasks": tasks}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/boards/<string:board_id>/tasks", methods=["POST"])
@jwt_required()
def create_board_task(board_id):
    """Create a task in a shared board"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()
        data = request.get_json()

        user_response = (
            service_supabase.table("users")
            .select("id, email")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_id = user_response.data[0]["id"]
        user_email = user_response.data[0]["email"]
        board_check = (
            service_supabase.table("SharedBoards")
            .select("id")
            .eq("id", board_id)
            .eq("user_id", user_id)
            .execute()
        )

        has_access = bool(board_check.data)

        if not has_access:
            invite_check = (
                service_supabase.table("BoardInvites")
                .select("id")
                .eq("board_id", board_id)
                .eq("invited_email", user_email)
                .eq("status", "Accepted")
                .execute()
            )
            has_access = bool(invite_check.data)

        if not has_access:
            return jsonify({"error": "Unauthorized"}), 403

        task_data = {
            "user_id": user_id,
            "title": data.get("title", ""),
            "description": data.get("description", ""),
            "priority": data.get("priority", "medium"),
            "due_date": data.get("due_date"),
            "completed": False,
        }

        assigned_to = data.get("assigned_to", "").strip()
        if assigned_to:
            task_data["assigned_to"] = assigned_to

        print(f"Creating task with data: {task_data}")

        task_response = service_supabase.table("Tasks").insert(task_data).execute()

        if task_response.data:
            task_id = task_response.data[0]["id"]

            board_task_data = {
                "board_id": board_id,
                "task_id": task_id,
                "added_by": user_id,
                "status": "todo",
            }

            print(f"Linking task to board with data: {board_task_data}")

            board_task_response = (
                service_supabase.table("board_tasks").insert(board_task_data).execute()
            )

            if board_task_response.data:
                return jsonify(
                    {
                        "message": "Task created successfully",
                        "task": task_response.data[0],
                    }
                ), 201
            print("Failed to link task to board")

        return jsonify({"error": "Failed to create task"}), 500

    except Exception as e:
        print(f"Error creating board task: {e!s}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/boards/<string:board_id>/tasks/<string:task_id>", methods=["PUT"])
@jwt_required()
def update_board_task(board_id, task_id):
    """Update a task in a shared board"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()
        data = request.get_json()

        user_response = (
            service_supabase.table("users")
            .select("id, email")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_id = user_response.data[0]["id"]
        user_email = user_response.data[0]["email"]
        board_check = (
            service_supabase.table("SharedBoards")
            .select("id")
            .eq("id", board_id)
            .eq("user_id", user_id)
            .execute()
        )

        has_access = bool(board_check.data)

        if not has_access:
            invite_check = (
                service_supabase.table("BoardInvites")
                .select("id")
                .eq("board_id", board_id)
                .eq("invited_email", user_email)
                .eq("status", "Accepted")
                .execute()
            )
            has_access = bool(invite_check.data)

        if not has_access:
            return jsonify({"error": "Unauthorized"}), 403

        task_check = (
            service_supabase.table("board_tasks")
            .select("id")
            .eq("board_id", board_id)
            .eq("task_id", task_id)
            .execute()
        )

        if not task_check.data:
            return jsonify({"error": "Task not found in this board"}), 404

        update_data = {}
        if "title" in data:
            update_data["title"] = data["title"]
        if "description" in data:
            update_data["description"] = data["description"]
        if "status" in data:
            service_supabase.table("board_tasks").update({"status": data["status"]}).eq(
                "board_id", board_id
            ).eq("task_id", task_id).execute()

            if data["status"] == "done":
                update_data["completed"] = True
            else:
                update_data["completed"] = False
        if "priority" in data:
            update_data["priority"] = data["priority"]
        if "due_date" in data:
            update_data["due_date"] = data["due_date"]
        if "completed" in data:
            update_data["completed"] = data["completed"]
        if "assigned_to" in data:
            update_data["assigned_to"] = data["assigned_to"]

        update_response = (
            service_supabase.table("Tasks")
            .update(update_data)
            .eq("id", task_id)
            .execute()
        )

        if update_response.data:
            return jsonify(
                {
                    "message": "Task updated successfully",
                    "task": update_response.data[0],
                }
            ), 200

        return jsonify({"error": "Failed to update task"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/boards/<string:board_id>/tasks/<string:task_id>", methods=["DELETE"])
@jwt_required()
def delete_board_task(board_id, task_id):
    """Delete a task from a shared board"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id, email")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        user_id = user_response.data[0]["id"]
        user_email = user_response.data[0]["email"]

        board_check = (
            service_supabase.table("SharedBoards")
            .select("id")
            .eq("id", board_id)
            .eq("user_id", user_id)
            .execute()
        )

        has_access = bool(board_check.data)

        if not has_access:
            invite_check = (
                service_supabase.table("BoardInvites")
                .select("id")
                .eq("board_id", board_id)
                .eq("invited_email", user_email)
                .eq("status", "Accepted")
                .execute()
            )
            has_access = bool(invite_check.data)

        if not has_access:
            return jsonify({"error": "Unauthorized"}), 403

        service_supabase.table("board_tasks").delete().eq("board_id", board_id).eq(
            "task_id", task_id
        ).execute()

        task_delete = (
            service_supabase.table("Tasks").delete().eq("id", task_id).execute()
        )

        if task_delete.data:
            return jsonify({"message": "Task deleted successfully"}), 200

        return jsonify({"error": "Task not found"}), 404

    except Exception as e:
        print(f"Error deleting task: {e!s}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/boards/<string:board_id>", methods=["DELETE"])
@jwt_required()
def delete_board(board_id):
    """Delete a shared board (only owner can delete)"""
    try:
        auth_id = get_jwt_identity()
        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )
        if not user_response.data:
            return jsonify({"error": "User profile not found"}), 404

        user_id = user_response.data[0]["id"]

        board_check = (
            service_supabase.table("SharedBoards")
            .select("id")
            .eq("id", board_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not board_check.data:
            return jsonify(
                {"error": "Board not found or you do not have permission to delete it"}
            ), 403

        service_supabase.table("BoardInvites").delete().eq(
            "board_id", board_id
        ).execute()

        delete_response = (
            service_supabase.table("SharedBoards").delete().eq("id", board_id).execute()
        )

        if delete_response.data:
            return jsonify({"message": "Board deleted successfully"}), 200
        return jsonify({"error": "Failed to delete board"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/analytics/tasks", methods=["GET"])
@jwt_required()
def get_task_analytics():
    """Get task completion statistics"""
    try:
        auth_id = get_jwt_identity()

        service_supabase = get_service_role_client()

        user_response = (
            service_supabase.table("users")
            .select("id")
            .eq("auth_id", auth_id)
            .execute()
        )

        if not user_response.data:
            return jsonify({"error": "User profile not found"}), 404

        user_id = user_response.data[0]["id"]

        start_date = request.args.get("start_date", date.today().isoformat())
        end_date = request.args.get("end_date", date.today().isoformat())

        stats_response = (
            service_supabase.table("daily_task_stats")
            .select("*")
            .eq("user_id", user_id)
            .gte("date", start_date)
            .lte("date", end_date)
            .order("date")
            .execute()
        )

        stats = stats_response.data if stats_response.data else []
        total_completed = sum(stat["tasks_completed"] for stat in stats)

        return jsonify(
            {
                "start_date": start_date,
                "end_date": end_date,
                "total_completed": total_completed,
                "daily_stats": stats,
                "days_tracked": len(stats),
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/analytics/focus", methods=["GET"])
def get_focus_analytics():
    """get focus session analytics"""
    return jsonify({"message": "get focus analytics endpoint - todo: implement"}), 501


@app.route("/api/analytics/productivity", methods=["GET"])
def get_productivity_analytics():
    """get productivity trends and patterns"""
    return jsonify(
        {"message": "get productivity analytics endpoint - todo: implement"}
    ), 501


@app.errorhandler(400)
def bad_request(error):
    """handle bad request errors"""
    return jsonify({"error": "bad request", "message": str(error)}), 400


@app.errorhandler(401)
def unauthorized(error):
    """handle unauthorized access errors"""
    return jsonify({"error": "unauthorized", "message": "authentication required"}), 401


@app.errorhandler(403)
def forbidden(error):
    """handle forbidden access errors"""
    return jsonify({"error": "forbidden", "message": "insufficient permissions"}), 403


@app.errorhandler(404)
def not_found(error):
    """handle not found errors"""
    return jsonify({"error": "not found", "message": "resource not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """handle internal server errors"""
    return jsonify(
        {"error": "internal server error", "message": "something went wrong"}
    ), 500


# Serve React app in production
if os.getenv("FLASK_ENV") == "production":

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):
        # Check if path is an API route
        if path.startswith("api/"):
            return jsonify({"error": "API route not found"}), 404

        # Serve React build files
        build_path = Path(__file__).parent / ".." / "frontend" / "build"
        build_path_str = str(build_path.resolve())
        if path != "" and (build_path / path).exists():
            return send_from_directory(build_path_str, path)
        return send_from_directory(build_path_str, "index.html")


if __name__ == "__main__":
    app.run(
        debug=os.getenv("FLASK_DEBUG", "True").lower() == "true",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
    )
