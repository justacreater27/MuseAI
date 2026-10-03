"""
Social Media Integration Module for MuseAI
Handles LinkedIn and Instagram content sharing and scheduling
"""

import os
import json
from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel
import requests

# ── Social Media Models ────────────────────────────────────────────────────


class LinkedInShareRequest(BaseModel):
    """LinkedIn content sharing request"""
    content: str
    image_url: Optional[str] = None
    campaign_id: Optional[str] = None
    user_id: str


class InstagramShareRequest(BaseModel):
    """Instagram content sharing request"""
    caption: str
    image_url: str
    hashtags: Optional[List[str]] = None
    campaign_id: Optional[str] = None
    user_id: str


class SocialMediaPost(BaseModel):
    """Social media post record"""
    post_id: str
    platform: str  # "linkedin" or "instagram"
    content: str
    image_url: Optional[str] = None
    posted_at: datetime
    engagement_metrics: Optional[Dict] = None
    user_id: str
    campaign_id: Optional[str] = None


class SocialMediaConfig(BaseModel):
    """Social media platform configuration"""
    platform: str
    is_connected: bool
    account_name: Optional[str] = None
    followers_count: Optional[int] = None
    last_synced: Optional[datetime] = None


# ── LinkedIn Integration ───────────────────────────────────────────────────


class LinkedInIntegration:
    """Handle LinkedIn API interactions"""

    def __init__(self):
        self.client_id = os.getenv("LINKEDIN_CLIENT_ID")
        self.client_secret = os.getenv("LINKEDIN_CLIENT_SECRET")
        self.access_token = os.getenv("LINKEDIN_ACCESS_TOKEN")
        self.base_url = "https://api.linkedin.com/v2"

    def share_post(self, user_id: str, content: str, image_url: Optional[str] = None) -> Dict:
        """
        Share content to LinkedIn
        
        Args:
            user_id: MuseAI user ID
            content: Post content text
            image_url: Optional image URL
        
        Returns:
            Response with post details and LinkedIn post ID
        """
        try:
            if not self.access_token:
                return {"error": "LinkedIn not connected", "status": "not_connected"}

            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json",
            }

            # LinkedIn text post payload
            payload = {
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.UGCPost": {
                        "shareContent": {
                            "shareCommentary": {
                                "text": content
                            },
                            "shareMediaCategory": "IMAGE" if image_url else "NONE",
                        }
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }

            # Add image if provided
            if image_url:
                payload["specificContent"]["com.linkedin.ugc.UGCPost"]["shareContent"]["media"] = [
                    {
                        "status": "READY",
                        "description": {
                            "text": content[:100]
                        },
                        "media": image_url,
                        "title": {
                            "text": "MuseAI Generated Content"
                        }
                    }
                ]

            response = requests.post(
                f"{self.base_url}/ugcPosts",
                json=payload,
                headers=headers,
                timeout=30
            )

            if response.status_code == 201:
                return {
                    "status": "success",
                    "platform": "linkedin",
                    "post_id": response.json().get("id"),
                    "url": f"https://www.linkedin.com/feed/update/{response.json().get('id')}",
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "status": "error",
                    "platform": "linkedin",
                    "error": response.text
                }

        except Exception as e:
            return {
                "status": "error",
                "platform": "linkedin",
                "error": str(e)
            }

    def get_profile_info(self) -> Dict:
        """Get LinkedIn profile information"""
        try:
            if not self.access_token:
                return {"error": "LinkedIn not connected"}

            headers = {
                "Authorization": f"Bearer {self.access_token}",
            }

            response = requests.get(
                f"{self.base_url}/me",
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "status": "connected",
                    "platform": "linkedin",
                    "account_name": f"{data.get('localizedFirstName')} {data.get('localizedLastName')}",
                    "user_id": data.get("id")
                }
            else:
                return {"status": "error", "error": response.text}

        except Exception as e:
            return {"status": "error", "error": str(e)}


# ── Instagram Integration ──────────────────────────────────────────────────


