# Social Media Integration for MuseAI

This module provides LinkedIn and Instagram integration capabilities for MuseAI.

## Features

- **LinkedIn Integration**: Share generated content to LinkedIn
- **Instagram Integration**: Share generated content to Instagram
- **Social Media Scheduling**: Schedule posts for optimal engagement
- **Analytics Tracking**: Track social media performance

## Required Packages

```
requests>=2.31.0
python-social-auth>=0.4.2
social-auth-app-django>=5.0.0
linkedin-api>=2.0.0
instagrapi>=2.0.0
```

## Setup Instructions

### LinkedIn Integration

1. Create a LinkedIn App: https://www.linkedin.com/developers/apps
2. Get your Client ID and Client Secret
3. Add environment variables:
   ```
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback
   ```

### Instagram Integration

1. Create an Instagram App: https://developers.facebook.com
2. Set up Instagram Graph API
3. Add environment variables:
   ```
   INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id
   INSTAGRAM_ACCESS_TOKEN=your_access_token
   ```

## Usage Examples

See `social_media_integration.py` and API endpoints documentation.
