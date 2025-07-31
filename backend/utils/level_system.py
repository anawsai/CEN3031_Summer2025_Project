LEVEL_SYSTEM = [
    {"level": 1, "name": "Hatchling", "min_xp": 0, "max_xp": 100},
    {"level": 2, "name": "Baby Gator", "min_xp": 100, "max_xp": 250},
    {"level": 3, "name": "Swamp Puppy", "min_xp": 250, "max_xp": 500},
    {"level": 4, "name": "Novice Chomper", "min_xp": 500, "max_xp": 850},
    {"level": 5, "name": "Adept Reptile", "min_xp": 850, "max_xp": 1300},
    {"level": 6, "name": "Disciple of Albert", "min_xp": 1300, "max_xp": 1900},
    {"level": 7, "name": "Epic Gator", "min_xp": 1900, "max_xp": 2650},
    {"level": 8, "name": "Legendary Gator", "min_xp": 2650, "max_xp": 3550},
    {"level": 9, "name": "Mythic Gator", "min_xp": 3550, "max_xp": 4600},
    {"level": 10, "name": "Gator God", "min_xp": 4600, "max_xp": float('inf')}
]

def get_level_info(total_xp):
    """Get level information based on total XP"""
    for level_data in LEVEL_SYSTEM:
        if level_data["min_xp"] <= total_xp < level_data["max_xp"]:
            if level_data["level"] < 10:
                xp_in_level = total_xp - level_data["min_xp"]
                xp_for_level = level_data["max_xp"] - level_data["min_xp"]
                progress_percent = int((xp_in_level / xp_for_level) * 100)
                xp_to_next = level_data["max_xp"] - total_xp
            else:
                progress_percent = 100
                xp_to_next = 0
                
            return {
                "level": level_data["level"],
                "level_name": level_data["name"],
                "current_xp": total_xp,
                "min_xp_for_level": level_data["min_xp"],
                "max_xp_for_level": level_data["max_xp"],
                "xp_to_next_level": xp_to_next,
                "progress_percent": progress_percent
            }
    
    return {
        "level": 1,
        "level_name": "Hatchling",
        "current_xp": 0,
        "min_xp_for_level": 0,
        "max_xp_for_level": 100,
        "xp_to_next_level": 100,
        "progress_percent": 0
    }

XP_REWARDS = {
    "task_completion": 10,
    "pomodoro_completion": 5,
    "daily_streak": 20,
    "achievement_unlock": 25
}