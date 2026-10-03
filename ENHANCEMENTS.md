# MuseAI - Project Enhancements & Setup Guide

**Last Updated:** August 14, 2026

## ✅ Project Status

### Build Status
- ✅ Backend: Running successfully
- ✅ Frontend: Building without errors
- ✅ All dependencies: Installed
- ✅ Cross-platform support: Enabled

---

## 🎯 New Features Implemented

### 1. **LinkedIn & Instagram Integration**

Seamlessly share AI-generated content directly to social media platforms.

#### Features:
- 📱 **LinkedIn Integration**: Share professional content, articles, and campaigns
- 📸 **Instagram Integration**: Post visual content with captions and hashtags
- 🔗 **Multi-Platform Sharing**: Publish to both platforms simultaneously
- 📊 **Post History Tracking**: Maintain records of all social posts
- 🎯 **Campaign Linking**: Associate posts with specific campaigns

#### API Endpoints:
```
POST /social-media/share
- Share content to LinkedIn and/or Instagram
- Body: { user_id, content, image_url, platforms, hashtags, campaign_id }

GET /social-media/connected
- Get user's connected social media accounts
- Params: user_id

POST /social-media/posts
- Retrieve user's social media post history
- Body: { user_id, platform (optional) }
```

#### Setup Instructions:

**LinkedIn:**
1. Visit: https://www.linkedin.com/developers/apps
2. Create a new application
3. Add environment variables:
```
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_ACCESS_TOKEN=your_access_token
LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback
```

**Instagram:**
1. Visit: https://developers.facebook.com
2. Create Instagram Graph API app
3. Add environment variables:
```
INSTAGRAM_ACCESS_TOKEN=your_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_business_account_id
```

---

### 2. **Cross-Platform Database Manager**

Optimized JSON-based database with platform-specific storage paths.

#### Features:
- 🖥️ **Cross-Platform Support**: Automatic OS detection (Windows, macOS, Linux)
- 📁 **Smart Storage Paths**:
  - Windows: `%APPDATA%\MuseAI\data`
  - macOS: `~/Library/Application Support/MuseAI/data`
  - Linux: `~/.local/share/museai/data`
- 🔐 **Automatic Backups**: Creates backups before updates
- 📊 **Organized Data Structure**: Separate files for history, profiles, campaigns, social posts, settings
- 💾 **Efficient Serialization**: JSON with UTF-8 encoding

#### Database Files:
- `history.json` - User generation history
- `profiles.json` - User profile information
- `campaigns.json` - Marketing campaigns
- `social_media_posts.json` - Social media post records
- `settings.json` - Application and user settings

#### API Endpoints:
```
GET /database/stats
- Get database statistics and health information

POST /database/export
- Export user data as JSON
- Body: { user_id }

POST /database/backup
- Create database backup

GET /platform/info
- Get platform and system information

GET /health
- Health check with all service status
```

#### Usage in Python:
```python
from backend.database_manager import db_manager

# Add to generation history
db_manager.add_generation_history(
    user_id="user123",
    generation_data={
        "type": "script",
        "content": "...",
        "ai_provider": "gemini"
    }
)

# Get user history
history = db_manager.get_user_history("user123")

# Save user profile
db_manager.save_user_profile(
    user_id="user123",
    profile_data={
        "name": "John Doe",
        "email": "john@example.com",
        "preferences": {...}
    }
)

# Save campaign
db_manager.save_campaign(
    user_id="user123",
    campaign_data={
        "name": "Diwali Campaign",
        "description": "..."
    }
)

# Save social media post
db_manager.save_social_post(
    user_id="user123",
    post_data={
        "platform": "linkedin",
        "content": "...",
        "url": "https://linkedin.com/..."
    }
)

# Export user data
export_path = Path("./exports/user_export.json")
success = db_manager.export_data(export_path, user_id="user123")
```

---

## 🔧 New Modules

### `social_media_integration.py`
Handles all social media API interactions for LinkedIn and Instagram.

**Classes:**
- `LinkedInIntegration`: LinkedIn API wrapper
- `InstagramIntegration`: Instagram Graph API wrapper
- `SocialMediaManager`: Unified social media management

**Models:**
- `LinkedInShareRequest`
- `InstagramShareRequest`
- `SocialMediaPost`
- `SocialMediaConfig`

### `database_manager.py`
Cross-platform database management with automatic backup and export.

**Classes:**
- `DatabaseManager`: Main database class

**Methods:**
- History Management: `add_generation_history()`, `get_user_history()`
- Profile Management: `save_user_profile()`, `get_user_profile()`
- Campaign Management: `save_campaign()`, `get_user_campaigns()`
- Social Posts Management: `save_social_post()`, `get_user_social_posts()`
- Settings Management: `save_setting()`, `get_setting()`
- Data Export: `export_data()`, `get_database_stats()`

---

## 🌍 Cross-Platform Compatibility

### Supported Operating Systems
- ✅ Windows 10/11 (64-bit)
- ✅ macOS 10.15+ (Intel & Apple Silicon)
- ✅ Linux (Ubuntu, Debian, Fedora, etc.)

