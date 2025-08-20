# Fantasy Draft Board Tracker

A modern, responsive web application for tracking fantasy sports draft boards in real-time. Built with React and deployed on Netlify, this tool provides a comprehensive solution for managing fantasy drafts with shared state synchronization.

## Features

### Core Functionality
- **Real-time Draft Tracking**: Live updates of draft picks across multiple devices
- **Interactive Draft Board**: Visual grid layout showing all teams and their picks by round
- **Player Management**: Search, filter, and manage available players
- **Keeper System**: Support for keeper leagues with pre-draft player retention
- **Draft History**: Archive and review past drafts

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Theme**: Modern glassmorphism UI with animated gradients
- **Real-time Synchronization**: Share draft state via URL or cloud sync
- **Audio Feedback**: Sound notifications for draft events
- **Export Functionality**: Export draft results to Excel format

### Advanced Features
- **Shared State Management**: Real-time collaboration across multiple devices
- **Draft Settings**: Customizable team count, rounds, and draft order
- **Player Overlay**: Detailed player information and statistics
- **Mobile-Optimized**: Touch-friendly interface with mobile-specific optimizations

## Architecture

### Frontend
- **Framework**: React 18 with Hooks
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **State Management**: Custom DraftStore class with local and remote sync
- **Build Tools**: Babel for JSX transpilation, served as single HTML file

### Backend
- **Platform**: Netlify Functions (Serverless)
- **Runtime**: Node.js 18
- **Storage**: Temporary file system (`/tmp`) for draft state persistence
- **API**: RESTful endpoints for state management

### Key Components

#### React Components
- **App Component**: Main application container and state orchestration
- **Draft Board Component**: Grid-based draft visualization
- **Player List Component**: Searchable and filterable player database
- **Draft Controls Component**: Navigation and draft management interface
- **Settings Modal Component**: Draft configuration and team setup
- **Archives Modal Component**: Historical draft viewing
- **Player Overlay Component**: Detailed player information display
- **Draft Complete Overlay Component**: Post-draft summary and export

#### Backend Functions
- **draft-state.js**: GET endpoint for retrieving current draft state
- **update-draft-state.js**: POST endpoint for updating draft state

## API Endpoints

### GET /api/draft-state.json
Retrieves the current draft state for view-only mode
- **Response**: JSON object containing timestamp and draft state
- **CORS**: Enabled for cross-origin requests
- **Caching**: Disabled for real-time updates

### POST /api/update-draft-state  
Updates the draft state with new picks and changes
- **Payload**: JSON object with timestamp and state data
- **Validation**: Ensures proper data structure
- **Storage**: Persists to temporary file system

## File Structure

```
├── index.html              # Main application (single-page app)
├── netlify.toml           # Netlify configuration and routing
├── shared-state.json      # Default/template state structure
└── netlify/
    └── functions/
        ├── draft-state.js        # GET draft state endpoint
        └── update-draft-state.js # POST state update endpoint
```

## Configuration

### Netlify Settings
- **Functions Directory**: `netlify/functions`
- **Node Version**: 18
- **CORS**: Enabled for all API endpoints
- **Caching**: Disabled for dynamic content

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
    "draftJustCompleted": false
  }
}
```

## Deployment

This application is designed for deployment on Netlify:

1. **Automatic Deployment**: Push to connected Git repository
2. **Function Deployment**: Serverless functions auto-deploy from `netlify/functions`
3. **Environment**: Production-ready with Node.js 18 runtime
4. **Routing**: API endpoints mapped via `netlify.toml` redirects

## Technologies Used

- **React 18**: Modern hooks-based React development
- **Tailwind CSS**: Utility-first CSS framework
- **Babel Standalone**: Client-side JSX transpilation
- **SheetJS (XLSX)**: Excel file export functionality
- **Netlify Functions**: Serverless backend functionality
- **Node.js**: Server-side runtime environment

## Browser Compatibility

- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Responsive breakpoints: 480px, 768px, 1024px+

## Performance Features

- **Lazy Loading**: Components rendered on demand
- **Optimized Rendering**: React memo and callback optimizations
- **Efficient State Management**: Minimal re-renders with custom store
- **Mobile Performance**: Optimized for touch devices and small screens