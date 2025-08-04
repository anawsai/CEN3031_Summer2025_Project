"""Achievement system that works with database achievements"""


def check_and_award_achievements(user_id, service_supabase):
    """Check user's progress and award any newly earned achievements"""
    newly_earned = []
    print(f"Checking achievements for user {user_id}")

    try:
        # Get all achievements from database
        achievements_response = (
            service_supabase.table("achievements")
            .select("*")
            .order("sort_order")
            .execute()
        )

        if not achievements_response.data:
            print("No achievements found in database")
            return newly_earned

        print(f"Found {len(achievements_response.data)} achievements in database")
        for ach in achievements_response.data:
            print(
                f"Achievement: {ach['name']} - Category: {ach['category']} - Requirement: {ach['requirement_value']}"
            )

        # Get user's current stats
        tasks_response = (
            service_supabase.table("Tasks")
            .select("id")
            .eq("user_id", user_id)
            .eq("completed", True)
            .execute()
        )
        total_tasks = len(tasks_response.data) if tasks_response.data else 0
        print(f"User has completed {total_tasks} tasks")

        focus_response = (
            service_supabase.table("focus_sessions")
            .select("id")
            .eq("user_id", user_id)
            .eq("completed", True)
            .execute()
        )
        total_focus = len(focus_response.data) if focus_response.data else 0

        # Get user's XP and calculate level
        from utils.level_system import get_level_info

        xp_response = (
            service_supabase.table("user_xp")
            .select("total_xp")
            .eq("user_id", user_id)
            .execute()
        )

        total_xp = xp_response.data[0]["total_xp"] if xp_response.data else 0
        level_info = get_level_info(total_xp)
        user_level = level_info["level"]

        # Get already earned achievements
        earned_response = (
            service_supabase.table("user_achievements")
            .select("achievement_id")
            .eq("user_id", user_id)
            .execute()
        )

        earned_ids = (
            {item["achievement_id"] for item in earned_response.data}
            if earned_response.data
            else set()
        )

        # Check each achievement
        xp_to_award = 0
        for achievement in achievements_response.data:
            # Skip if already earned
            if achievement["id"] in earned_ids:
                continue

            # Check if criteria is met
            criteria_met = False

            if achievement["category"] == "tasks":
                criteria_met = total_tasks >= achievement["requirement_value"]
            elif achievement["category"] == "focus":
                criteria_met = total_focus >= achievement["requirement_value"]
            elif achievement["category"] == "level":
                criteria_met = user_level >= achievement["requirement_value"]

            if criteria_met:
                print(f"User meets criteria for achievement: {achievement['name']}")
                # Award the achievement
                service_supabase.table("user_achievements").insert(
                    {"user_id": user_id, "achievement_id": achievement["id"]}
                ).execute()

                # Track XP to award
                xp_to_award += achievement["xp_reward"]

                newly_earned.append(
                    {
                        "name": achievement["name"],
                        "description": achievement["description"],
                        "icon": achievement["icon"],
                        "xp_reward": achievement["xp_reward"],
                    }
                )
                print(
                    f"Achievement {achievement['name']} earned with {achievement['xp_reward']} XP"
                )

        # Award all XP at once if any achievements were earned
        if xp_to_award > 0:
            new_total_xp = total_xp + xp_to_award
            print(
                f"Awarding {xp_to_award} XP from achievements. New total: {new_total_xp}"
            )
            if xp_response.data:
                service_supabase.table("user_xp").update({"total_xp": new_total_xp}).eq(
                    "user_id", user_id
                ).execute()
            else:
                service_supabase.table("user_xp").insert(
                    {"user_id": user_id, "total_xp": xp_to_award}
                ).execute()

    except Exception as e:
        print(f"Error checking achievements: {e}")

    return newly_earned
