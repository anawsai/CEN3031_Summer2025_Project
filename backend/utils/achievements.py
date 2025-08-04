def check_task_achievements(user_id, total_tasks_completed, service_supabase):
    """Check and award task-related achievements"""
    newly_earned = []

    task_milestones = [
        ("first_bite", 1),
        ("baby_appetite", 10),
        ("feeding_frenzy", 25),
        ("studious_gator", 50),
        ("swamp_scholar", 100),
    ]

    for achievement_code, required_count in task_milestones:
        if total_tasks_completed >= required_count:
            existing = (
                service_supabase.table("user_achievements")
                .select("id")
                .eq("user_id", user_id)
                .eq(
                    "achievement_id",
                    service_supabase.table("achievements")
                    .select("id")
                    .eq("code", achievement_code)
                    .execute()
                    .data[0]["id"],
                )
                .execute()
            )

            if not existing.data:
                achievement = (
                    service_supabase.table("achievements")
                    .select("*")
                    .eq("code", achievement_code)
                    .execute()
                    .data[0]
                )

                service_supabase.table("user_achievements").insert(
                    {"user_id": user_id, "achievement_id": achievement["id"]}
                ).execute()

                xp_response = (
                    service_supabase.table("user_xp")
                    .select("*")
                    .eq("user_id", user_id)
                    .execute()
                )
                if xp_response.data:
                    current_xp = xp_response.data[0]["total_xp"]
                    new_xp = current_xp + achievement["xp_reward"]
                    service_supabase.table("user_xp").update({"total_xp": new_xp}).eq(
                        "user_id", user_id
                    ).execute()
                else:
                    service_supabase.table("user_xp").insert(
                        {"user_id": user_id, "total_xp": achievement["xp_reward"]}
                    ).execute()

                newly_earned.append(
                    {
                        "name": achievement["name"],
                        "description": achievement["description"],
                        "icon": achievement["icon"],
                        "xp_reward": achievement["xp_reward"],
                    }
                )

    return newly_earned


def check_focus_achievements(user_id, total_focus_sessions, service_supabase):
    """Check and award focus-related achievements"""
    newly_earned = []

    focus_milestones = [
        ("first_focus", 1),
        ("deep_diver", 10),
        ("marathon_gator", 25),
        ("focus_master", 50),
    ]

    for achievement_code, required_count in focus_milestones:
        if total_focus_sessions >= required_count:
            existing = (
                service_supabase.table("user_achievements")
                .select("id")
                .eq("user_id", user_id)
                .eq(
                    "achievement_id",
                    service_supabase.table("achievements")
                    .select("id")
                    .eq("code", achievement_code)
                    .execute()
                    .data[0]["id"],
                )
                .execute()
            )

            if not existing.data:
                achievement = (
                    service_supabase.table("achievements")
                    .select("*")
                    .eq("code", achievement_code)
                    .execute()
                    .data[0]
                )

                service_supabase.table("user_achievements").insert(
                    {"user_id": user_id, "achievement_id": achievement["id"]}
                ).execute()

                xp_response = (
                    service_supabase.table("user_xp")
                    .select("*")
                    .eq("user_id", user_id)
                    .execute()
                )
                if xp_response.data:
                    current_xp = xp_response.data[0]["total_xp"]
                    new_xp = current_xp + achievement["xp_reward"]
                    service_supabase.table("user_xp").update({"total_xp": new_xp}).eq(
                        "user_id", user_id
                    ).execute()
                else:
                    service_supabase.table("user_xp").insert(
                        {"user_id": user_id, "total_xp": achievement["xp_reward"]}
                    ).execute()

                newly_earned.append(
                    {
                        "name": achievement["name"],
                        "description": achievement["description"],
                        "icon": achievement["icon"],
                        "xp_reward": achievement["xp_reward"],
                    }
                )

    return newly_earned


def get_user_stats(user_id, service_supabase):
    """Get user's total tasks and focus sessions completed"""
    tasks_response = (
        service_supabase.table("Tasks")
        .select("id")
        .eq("user_id", user_id)
        .eq("completed", True)
        .execute()
    )
    total_tasks = len(tasks_response.data) if tasks_response.data else 0

    focus_response = (
        service_supabase.table("focus_sessions")
        .select("id")
        .eq("user_id", user_id)
        .eq("completed", True)
        .execute()
    )
    total_focus = len(focus_response.data) if focus_response.data else 0

    return total_tasks, total_focus
