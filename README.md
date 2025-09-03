# Claude Usage Tracker

A modern, real-time dashboard for monitoring your Claude AI usage across different platforms. Built with React, TypeScript, and Material-UI with a beautiful purple gradient theme and Poppins font family.

## Features

✨ **Real-time Analytics Dashboard**
- Today's usage metrics (sessions, tokens, cost)
- Weekly usage analytics 
- Monthly usage overview
- Live data updates every 2 minutes
- Project-wise filtering and analytics

📊 **Interactive Charts & Visualizations**
- Today's summary with real-time data
- Usage trends over time (1 day, 7 days, 14 days, 30 days)
- Platform distribution charts
- Cost analysis and breakdowns
- Project comparison charts and breakdowns

🎨 **Modern UI Design**
- Purple gradient theme
- Poppins font family throughout
- Responsive card-based layout
- Cost Analysis page design consistency
- Clean sidebar navigation

🔄 **Automated Data Collection**
- Integrates with `ccusage` CLI tool
- No manual data entry required
- Real-time API data (no localStorage caching)
- Supports millions/thousands token formatting
- Project-wise data collection and analysis
- System username detection (no hardcoded personal info)

📊 **Advanced Analytics**
- **Weekly Analytics**: Week-over-week growth tracking and trends
- **Monthly Analytics**: Long-term cost analysis and evolution
- **Session Analytics**: Individual conversation tracking (ready)
- **Billing Blocks**: 5-hour billing cycle analysis (ready)

📁 **Project Analytics**
- Track usage across different VS Code workspaces
- Project-specific token and cost breakdowns
- Project comparison and ranking
- Individual project performance metrics
- Filter dashboard by specific projects

## Prerequisites

Before running this application, ensure you have:

1. **Node.js** (v16 or higher)
2. **npm** (comes with Node.js)
3. **ccusage CLI tool** (for real Claude usage data)

### Installing ccusage CLI

```bash
npm install -g ccusage
```

## Getting Started

### 1. Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd Claude

# Or download and extract the project files
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Application

```bash
npm run build
```

### 4. Start the Application

```bash
# Start the server (this starts both backend and frontend)
node server.js
```

The application will be available at: **http://localhost:3002**

## Available Scripts

### Development Commands

```bash
# Install dependencies
npm install

# Build the application for production
npm run build

# Start the production server
node server.js

# Check TypeScript types (optional)
npx tsc --noEmit
```

### Server Commands

```bash
# Start the full application (recommended)
node server.js

# The server will:
# - Serve the built React app
# - Run automated ccusage data collection
# - Provide API endpoints for real-time data
# - Update usage metrics every 2 minutes automatically
```

## Application Structure

```
Claude/
├── public/
│   ├── index.html          # Main HTML template with Poppins font
│   └── favicon.ico         # App icon
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx   # Main dashboard with 3 sections
│   │   ├── LiveCharts.tsx  # Analytics charts with Today option
│   │   ├── PlatformMetrics.tsx # Platform comparison
│   │   └── CostTracker.tsx # Cost analysis page
│   ├── hooks/
│   │   └── useRealTimeData.ts # Real-time data fetching
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   ├── App.tsx             # Main app with sidebar navigation
│   └── index.tsx           # App entry point
├── server.js               # Express server with ccusage integration
├── package.json            # Project dependencies and scripts
└── README.md              # This file
```

## Dashboard Sections

### 📅 Today's Analytics
- **Sessions**: Number of Claude interactions today
- **Tokens**: Total tokens processed today (formatted in M/K)
- **Cost**: Amount spent on Claude usage today

### 📊 Weekly Analytics  
- **Sessions**: Claude sessions in the last 7 days
- **Tokens**: Total tokens processed in the last 7 days
- **Cost**: Total cost for the last 7 days

### 📈 Monthly Analytics
- **Sessions**: Claude sessions in the last 30 days
- **Tokens**: Total tokens processed in the last 30 days  
- **Cost**: Total cost for the last 30 days
- **Total Sessions**: All-time session count
- **Total Tokens**: All-time token count
- **Primary Platform**: Most used platform (VS Code/Web)

## Navigation

The application features a modern sidebar with:

- **Main Dashboard**: Overview with today's, weekly, and monthly analytics (with project filtering)
- **Analytics**: Platform comparison and detailed metrics  
- **Projects**: Project-wise usage breakdown, comparison, and analytics
- **Weekly**: Weekly trends and growth analysis
- **Monthly**: Monthly cost evolution and patterns
- **Trends**: Interactive charts with "Today" option for real-time data
- **Costs**: Detailed cost analysis and breakdowns
- **About**: Comprehensive documentation of all metrics, cost calculations, and optimization strategies

## API Endpoints

The server provides several API endpoints:

```bash
# Get current usage data
GET http://localhost:3002/api/ccusage

# Get project-wise usage data
GET http://localhost:3002/api/ccusage/projects

# Get service status  
GET http://localhost:3002/api/ccusage/status

# Manually trigger data refresh
POST http://localhost:3002/api/ccusage/refresh
```

## Data Source

This application uses the **ccusage CLI tool** to collect real Claude usage data from:
- VS Code Claude extension usage
- Web-based Claude interactions
- API usage (if applicable)

The data includes:
- Input/Output tokens
- Cache creation/read tokens (the majority of usage)
- Session information
- Cost calculations
- Platform identification

## Troubleshooting

### No Data Showing

1. **Check ccusage installation**:
   ```bash
   ccusage --version
   ```

2. **Verify you have Claude usage data**:
   ```bash
   ccusage daily --json
   ```

3. **Check server logs** when running `node server.js`

4. **Manual data refresh**: Click the refresh button in the dashboard alert

### Build Errors

1. **Clean node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check TypeScript errors**:
   ```bash
   npx tsc --noEmit
   ```

### Port Issues

If port 3002 is in use, you can modify the port in `server.js`:
```javascript
const PORT = 3002; // Change this to another port
```

## Development Notes

- **Font**: Uses Poppins font family throughout the application
- **Theme**: Purple gradient theme (#6366F1, #8B5CF6)
- **Data Flow**: Real-time API → Server → Dashboard (no localStorage)
- **Updates**: Automatic data refresh every 2 minutes
- **Format**: Large numbers display as 1.2M, 500K, etc.

## Production Deployment

For production deployment:

1. Build the application: `npm run build`
2. Copy all files to your server
3. Install production dependencies: `npm install --production`
4. Start with: `node server.js`
5. Set up a process manager like PM2 for auto-restart

## Support

If you encounter any issues:

1. Check that ccusage is properly installed and has data
2. Verify Node.js version is 16 or higher
3. Check server console logs for errors
4. Ensure port 3002 is available

---

**Built with ❤️ using React, TypeScript, Material-UI, and the ccusage CLI tool**