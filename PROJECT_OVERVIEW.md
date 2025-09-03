# Claude Usage Tracker - Project Overview

This document provides a comprehensive understanding of the Claude Usage Tracker application architecture, components, and functionality.

## Project Overview

This is a **Claude Usage Tracker** application - a React-based single-page application that monitors and displays Claude AI usage statistics in real-time. It integrates with the `ccusage` CLI tool to collect actual usage data from VS Code and web platforms.

**Note**: This is NOT the Target Solutions LMS microfrontend architecture described in CLAUDE.md. The CLAUDE.md appears to be a template/example from another project.

## Key Technologies & Architecture

### Core Stack
- **React 18.2.0** with TypeScript 5.3.3
- **Material-UI (MUI) v5** for UI components with custom Poppins font theming
- **Recharts 2.10.3** for data visualization
- **Express.js server** for API backend
- **ccusage CLI integration** for real Claude usage data collection
- **Webpack 5** for bundling

### Project Structure
```
Claude-Usage-App-V2/
├── src/
│   ├── components/           # React components
│   │   ├── Dashboard.tsx     # Main analytics dashboard
│   │   ├── CostTracker.tsx   # Cost analysis and breakdown
│   │   ├── LiveCharts.tsx    # Real-time charts and visualizations
│   │   └── PlatformMetrics.tsx # Platform-specific usage metrics
│   ├── hooks/
│   │   └── useRealTimeData.ts # Data fetching and state management hook
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces and types
│   ├── App.tsx              # Main application component with routing
│   └── index.tsx            # React app entry point
├── server.js                # Express API server with ccusage integration
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── webpack.config.js       # Build configuration
```

## Component Architecture

### 1. App.tsx (Main Application)
- **Material-UI Theme**: Custom purple/indigo theme with Poppins font
- **Navigation**: Sidebar with 4 main sections (Dashboard, Analytics, Trends, Costs)
- **Layout**: Permanent drawer layout with responsive design
- **State Management**: React useState for tab selection

### 2. Dashboard.tsx (Main Analytics)
- **Real-time Metrics**: Today's, weekly, and monthly usage summaries
- **Key Metrics**: Sessions, tokens, costs with formatted displays
- **Manual Refresh**: Trigger button for ccusage data collection
- **Visual Cards**: Color-coded metric cards with Material-UI icons

### 3. CostTracker.tsx (Cost Analysis)
- **Cost Breakdown**: By model, sessions, token types
- **Visualizations**: Pie charts (model distribution), bar charts (daily costs)
- **Efficiency Analysis**: Cost per token, model comparison
- **Time Range Filtering**: 7/14/30 day options
- **Detailed Tables**: Comprehensive cost breakdowns with sorting

### 4. LiveCharts.tsx (Data Visualization)
- **Chart Types**: Line, area, and bar chart options
- **Time Series Data**: Configurable time ranges (today to 30 days)
- **Platform Breakdown**: VS Code vs Web usage visualization
- **Real-time Updates**: Today's summary card for live data
- **Multiple Views**: Usage trends, platform distribution, cost trends, token usage

### 5. PlatformMetrics.tsx (Platform Analysis)
- **Platform Comparison**: VS Code, Web, API usage statistics
- **Visual Progress**: Linear progress bars for usage distribution
- **Detailed Tables**: Platform-specific insights and breakdowns
- **Model Analysis**: Most used models per platform
- **Code Generation Stats**: VS Code specific metrics

## Data Management

### useRealTimeData Hook (src/hooks/useRealTimeData.ts)
- **API Integration**: Fetches data from Express server (`localhost:3002`)
- **Real-time Updates**: 5-second refresh interval by default
- **Data Processing**: Calculates metrics for dashboard, platform, and time series data
- **State Management**: Loading states, session data, dashboard metrics
- **Date Filtering**: Today, weekly, monthly data aggregation
- **Key Functions**:
  - `calculateDashboardMetrics()`: Aggregates usage data for dashboard
  - `getPlatformMetrics()`: Platform-specific statistics
  - `getTimeSeriesData()`: Time-based data for charts
  - `refreshData()`: Manual data refresh

