# MuseAI - Project Documentation

## Overview
MuseAI is a full-stack React + FastAPI application for AI-powered brand and viral content generation. It leverages cultural insights and AI to create culturally-relevant marketing content tailored to Indian regions and festivals.

---

## FRONTEND

### Framework & Technologies
- **React** 18.3.1 - UI library
- **Vite** 5.3.1 - Build tool and dev server
- **React Router DOM** 6.23.1 - Client-side routing
- **Axios** 1.7.2 - HTTP client
- **Firebase** 10.12.0 - Authentication and Storage

### Frontend Structure
```
frontend/src/
├── pages/                    # 12 main pages
│   ├── Home.jsx             # Landing page
│   ├── Login.jsx            # Authentication
│   ├── Dashboard.jsx        # Main dashboard
│   ├── Generate.jsx         # Content generation interface
│   ├── History.jsx          # View past generations
│   ├── Profile.jsx          # User profile management
│   ├── Pricing.jsx          # Pricing information
│   ├── Settings.jsx         # User settings
│   ├── HelpDesk.jsx         # Support/Help
│   ├── Aihub.jsx            # AI suggestion hub
│   ├── BrandAdvisor.jsx     # Brand advisory
│   └── ViralStudio.jsx      # Viral content studio
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx
│   │   └── Sidebar.jsx
│   └── ui/
│       ├── ConfirmModal.jsx
│       ├── Icons.jsx
│       ├── ProtectedRoute.jsx
│       └── ThemeToggle.jsx
├── context/                 # Global state management
│   ├── AuthContext.jsx      # Authentication state
│   ├── HistoryContext.jsx   # User history state
│   ├── LanguageContext.jsx  # Language preferences
│   └── ThemeContext.jsx     # Dark/Light theme
├── hooks/
│   └── useGenerate.js       # Custom hook for content generation
├── utils/
│   ├── api.js              # API client setup
│   ├── firebase.js         # Firebase configuration
│   └── animations.js       # Animation utilities
└── styles/
    ├── animations.css
    ├── index.css
    └── theme.css
```

### Key Frontend Features
- **Multi-page SPA** with protected routes
- **State management** using React Context API (Auth, History, Language, Theme)
- **Responsive design** with custom theming
- **Page transitions** with CSS animations
- **Firebase Integration** for:
  - Email/Password authentication
  - Google OAuth
  - File storage
- **API Communication** via Axios with 90-second timeout

---

## DATABASE

### Storage Architecture
MuseAI uses **hybrid storage** combining cloud and local solutions:

#### 1. **Firebase (Cloud)**
- **Authentication Database**
  - User accounts (email/password)
  - Google OAuth credentials
  - User sessions
  
- **Firebase Storage**
  - User-generated files
  - Media assets
  - Project files

#### 2. **Local JSON Files** (Backend)
Located in `backend/data/`:
- **dataset.json** - Few-shot examples for content generation
- **history.json** - User generation history
- **cultural_data.json** - Regional and festival information

#### 3. **Cultural Data Structure**
```json
{
  "festivals": {
    "Tamil Nadu": ["Pongal", "Karthigai Deepam", "Deepavali", ...],
    "Kerala": ["Onam", "Vishu", "Thrissur Pooram", ...],
    "Maharashtra": ["Ganesh Chaturthi", "Gudi Padwa", ...],
    // ... other regions
  },
  "regions": {
    "Tamil Nadu": {
      "language": "Tamil",
      "culture_keywords": ["அன்பு", "குடும்பம்", ...],
      "food": ["idli", "dosa", "sambar", ...],
      "values": ["family", "tradition", ...],
      "popular_brands": ["Saravana Stores", ...],
      "ad_style": "emotional, family-centric, tradition-rooted"
    },
    // ... other regions with similar structure
  }
}
```

### Data Models (Pydantic)

#### BrandInfo
```python
{
  "brand": str,
  "industry": str,
  "audience": str,
  "tone": str,
  "theme": str,
  "output_language": str
}
```

#### CultureProfile
```python
{
  "region": str,
  "festival": str,
  "elements": List[str],
  "language_style": str
}
```

#### Content Generation Options
- **ScriptOptions** - Video script parameters
- **VisualOptions** - Visual design parameters
- **MusicOptions** - Audio/jingle parameters
- **CampaignOptions** - Marketing campaign parameters

---

## AI FEATURES

### AI Providers Supported
1. **Google Gemini**
   - Model: `gemini-2.5-flash`
   - Model: `gemini-2.5-flash-lite`
   - Supports vision (image analysis)
   
2. **Groq**
   - Model: `llama-3.3-70b-versatile`
   - Max tokens: 4000
   - Temperature: 0.85
   - Real-time integration

### AI Capabilities

#### 1. Content Generation
- **Scripts** - Video scripts with cultural context
- **Visuals** - Design concepts and visual direction
- **Music** - Jingles and audio descriptions
- **Campaigns** - Complete marketing strategies

