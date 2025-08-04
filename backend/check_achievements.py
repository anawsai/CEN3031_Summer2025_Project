#!/usr/bin/env python3
"""
Script to check the current state of achievements in the database.
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


def main():
    print("Checking achievements table...\n")

    # Get all achievements
    achievements = (
        supabase.table("achievements").select("*").order("sort_order").execute()
    )

    if not achievements.data:
        print("❌ No achievements found in database!")
        print(
            "\nRun 'python populate_achievements.py' to populate the achievements table."
        )
        return

    print(f"Found {len(achievements.data)} achievements:\n")

    # Group by category
    categories = {}
    for ach in achievements.data:
        cat = ach["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(ach)

    # Display by category
    for category, achs in categories.items():
        print(f"\n{category.upper()} Achievements:")
        print("-" * 50)
        for ach in achs:
            print(
                f"{ach['icon']} {ach['name']:<20} | Req: {ach['requirement_value']:<3} | XP: {ach['xp_reward']:<4} | {ach['description']}"
            )

    print("\n" + "=" * 50)

    # Check if any users have earned achievements
    user_achievements = (
        supabase.table("user_achievements").select("*, achievements(name)").execute()
    )

    if user_achievements.data:
        print(f"\nFound {len(user_achievements.data)} earned achievements:")
        for ua in user_achievements.data:
            ach_name = ua.get("achievements", {}).get("name", "Unknown")
            print(f"  - User {ua['user_id'][:8]}... earned: {ach_name}")
    else:
        print("\n✨ No achievements have been earned yet.")


if __name__ == "__main__":
    main()