## Backend Integration (server.js)

### AutomatedCCUsageService Class
- **ccusage CLI Integration**: Automatically runs ccusage commands every 2 minutes
- **Real Data Only**: No mock data generation - only processes actual ccusage output
- **Data Processing**: Maps ccusage JSON to application data structure
- **Installation Detection**: Checks for both global and npx ccusage installations

### API Endpoints
- `GET /api/ccusage` - Fetch usage data
- `GET /api/ccusage/status` - Service status and configuration
- `POST /api/ccusage/refresh` - Manual refresh trigger

### Key Methods
- `checkCCUsageInstallation()`: Detects ccusage CLI availability
- `runRealCCUsageCommands()`: Executes ccusage commands
- `processRealCCUsageData()`: Transforms ccusage output to app format
- `mapCCUsageModel()`: Maps ccusage model names to app model names

## TypeScript Types & Interfaces (src/types/index.ts)

### Core Data Structures
- **UsageSession**: Individual Claude usage session with tokens, cost, platform data
- **VSCodeData**: VS Code specific metrics (files modified, code generated, lines added/deleted)
- **WebData**: Web platform specific data (conversation length, artifacts, content type)
- **DashboardMetrics**: Aggregated metrics for dashboard display
- **PlatformMetrics**: Platform-specific usage statistics
- **TimeSeriesData**: Time-based data points for charts
- **CostBreakdown**: Model-specific cost analysis
- **Settings**: Configuration for cost calculations and monitoring

## Key Features

### Real-time Monitoring
- Automatic ccusage CLI integration every 2 minutes
- Live data updates with configurable refresh intervals
- Manual refresh capabilities via API
- Real-time dashboard updates

### Comprehensive Analytics
- Multi-time period analysis (today, weekly, monthly, all-time)
- Platform-specific breakdowns (VS Code, Web, API)
- Model-specific cost analysis (Claude 3 Opus, Sonnet, Haiku, etc.)
- Token usage tracking including cache creation and read tokens

### Rich Visualizations
- Interactive charts (line, area, bar, pie) using Recharts
- Cost efficiency analysis with progress bars
- Platform distribution charts
- Time series trends with multiple data points

### Professional UI/UX
- Material-UI design system with custom theme
- Custom purple/indigo color scheme (#6366F1, #8B5CF6, etc.)
- Responsive layout with drawer navigation
- Professional typography using Poppins font family
- Loading states and error handling
- Consistent card-based layout

## Build & Development

### Scripts (package.json)
- `npm start` - Development server with webpack-dev-server (port 3001)
- `npm run build` - Production build
- `npm run dev` - Development mode
- `npm run server` - Start Express API server (port 3002)
- `npm run auto` - Build and start server together

### Configuration
- **Webpack**: Standard React setup with TypeScript support
- **TypeScript**: ES2020 target with strict mode enabled
- **Development**: Hot reload enabled, serves on port 3001
- **Production**: Optimized bundle with content hashing

## Data Flow

1. **ccusage CLI** → Runs automatically every 2 minutes via server.js
2. **Express Server** → Processes ccusage output and serves via API
3. **React Hook** → Fetches data every 5 seconds from API
4. **Components** → Consume data via useRealTimeData hook
5. **UI Updates** → Real-time dashboard and chart updates

## Important Notes

- **Real Data Only**: Application only shows actual ccusage data, no mock/simulated data
- **ccusage Dependency**: Requires ccusage CLI to be installed for real data
- **Port Configuration**: Frontend (3001), Backend (3002)
- **CORS Enabled**: For localhost development across different ports
- **Cache Token Support**: Handles ccusage cache creation and read tokens
- **Model Mapping**: Maps ccusage model names to user-friendly display names

This application provides a comprehensive, professional-grade solution for monitoring and analyzing Claude AI usage with real-time data collection and rich visualizations.