"""
Optimized Database Manager for MuseAI
Handles JSON storage with better organization and cross-platform support
"""

import os
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
import platform as sys_platform


class DatabaseManager:
    """Cross-platform database management using JSON files"""

    def __init__(self, db_base_path: Optional[str] = None):
        """
        Initialize database manager
        
        Args:
            db_base_path: Optional custom path for database files
        """
        self.platform = sys_platform.system()
        
        configured_path = db_base_path or os.getenv("MUSEAI_DATA_DIR")
        if configured_path:
            self.db_base_path = Path(configured_path)
        else:
            # Default paths based on OS
            if self.platform == "Windows":
                self.db_base_path = Path(os.getenv("APPDATA")) / "MuseAI" / "data"
            elif self.platform == "Darwin":  # macOS
                self.db_base_path = Path.home() / "Library" / "Application Support" / "MuseAI" / "data"
            else:  # Linux
                self.db_base_path = Path.home() / ".local" / "share" / "museai" / "data"
        
        # Also keep backend data directory as fallback
        backend_data_path = Path(__file__).parent / "data"
        self.backend_data_path = backend_data_path
        
        # Use the platform-specific location when it is writable. In restricted
        # environments, keep the existing backend data fallback operational.
        try:
            self.db_base_path.mkdir(parents=True, exist_ok=True)
        except OSError:
            self.db_base_path = backend_data_path / "app_database"
            self.db_base_path.mkdir(parents=True, exist_ok=True)
        self.backend_data_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize data structures
        self._init_data_structures()

    def _init_data_structures(self):
        """Initialize JSON database structure"""
        self.db_files = {
            "history": self.db_base_path / "history.json",
            "profiles": self.db_base_path / "profiles.json",
            "campaigns": self.db_base_path / "campaigns.json",
            "social_media_posts": self.db_base_path / "social_media_posts.json",
            "settings": self.db_base_path / "settings.json",
        }

        # Ensure all files exist with proper structure
        for key, path in self.db_files.items():
            if not path.exists():
                self._create_empty_db(key, path)

    def _create_empty_db(self, db_type: str, path: Path):
        """Create empty database file with proper structure"""
        default_structures = {
            "history": {"entries": []},
            "profiles": {"users": []},
            "campaigns": {"campaigns": []},
            "social_media_posts": {"posts": []},
            "settings": {"app_settings": {}, "user_settings": {}},
        }

        data = default_structures.get(db_type, {})
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    # ── History Management ─────────────────────────────────────────────────

    def add_generation_history(self, user_id: str, generation_data: Dict) -> bool:
        """Add generation to user history"""
        try:
            history_file = self.db_files["history"]
            data = self._read_json(history_file)

            entry = {
                "id": len(data.get("entries", [])) + 1,
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "data": generation_data
            }

            data.setdefault("entries", []).append(entry)
            self._write_json(history_file, data)
            return True
        except Exception as e:
            print(f"Error adding history: {e}")
            return False

    def get_user_history(self, user_id: str) -> List[Dict]:
        """Get all generations for a user"""
        try:
            history_file = self.db_files["history"]
            data = self._read_json(history_file)
            return [e for e in data.get("entries", []) if e.get("user_id") == user_id]
        except Exception as e:
            print(f"Error retrieving history: {e}")
            return []

    # ── Profile Management ─────────────────────────────────────────────────

    def save_user_profile(self, user_id: str, profile_data: Dict) -> bool:
        """Save or update user profile"""
        try:
            profiles_file = self.db_files["profiles"]
            data = self._read_json(profiles_file)

            users = data.get("users", [])
            
            # Update existing or add new
            user_index = next((i for i, u in enumerate(users) if u.get("user_id") == user_id), None)
            
            profile_entry = {
                "user_id": user_id,
                "created_at": next((u.get("created_at") for u in users if u.get("user_id") == user_id), datetime.now().isoformat()),
                "updated_at": datetime.now().isoformat(),
                **profile_data
            }

            if user_index is not None:
                users[user_index] = profile_entry
            else:
                users.append(profile_entry)

            data["users"] = users
            self._write_json(profiles_file, data)
            return True
        except Exception as e:
            print(f"Error saving profile: {e}")
            return False

    def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile"""
        try:
            profiles_file = self.db_files["profiles"]
            data = self._read_json(profiles_file)
            return next((u for u in data.get("users", []) if u.get("user_id") == user_id), None)
        except Exception as e:
            print(f"Error retrieving profile: {e}")
            return None

    # ── Campaign Management ────────────────────────────────────────────────

    def save_campaign(self, user_id: str, campaign_data: Dict) -> bool:
        """Save campaign"""
        try:
            campaigns_file = self.db_files["campaigns"]
            data = self._read_json(campaigns_file)

            campaign = {
                "id": campaign_data.get("id", len(data.get("campaigns", [])) + 1),
                "user_id": user_id,
                "created_at": datetime.now().isoformat(),
                **campaign_data
            }

            data.setdefault("campaigns", []).append(campaign)
            self._write_json(campaigns_file, data)
            return True
        except Exception as e:
            print(f"Error saving campaign: {e}")
            return False

    def get_user_campaigns(self, user_id: str) -> List[Dict]:
        """Get user's campaigns"""
        try:
            campaigns_file = self.db_files["campaigns"]
            data = self._read_json(campaigns_file)
            return [c for c in data.get("campaigns", []) if c.get("user_id") == user_id]
        except Exception as e:
            print(f"Error retrieving campaigns: {e}")
            return []

    # ── Social Media Posts Management ───────────────────────────────────────

    def save_social_post(self, user_id: str, post_data: Dict) -> bool:
        """Save social media post record"""
        try:
            posts_file = self.db_files["social_media_posts"]
            data = self._read_json(posts_file)

            post = {
                "id": len(data.get("posts", [])) + 1,
                "user_id": user_id,
                "created_at": datetime.now().isoformat(),
                **post_data
            }

            data.setdefault("posts", []).append(post)
            self._write_json(posts_file, data)
            return True
        except Exception as e:
            print(f"Error saving social post: {e}")
            return False

    def get_user_social_posts(self, user_id: str, platform: Optional[str] = None) -> List[Dict]:
        """Get user's social media posts"""
        try:
            posts_file = self.db_files["social_media_posts"]
            data = self._read_json(posts_file)
            posts = [p for p in data.get("posts", []) if p.get("user_id") == user_id]
            if platform:
                posts = [p for p in posts if p.get("platform") == platform]
            return posts
        except Exception as e:
            print(f"Error retrieving social posts: {e}")
            return []

    # ── Settings Management ────────────────────────────────────────────────

    def save_setting(self, key: str, value: Any, user_id: Optional[str] = None) -> bool:
        """Save application or user setting"""
        try:
            settings_file = self.db_files["settings"]
            data = self._read_json(settings_file)

            if user_id:
                data.setdefault("user_settings", {}).setdefault(user_id, {})[key] = value
            else:
                data.setdefault("app_settings", {})[key] = value

            self._write_json(settings_file, data)
            return True
        except Exception as e:
            print(f"Error saving setting: {e}")
            return False

    def get_setting(self, key: str, user_id: Optional[str] = None, default: Any = None) -> Any:
        """Get application or user setting"""
        try:
            settings_file = self.db_files["settings"]
            data = self._read_json(settings_file)

            if user_id:
                return data.get("user_settings", {}).get(user_id, {}).get(key, default)
            else:
                return data.get("app_settings", {}).get(key, default)
        except Exception as e:
            print(f"Error retrieving setting: {e}")
            return default

    # ── Utility Methods ────────────────────────────────────────────────────

    def _read_json(self, file_path: Path) -> Dict:
        """Read JSON file with error handling"""
        try:
            if not file_path.exists():
                return {}
            return json.loads(file_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return {}

    def _write_json(self, file_path: Path, data: Dict):
        """Write JSON file with backup"""
        try:
            # Create backup before writing
            if file_path.exists():
                backup_path = file_path.with_suffix(".backup.json")
                shutil.copy2(file_path, backup_path)

            file_path.write_text(
                json.dumps(data, indent=2, ensure_ascii=False),
                encoding="utf-8"
            )
        except Exception as e:
            print(f"Error writing {file_path}: {e}")

    def export_data(self, export_path: Path, user_id: Optional[str] = None) -> bool:
        """Export user data or all data"""
        try:
            export_data = {}

            for key, file_path in self.db_files.items():
                full_data = self._read_json(file_path)
                if user_id:
                    # Filter by user
                    if key == "history" or key == "profiles" or key == "campaigns" or key == "social_media_posts":
                        if key == "profiles":
                            export_data[key] = [u for u in full_data.get("users", []) if u.get("user_id") == user_id]
                        else:
                            key_name = "entries" if key == "history" else "campaigns" if key == "campaigns" else "posts"
                            export_data[key] = [e for e in full_data.get(key_name, []) if e.get("user_id") == user_id]
                else:
                    export_data[key] = full_data

            export_path.write_text(
                json.dumps(export_data, indent=2, ensure_ascii=False),
                encoding="utf-8"
            )
            return True
        except Exception as e:
            print(f"Error exporting data: {e}")
            return False

    def get_database_stats(self) -> Dict:
        """Get database statistics"""
        stats = {
            "platform": self.platform,
            "db_path": str(self.db_base_path),
            "files": {}
        }

        for key, path in self.db_files.items():
            data = self._read_json(path)
            size = path.stat().st_size if path.exists() else 0
            
            if key == "history":
                count = len(data.get("entries", []))
            elif key == "profiles":
                count = len(data.get("users", []))
            elif key == "campaigns":
                count = len(data.get("campaigns", []))
            elif key == "social_media_posts":
                count = len(data.get("posts", []))
            else:
                count = 0

            stats["files"][key] = {
                "path": str(path),
                "size_bytes": size,
                "records": count
            }

        return stats


# Global instance
db_manager = DatabaseManager()