#### 2. Smart Features
- **Few-shot learning** - AI learns from dataset examples
- **Cultural adaptation** - Content tailored to specific regions/festivals
- **Brand-specific generation** - Understands brand voice and audience
- **Multi-language output** - Generates in multiple languages

#### 3. Vision AI
- Image-to-content generation
- Visual concept understanding
- Image-based prompt enhancement

#### 4. Fallback System
- Local generation when APIs fail
- Ensures service continuity
- Grammar-based content templates

### AI Integration Endpoints
- `POST /generate` - Main content generation
- `POST /viral` - Viral content strategy
- `POST /chat` - AI chat for brainstorming
- Async processing with error handling and fallbacks

---

## FUNCTIONAL REQUIREMENTS

### Core Features

#### 1. User Authentication
- ✅ Email/Password signup and login
- ✅ Google OAuth integration
- ✅ Secure session management
- ✅ User profile management
- ✅ Logout functionality

#### 2. Content Generation
- ✅ Script generation (video scripts)
- ✅ Visual concept generation (design briefs)
- ✅ Music/jingle generation
- ✅ Campaign strategy generation
- ✅ Multiple variants per content type
- ✅ Customizable generation parameters

#### 3. Cultural Intelligence
- ✅ Region-based content adaptation
- ✅ Festival-aware generation
- ✅ Language-specific output
- ✅ Cultural value mapping
- ✅ Local food and tradition references

#### 4. Brand Management
- ✅ Brand profile creation and editing
- ✅ Audience targeting
- ✅ Brand voice/tone settings
- ✅ Industry-specific templates

#### 5. History & Tracking
- ✅ Generation history storage
- ✅ History retrieval by user
- ✅ History synchronization
- ✅ Persistent storage
- ✅ View past generations

#### 6. AI-Powered Tools
- ✅ Brand Advisor - Brand strategy recommendations
- ✅ Viral Studio - Viral content strategy
- ✅ AI Hub - AI suggestion aggregator
- ✅ Chat with AI - Interactive brainstorming
- ✅ Help Desk - AI-assisted support

#### 7. User Dashboard
- ✅ Quick access to all generation tools
- ✅ Recent history display
- ✅ Profile information
- ✅ Settings access

#### 8. Settings & Preferences
- ✅ Language preferences
- ✅ Theme selection (Dark/Light mode)
- ✅ Notification settings
- ✅ Account management
- ✅ Privacy controls

#### 9. Pricing & Plans
- ✅ Display pricing information
- ✅ Plan comparison
- ✅ Subscription management interface

---

## NON-FUNCTIONAL REQUIREMENTS

### Performance
- ✅ **API Timeout**: 90 seconds for content generation
- ✅ **Response Time**: Sub-500ms for most API calls
- ✅ **Caching**: Firebase caching for user data
- ✅ **Optimization**: Vite for production builds

### Scalability
- ✅ **Stateless backend** - Multiple instances can run
- ✅ **Cloud-based auth** - Firebase handles user scaling
- ✅ **JSON data storage** - Can scale with file storage
- ✅ **Load distribution** - CORS-enabled for multiple frontend URLs

### Reliability
- ✅ **Error handling** - Graceful fallbacks for AI API failures
- ✅ **CORS support** - Multi-origin request handling
- ✅ **Health check** - Root endpoint `/` returns status
- ✅ **Data persistence** - Both cloud and local storage

### Security
- ✅ **CORS middleware** - Controlled origin access
- ✅ **Firebase authentication** - Secure user sessions
- ✅ **API key protection** - Environment variables (dotenv)
- ✅ **Protected routes** - Frontend route protection
- ✅ **HTTPS** - Production deployment on secure protocols

### Maintainability
- ✅ **Type hints** - Pydantic models for API validation
- ✅ **Code organization** - Clear separation of concerns
- ✅ **Documentation** - Dataset and config files documented
- ✅ **Modular design** - Independent context providers
- ✅ **Testing** - Test suite in `backend/tests/`

### Accessibility
- ✅ **Theme toggle** - Dark/Light mode support
- ✅ **Language support** - Multi-language output
- ✅ **Responsive design** - Mobile-friendly UI

### Compliance
- ✅ **Data privacy** - User data stored securely
- ✅ **Terms of service** - Help desk and settings pages
- ✅ **API rate limiting** - Configurable via backend
- ✅ **Audit logs** - History tracking available

---

## LIST OF MODULES

### Backend Modules (Python/FastAPI)

#### Core Modules
| Module | Purpose |
|--------|---------|
| `main.py` | Main FastAPI application, endpoints, and AI integration |
| `requirements.txt` | Python dependencies |
| `cultural_data.json` | Regional and festival data for content generation |
| `render.yaml` | Deployment configuration |

#### Data Management
| Module | Purpose |
|--------|---------|
| `data/dataset.json` | Few-shot examples for AI learning |
| `data/history.json` | User generation history storage |