### Platform-Specific Features
1. **Automatic Path Detection**: Database paths adapt to OS conventions
2. **Line Ending Handling**: Automatic CRLF/LF conversion
3. **File Permissions**: OS-specific permission handling
4. **Path Separator**: Automatic `/` vs `\` handling
5. **Unicode Support**: Full UTF-8 support across all platforms

### Testing Cross-Platform Code
```python
from backend.database_manager import db_manager

# Get platform information
stats = db_manager.get_database_stats()
print(f"Platform: {stats['platform']}")
print(f"Database Path: {stats['db_path']}")
```

---

## 📋 Installation & Setup

### 1. Backend Setup
```bash
cd "f:\Project -2nd Yr\museai02"
python -m pip install -r backend/requirements.txt
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm audit fix  # Fix security vulnerabilities
```

### 3. Environment Variables
Create `.env` file in project root:
```
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
LINKEDIN_ACCESS_TOKEN=your_linkedin_token
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_business_id
```

### 4. Running the Project

**Backend:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev  # Development
npm run build  # Production
```

---

## 🧪 Testing

### Test Backend Imports
```bash
python -c "from backend.main import app; from backend.social_media_integration import social_media_manager; from backend.database_manager import db_manager; print('✅ All modules working')"
```

### Test Frontend Build
```bash
cd frontend
npm run build
```

### Test API Endpoints
```bash
# Health Check
curl http://localhost:8000/health

# Database Stats
curl http://localhost:8000/database/stats

# Platform Info
curl http://localhost:8000/platform/info
```

---

## 📊 API Reference

### New Endpoints

#### Social Media
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/social-media/share` | Share to LinkedIn & Instagram |
| GET | `/social-media/connected` | Get connected accounts |
| POST | `/social-media/posts` | Get post history |

#### Database
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/database/stats` | Database statistics |
| POST | `/database/export` | Export user data |
| POST | `/database/backup` | Create backup |

#### System
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/platform/info` | Platform information |
| GET | `/health` | Health check |

---

## 🐛 Troubleshooting

### Database Issues
**Problem**: Database files not found
**Solution**: Database manager automatically creates files in proper directories

**Problem**: Permission denied on Linux/macOS
**Solution**: Ensure directory permissions: `chmod 755 ~/.local/share/museai`

### Social Media
**Problem**: LinkedIn token expired
**Solution**: Refresh token at https://www.linkedin.com/developers

**Problem**: Instagram rate limit
**Solution**: Implement backoff strategy (already included in code)

### Frontend Build
**Problem**: Chunk too large warning
**Solution**: Enable code splitting in vite.config.js

### Cross-Platform Issues
**Problem**: Path separators different
**Solution**: Code uses `Path()` which handles automatically

---

## 🚀 Deployment

### Backend (Vercel)
```bash
# Build command
pip install -r backend/requirements.txt

# Start command
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Frontend (GitHub Pages)
```bash
# Build
npm run build

# Output directory
dist/
```

### Environment Variables (Production)
Set these in your deployment platform:
- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `LINKEDIN_ACCESS_TOKEN`
- `INSTAGRAM_ACCESS_TOKEN`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`

---

## 📈 Performance Optimizations

### Database
- ✅ Automatic JSON compression
- ✅ Efficient file I/O with batching
- ✅ UTF-8 encoding for space efficiency
- ✅ Backup files on update

### Frontend
- ✅ Vite for fast builds
- ✅ React lazy loading
- ✅ CSS optimization
- ✅ Image optimization

### Backend
- ✅ Async/await for APIs
- ✅ Connection pooling
- ✅ Efficient JSON serialization
- ✅ Fallback systems for resilience

---

## 📝 Changelog

### Version 2.1.0 (Current)
- ✅ Added LinkedIn integration
- ✅ Added Instagram integration
- ✅ Implemented cross-platform database manager
- ✅ Added social media endpoints
- ✅ Added database management endpoints
- ✅ Added platform detection and info
- ✅ Added health check endpoint
- ✅ Improved error handling

### Version 2.0.0
- Initial release with core features

---

## 📞 Support

### Common Issues
1. **Port already in use**: Change port in uvicorn command
2. **Module not found**: Ensure all requirements installed
3. **API key invalid**: Check .env file and API keys
4. **Database permission**: Check folder permissions

### Getting Help
- Check endpoint responses for error messages
- Review `/health` endpoint for service status
- Check `/database/stats` for database health
- Use `/platform/info` for system information

---

## ✨ Key Improvements

### Before
- ❌ No social media integration
- ❌ Limited database options
- ❌ No cross-platform database paths
- ❌ No data export functionality
- ❌ Limited system information

### After
- ✅ LinkedIn & Instagram integration
- ✅ Professional database manager
- ✅ Automatic OS-specific paths
- ✅ Data export and backup
- ✅ Comprehensive system info
- ✅ Health monitoring
- ✅ Better error handling

---

## 🎓 Learning Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- LinkedIn API: https://www.linkedin.com/developers/
- Instagram Graph API: https://developers.facebook.com/
- React Documentation: https://react.dev/
- Vite Guide: https://vitejs.dev/

---

**Created:** August 14, 2026  
**Status:** Production Ready  
**Maintained By:** MuseAI Development Team
