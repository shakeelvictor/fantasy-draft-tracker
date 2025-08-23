# Fantasy Draft Board Tracker

A modern, responsive web application for tracking fantasy sports draft boards in real-time. Built with React and deployed on Netlify, this tool provides a comprehensive solution for managing fantasy drafts with shared state synchronization, persistent notes, and database integration.

## Features

### Core Functionality
- **Real-time Draft Tracking**: Live updates of draft picks across multiple devices
- **Interactive Draft Board**: Visual grid layout showing all teams and their picks by round
- **Player Management**: Search, filter, and manage available players with FantasyPros integration
- **Comprehensive Notes System**: Add notes to any player (drafted or undrafted) with database persistence
- **Keeper System**: Support for keeper leagues with pre-draft player retention
- **Draft History**: Archive and review past drafts with full state preservation

### Notes System
- **Universal Notes**: Add notes to any player through Player Info modals
- **Pick-based Notes**: Notes tied to specific draft positions (`round-teamId`)
- **Player-based Notes**: Notes tied to individual players (`player-playerId`)
- **Database Persistence**: Notes stored in PostgreSQL with localStorage fallback
- **View-only Compatibility**: Notes display consistently in both regular and view-only modes
- **Real-time Sync**: Notes synchronize across all connected devices

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Theme**: Modern glassmorphism UI with animated gradients
- **Real-time Synchronization**: Share draft state via URL with view-only mode support
- **Audio Feedback**: Sound notifications for draft events
- **Export Functionality**: Export draft results to Excel format with comprehensive data
- **Mobile-Optimized Interface**: Touch-friendly controls and hamburger menu

### Advanced Features
- **Database Integration**: PostgreSQL (Neon) for persistent data storage
- **Player Information Modals**: Detailed player stats and expert analysis
- **Draft Settings**: Customizable team count, rounds, and draft order
- **Archive System**: Save and load multiple draft states
- **View-Only Mode**: Share drafts with read-only access
- **News Integration**: Latest player news and updates

## Architecture

### Frontend
- **Framework**: React 18 with Hooks and functional components
- **Styling**: Tailwind CSS with custom glassmorphism effects and responsive design
- **State Management**: Custom DraftStore class with local and database synchronization
- **Build Tools**: Single HTML file with Babel standalone for JSX transpilation
- **Player Data**: Integration with Sleeper API and FantasyPros data

### Backend
- **Platform**: Netlify Functions (Serverless)
- **Runtime**: Node.js 18
- **Database**: PostgreSQL (Neon Database) with connection pooling
- **Storage**: Database-first with localStorage fallback for offline capability
- **API**: RESTful endpoints for state management and notes system

### Database Schema
- **draft_state**: Main draft state storage with JSONB fields
- **pick_notes**: Dedicated notes table with pick/player key mapping
- **Indexes**: Optimized for fast retrieval and updates

### Key Components

#### React Components
- **App Component**: Main application container and state orchestration
- **Draft Board Component**: Grid-based draft visualization with note indicators
- **Player List Component**: Searchable and filterable player database
- **FantasyPro Player Modal**: Comprehensive player information with notes interface
- **Draft Controls Component**: Navigation and draft management interface
- **Settings Modal Component**: Draft configuration and team setup
- **Archives Modal Component**: Historical draft viewing and management
- **Player Overlay Component**: Animated draft celebration overlay
- **Draft Complete Overlay Component**: Post-draft summary and export functionality
- **Pick Note Modal Component**: Dedicated note editing interface
- **News Component**: Latest player news and updates

#### Backend Functions
- **draft-state.js**: GET/POST endpoints for retrieving and updating draft state
- **update-draft-state.js**: Dedicated POST endpoint for state updates
- **notes.js**: Complete CRUD operations for the notes system (GET, POST, DELETE)
- **init-db.js**: Database initialization and table creation
- **db-test.js**: Database connection testing and diagnostics
- **save-archive.js**: Archive creation and storage
- **load-archives.js**: Archive retrieval and management
- **delete-archive.js**: Archive cleanup functionality

## API Endpoints

### Draft State Management
- **GET /api/draft-state.json**: Retrieve current draft state for view-only mode
- **POST /api/draft-state**: Update draft state with validation
- **POST /api/update-draft-state**: Legacy endpoint for state updates

### Notes System
- **GET /api/notes**: Load all pick/player notes from database
- **POST /api/notes**: Save or update individual notes with upsert functionality
- **DELETE /api/notes/{pickKey}**: Remove specific notes by key

### Archive System
- **POST /api/save-archive**: Save current draft state as archive
- **GET /api/load-archives**: Retrieve list of available archives
- **POST /api/load-archives**: Load specific archived draft
- **DELETE /api/delete-archive**: Remove archived draft

### Database Management
- **GET /api/init-db**: Initialize database tables and schema
- **GET /api/db-test**: Database connection testing and diagnostics

## File Structure

