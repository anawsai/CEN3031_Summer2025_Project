#!/usr/bin/env python3
"""
Script to populate the achievements table in the database.
Run this script to ensure all achievements are properly stored in the database.
"""

import os

from dotenv import load_dotenv
from supabase import Client, create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client with service role key
supabase_url = os.getenv("SUPABASE_URL")
service_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url or not service_key:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file")
    exit(1)

supabase: Client = create_client(supabase_url, service_key)

# Define all achievements
achievements = [
    {
        "code": "first_steps",
        "name": "First Steps",
        "description": "Complete your first task",
        "icon": "👶",
        "xp_reward": 10,
        "category": "task",
        "requirement_type": "count",
        "requirement_value": 1,
        "sort_order": 1,
    },
    {
        "code": "task_master",
        "name": "Task Master",
        "description": "Complete 10 tasks",
        "icon": "🎯",
        "xp_reward": 50,
        "category": "task",
        "requirement_type": "count",
        "requirement_value": 10,
        "sort_order": 2,
    },
    {
        "code": "productivity_pro",
        "name": "Productivity Pro",
        "description": "Complete 50 tasks",
        "icon": "🚀",
        "xp_reward": 100,
        "category": "task",
        "requirement_type": "count",
        "requirement_value": 50,
        "sort_order": 3,
    },
    {
        "code": "task_legend",
        "name": "Task Legend",
        "description": "Complete 100 tasks",
        "icon": "🏆",
        "xp_reward": 200,
        "category": "task",
        "requirement_type": "count",
        "requirement_value": 100,
        "sort_order": 4,
    },
    {
        "code": "focus_initiate",
        "name": "Focus Initiate",
        "description": "Complete your first pomodoro session",
        "icon": "🍅",
        "xp_reward": 10,
        "category": "focus",
        "requirement_type": "count",
        "requirement_value": 1,
        "sort_order": 5,
    },
    {
        "code": "focus_warrior",
        "name": "Focus Warrior",
        "description": "Complete 10 pomodoro sessions",
        "icon": "⚔️",
        "xp_reward": 50,
        "category": "focus",
        "requirement_type": "count",
        "requirement_value": 10,
        "sort_order": 6,
    },
    {
        "code": "deep_work_master",
        "name": "Deep Work Master",
        "description": "Complete 50 pomodoro sessions",
        "icon": "🧘",
        "xp_reward": 100,
        "category": "focus",
        "requirement_type": "count",
        "requirement_value": 50,
        "sort_order": 7,
    },
    {
        "code": "time_lord",
        "name": "Time Lord",
        "description": "Complete 100 pomodoro sessions",
        "icon": "⏰",
        "xp_reward": 200,
        "category": "focus",
        "requirement_type": "count",
        "requirement_value": 100,
        "sort_order": 8,
    },
    {
        "code": "rising_star",
        "name": "Rising Star",
        "description": "Reach level 3",
        "icon": "⭐",
        "xp_reward": 25,
        "category": "level",
        "requirement_type": "level",
        "requirement_value": 3,
        "sort_order": 9,
    },
    {
        "code": "gator_elite",
        "name": "Gator Elite",
        "description": "Reach level 5",
        "icon": "🐊",
        "xp_reward": 50,
        "category": "level",
        "requirement_type": "level",
        "requirement_value": 5,
        "sort_order": 10,
    },
    {
        "code": "level_master",
        "name": "Level Master",
        "description": "Reach level 8",
        "icon": "👑",
        "xp_reward": 100,
        "category": "level",
        "requirement_type": "level",
        "requirement_value": 8,
        "sort_order": 11,
    },
    {
        "code": "gator_god",
        "name": "Gator God",
        "description": "Reach the maximum level 10",
        "icon": "🌟",
        "xp_reward": 200,
        "category": "level",
        "requirement_type": "level",
        "requirement_value": 10,
        "sort_order": 12,
    },
]


def main():
    print("Populating achievements table...")

    # First, let's check what's currently in the table
    existing = supabase.table("achievements").select("*").execute()
    print(f"Found {len(existing.data)} existing achievements")

    if existing.data:
        print("\nExisting achievements:")
        for ach in existing.data:
            print(f"  - {ach['name']} (code: {ach['code']})")

    # Clear existing achievements to ensure clean state
    if existing.data:
        response = input(
            "\nDo you want to clear existing achievements and repopulate? (yes/no): "
        )
        if response.lower() == "yes":
            print("Clearing existing achievements...")
            supabase.table("achievements").delete().neq(
                "id", "00000000-0000-0000-0000-000000000000"
            ).execute()
        else:
            print("Aborting...")
            return

    # Insert new achievements
    success_count = 0
    for achievement in achievements:
        try:
            supabase.table("achievements").insert(achievement).execute()
            print(f"✓ Inserted: {achievement['name']}")
            success_count += 1
        except Exception as e:
            print(f"✗ Failed to insert {achievement['name']}: {e}")

    print(f"\nSuccessfully inserted {success_count}/{len(achievements)} achievements")

    # Verify the data
    final_check = (
        supabase.table("achievements").select("*").order("sort_order").execute()
    )
    print(f"\nFinal achievement count in database: {len(final_check.data)}")

    if final_check.data:
        print("\nAchievements in database:")
        for ach in final_check.data:
            print(
                f"  - {ach['name']} ({ach['category']}: {ach['requirement_value']}) - {ach['xp_reward']} XP"
            )


if __name__ == "__main__":
    main()