class InstagramIntegration:
    """Handle Instagram Graph API interactions"""

    def __init__(self):
        self.access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
        self.business_account_id = os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID")
        self.base_url = "https://graph.instagram.com"

    def share_post(self, caption: str, image_url: str, hashtags: Optional[List[str]] = None) -> Dict:
        """
        Share content to Instagram
        
        Args:
            caption: Post caption text
            image_url: Image URL to post
            hashtags: Optional list of hashtags
        
        Returns:
            Response with Instagram post details
        """
        try:
            if not self.access_token or not self.business_account_id:
                return {"error": "Instagram not connected", "status": "not_connected"}

            # Add hashtags to caption
            full_caption = caption
            if hashtags:
                full_caption += "\n\n" + " ".join([f"#{tag}" for tag in hashtags])

            # Step 1: Create media container
            params = {
                "image_url": image_url,
                "caption": full_caption,
                "access_token": self.access_token
            }

            response = requests.post(
                f"{self.base_url}/{self.business_account_id}/media",
                params=params,
                timeout=30
            )

            if response.status_code != 200:
                return {
                    "status": "error",
                    "platform": "instagram",
                    "error": response.text
                }

            media_id = response.json().get("id")

            # Step 2: Publish media
            publish_params = {
                "creation_id": media_id,
                "access_token": self.access_token
            }

            publish_response = requests.post(
                f"{self.base_url}/{self.business_account_id}/media_publish",
                params=publish_params,
                timeout=30
            )

            if publish_response.status_code == 200:
                post_id = publish_response.json().get("id")
                return {
                    "status": "success",
                    "platform": "instagram",
                    "post_id": post_id,
                    "url": f"https://www.instagram.com/p/{post_id}",
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "status": "error",
                    "platform": "instagram",
                    "error": publish_response.text
                }

        except Exception as e:
            return {
                "status": "error",
                "platform": "instagram",
                "error": str(e)
            }

    def get_profile_info(self) -> Dict:
        """Get Instagram business account information"""
        try:
            if not self.access_token or not self.business_account_id:
                return {"error": "Instagram not connected"}

            params = {"fields": "name,followers_count,biography", "access_token": self.access_token}

            response = requests.get(
                f"{self.base_url}/{self.business_account_id}",
                params=params,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "status": "connected",
                    "platform": "instagram",
                    "account_name": data.get("name"),
                    "followers_count": data.get("followers_count"),
                    "bio": data.get("biography")
                }
            else:
                return {"status": "error", "error": response.text}

        except Exception as e:
            return {"status": "error", "error": str(e)}


# ── Social Media Manager ───────────────────────────────────────────────────


class SocialMediaManager:
    """Unified social media management"""

    def __init__(self):
        self.linkedin = LinkedInIntegration()
        self.instagram = InstagramIntegration()
        self.social_posts_file = os.path.join(
            os.path.dirname(__file__), "data", "social_media_posts.json"
        )

    def share_to_multiple_platforms(
        self,
        user_id: str,
        content: str,
        image_url: str,
        platforms: List[str],
        hashtags: Optional[List[str]] = None,
        campaign_id: Optional[str] = None
    ) -> Dict:
        """
        Share content to multiple social media platforms
        
        Args:
            user_id: MuseAI user ID
            content: Post content
            image_url: Image URL
            platforms: List of platforms ["linkedin", "instagram"]
            hashtags: Optional hashtags
            campaign_id: Optional campaign ID
        
        Returns:
            Dictionary with results from all platforms
        """
        results = {
            "user_id": user_id,
            "campaign_id": campaign_id,
            "timestamp": datetime.now().isoformat(),
            "platforms": {}
        }

        for platform in platforms:
            if platform.lower() == "linkedin":
                results["platforms"]["linkedin"] = self.linkedin.share_post(
                    user_id, content, image_url
                )
            elif platform.lower() == "instagram":
                results["platforms"]["instagram"] = self.instagram.share_post(
                    content, image_url, hashtags
                )

        # Save to history
        self._save_post_history(results)

        return results

    def get_connected_platforms(self, user_id: str) -> Dict:
        """Get user's connected social media accounts"""
        platforms = {}

        linkedin_info = self.linkedin.get_profile_info()
        if linkedin_info.get("status") == "connected":
            platforms["linkedin"] = linkedin_info

        instagram_info = self.instagram.get_profile_info()
        if instagram_info.get("status") == "connected":
            platforms["instagram"] = instagram_info

        return {"user_id": user_id, "platforms": platforms}

    def _save_post_history(self, post_data: Dict):
        """Save social media post to history file"""
        try:
            if not os.path.exists(self.social_posts_file):
                history = []
            else:
                with open(self.social_posts_file, "r", encoding="utf-8") as f:
                    history = json.load(f)

            history.append(post_data)

            with open(self.social_posts_file, "w", encoding="utf-8") as f:
                json.dump(history, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving post history: {e}")


# Initialize global instance
social_media_manager = SocialMediaManager()