```
├── index.html              # Main application (comprehensive single-page app)
├── netlify.toml           # Netlify configuration, routing, and CORS headers
├── build.sh               # Build script for deployment
├── shared-state.json      # Default/template state structure
├── PICK_NOTES_DATABASE.md # Notes system documentation
└── netlify/
    └── functions/
        ├── draft-state.js        # Main draft state endpoint
        ├── update-draft-state.js # Legacy state update endpoint
        ├── notes.js              # Notes CRUD operations
        ├── init-db.js            # Database initialization
        ├── db-test.js            # Database diagnostics
        ├── save-archive.js       # Archive creation
        ├── load-archives.js      # Archive management
        ├── delete-archive.js     # Archive cleanup
        └── hello.js              # Health check endpoint
```

## Configuration

### Netlify Settings
- **Functions Directory**: `netlify/functions`
- **Node Version**: 18
- **Build Command**: `chmod +x build.sh && ./build.sh`
- **Publish Directory**: `.` (root)
- **Functions Bundler**: esbuild for optimal performance

### Environment Variables
- **NETLIFY_DATABASE_URL** or **DATABASE_URL**: PostgreSQL connection string
- **NODE_VERSION**: 18 (specified in netlify.toml)

### CORS Configuration
```toml
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Headers = "Content-Type"
    Access-Control-Allow-Methods = "GET, POST, DELETE, OPTIONS"
    Cache-Control = "no-cache, no-store, must-revalidate"
```

### Draft State Structure
```json
{
  "timestamp": 0,
  "state": {
    "picks": [],
    "currentPick": null,
    "keepers": {},
    "teams": [],
    "draftSettings": {},
    "recentPick": null,
    "draftJustCompleted": false,
    "pickNotes": {}
  }
}
```

### Notes Database Schema
```sql
CREATE TABLE IF NOT EXISTS pick_notes (
    id SERIAL PRIMARY KEY,
    pick_key VARCHAR(50) NOT NULL UNIQUE,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Deployment

This application is designed for deployment on Netlify with database integration:

### Setup Process
1. **Repository Connection**: Link to Git repository for automatic deployments
2. **Environment Configuration**: Set `DATABASE_URL` for PostgreSQL connection
3. **Database Initialization**: Run `/api/init-db` to create required tables
4. **Function Deployment**: All serverless functions deploy automatically

### Database Setup
1. **Create Neon Database**: Set up PostgreSQL instance on Neon
2. **Configure Connection**: Add connection string to Netlify environment variables
3. **Initialize Tables**: Visit `/api/init-db` to create database schema
4. **Test Connection**: Use `/api/db-test` to verify setup

### Verification Steps
1. **Health Check**: Visit `/api/hello` to test function deployment
2. **Database Test**: Visit `/api/db-test` for database connectivity
3. **Draft Test**: Create a test draft to verify full functionality
4. **Notes Test**: Add notes to verify database persistence

## Technologies Used

### Frontend Technologies
- **React 18**: Modern hooks-based React development with functional components
- **Tailwind CSS**: Utility-first CSS framework with custom glassmorphism design
- **Babel Standalone**: Client-side JSX transpilation for single-file deployment
- **SheetJS (XLSX)**: Excel file export functionality with comprehensive data
- **Web APIs**: LocalStorage, Fetch API, Audio API for rich functionality

### Backend Technologies
- **Netlify Functions**: Serverless backend with Node.js runtime
- **PostgreSQL**: Robust database with JSONB support for complex data structures
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Node.js**: Server-side runtime environment with modern ES6+ features

### External Integrations
- **Sleeper API**: Player data and images
- **FantasyPros**: Expert analysis and player information
- **GitHub**: Version control and deployment integration

## Browser Compatibility

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 88+, Samsung Internet 15+
- **Features Required**: ES6+ support, Fetch API, CSS Grid, Flexbox
- **Responsive Design**: Breakpoints at 480px, 640px, 768px, 1024px, 1280px

## Performance Features

### Frontend Optimizations
- **Component Optimization**: React.memo and useCallback for minimal re-renders
- **Efficient State Management**: Custom store with selective subscriptions
- **Lazy Loading**: On-demand component rendering and data fetching
- **Image Optimization**: Lazy loading with error handling for player images

### Backend Optimizations
- **Database Connection Pooling**: Efficient PostgreSQL connections via Neon
- **Response Caching**: Strategic caching headers for optimal performance
- **Error Handling**: Comprehensive error recovery with fallback mechanisms
- **Data Validation**: Input sanitization and validation at all API endpoints

### Mobile Performance
- **Touch Optimizations**: Native mobile interactions and gestures
- **Responsive Images**: Optimized images for different screen densities
- **Offline Capability**: localStorage fallback for critical functionality
- **Progressive Enhancement**: Core functionality works without JavaScript

## Usage

### Basic Draft Setup
1. **Configure Teams**: Set up team names and draft settings
2. **Set Keepers**: Configure pre-draft keeper selections if applicable
3. **Start Draft**: Begin the drafting process with real-time updates
4. **Add Notes**: Use Player Info modals to add notes to any player
5. **Share Draft**: Use view-only URL for observers

### Advanced Features
- **Archive Drafts**: Save completed drafts for future reference
- **Export Data**: Generate Excel files with comprehensive draft analysis
- **Database Notes**: All notes persist across sessions and devices
- **Multi-device Sync**: Real-time updates across all connected devices

## Version History

- **stable-20250823**: Complete notes system with database integration
- **stable-20250822**: Previous stable release

## Support

For issues, feature requests, or contributions, please refer to the project repository or create an issue on GitHub.