#### Testing
| Module | Purpose |
|--------|---------|
| `tests/test_viral_fallback.py` | Unit tests for fallback generation |

### Backend API Endpoints

#### Content Generation
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/generate` | Generate scripts, visuals, music, campaigns |
| POST | `/viral` | Generate viral content strategies |
| POST | `/chat` | Chat with AI for brainstorming |

#### Configuration
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Health check / Root endpoint |
| GET | `/config/culture-data` | Retrieve cultural data (regions, festivals) |
| GET | `/ai/providers` | List available AI providers |

#### History Management
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/history` | Retrieve user generation history |
| POST | `/history` | Save new generation to history |
| POST | `/history/sync` | Sync history across devices |

### Frontend Modules (React/JavaScript)

#### Pages (12 Components)
| Page | Module | Purpose |
|------|--------|---------|
| Home | `Home.jsx` | Landing page, introduction |
| Login | `Login.jsx` | Authentication page |
| Dashboard | `Dashboard.jsx` | Main user dashboard |
| Generate | `Generate.jsx` | Content generation interface |
| History | `History.jsx` | View past generations |
| Profile | `Profile.jsx` | User profile management |
| Pricing | `Pricing.jsx` | Pricing and plans |
| Settings | `Settings.jsx` | User preferences |
| Help Desk | `HelpDesk.jsx` | Support and help |
| AI Hub | `Aihub.jsx` | AI suggestions aggregator |
| Brand Advisor | `BrandAdvisor.jsx` | AI brand strategy |
| Viral Studio | `ViralStudio.jsx` | Viral content creation |

#### Layout Components
| Component | Purpose |
|-----------|---------|
| `AppLayout.jsx` | Main layout wrapper |
| `Sidebar.jsx` | Navigation sidebar |

#### UI Components
| Component | Purpose |
|-----------|---------|
| `ProtectedRoute.jsx` | Route protection for authenticated users |
| `ConfirmModal.jsx` | Confirmation dialog |
| `ThemeToggle.jsx` | Dark/Light mode switcher |
| `Icons.jsx` | Icon library |

#### Context Providers (Global State)
| Context | Purpose |
|---------|---------|
| `AuthContext.jsx` | User authentication state |
| `HistoryContext.jsx` | Generation history state |
| `LanguageContext.jsx` | Language preference state |
| `ThemeContext.jsx` | Theme (dark/light) state |

#### Custom Hooks
| Hook | Purpose |
|------|---------|
| `useGenerate.js` | Content generation logic hook |

#### Utilities
| Utility | Purpose |
|---------|---------|
| `api.js` | Axios configuration and API methods |
| `firebase.js` | Firebase initialization and auth methods |
| `animations.js` | Animation helper functions |

#### Styles
| File | Purpose |
|------|---------|
| `index.css` | Base styles |
| `animations.css` | Animation keyframes |
| `theme.css` | Theme variables |

### Configuration Files

#### Backend
- `render.yaml` - Deployment config for Render platform
- `requirements.txt` - Python dependencies

#### Frontend
- `package.json` - Node.js dependencies and scripts
- `vite.config.js` - Vite build configuration
- `firebase.js` - Firebase configuration

#### Root Project
- `README.md` - Project documentation
- `DEPLOY_BACKEND.md` - Deployment instructions
- `main.py` / `app.py` - Root entry points

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Vite)                   │
│  Pages, Components, Contexts, Hooks, Styling, Animations   │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Axios HTTP
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  API GATEWAY (CORS)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                 BACKEND (FastAPI)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Content Generation | AI Integration | History Mgmt │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼──┐        ┌───▼──┐        ┌───▼────────┐
    │Google│        │Groq  │        │ Firebase   │
    │Gemini│        │ AI   │        │ Auth/Store │
    └──────┘        └──────┘        └────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         ┌────▼─────┐        ┌─────▼────┐
         │Local JSON│        │Firebase  │
         │Database  │        │Database  │
         └──────────┘        └──────────┘
```

---

## Deployment

### Frontend
- Hosted on **Vercel**
- URLs: 
  - https://frontend-sage-gamma-22.vercel.app
  - https://frontend-r6jvjs6ab-fouzuls-projects.vercel.app

### Backend
- Deployed on **Render** (via `render.yaml`)
- Uses Uvicorn ASGI server
- Environment variables for API keys

---

## Summary Table

| Category | Technology | Details |
|----------|-----------|---------|
| **Frontend** | React 18.3.1 + Vite 5.3.1 | SPA with routing and context |
| **Backend** | FastAPI 0.111.0 + Uvicorn | REST API with CORS |
| **Database** | Firebase + JSON | Hybrid cloud and local storage |
| **AI** | Google Gemini + Groq | Multi-provider AI generation |
| **Auth** | Firebase Auth | Email + Google OAuth |
| **Storage** | Firebase Storage | User files and media |
| **Deployment** | Vercel + Render | Frontend and backend hosting |

