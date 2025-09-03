import React from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  AttachMoney as MoneyIcon,
  Folder as FolderIcon,
  CalendarViewWeek as CalendarWeekIcon,
  CalendarToday as CalendarMonthIcon,
  Info as InfoIcon
} from '@mui/icons-material';

import { Dashboard } from './components/Dashboard';
import { PlatformMetrics } from './components/PlatformMetrics';
import { LiveCharts } from './components/LiveCharts';
import { CostTracker } from './components/CostTracker';
import { ProjectAnalytics } from './components/ProjectAnalytics';
import { WeeklyAnalytics } from './components/WeeklyAnalytics';
import { MonthlyAnalytics } from './components/MonthlyAnalytics';
import { About } from './components/About';
import { DataProvider, useData } from './context/DataContext';


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1',
      light: '#8B5CF6',
      dark: '#4F46E5',
    },
    secondary: {
      main: '#EC4899',
      light: '#F472B6',
      dark: '#DB2777',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    allVariants: {
      fontFamily: '"Poppins", sans-serif',
    },
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      fontFamily: '"Poppins", sans-serif',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      fontFamily: '"Poppins", sans-serif',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      fontFamily: '"Poppins", sans-serif',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.875rem',
      fontFamily: '"Poppins", sans-serif',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      fontFamily: '"Poppins", sans-serif',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      fontFamily: '"Poppins", sans-serif',
    },
    body1: {
      fontSize: '0.875rem',
      fontFamily: '"Poppins", sans-serif',
    },
    body2: {
      fontSize: '0.75rem',
      fontFamily: '"Poppins", sans-serif',
    },
    caption: {
      fontFamily: '"Poppins", sans-serif',
    },
    button: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: '"Poppins", sans-serif !important',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Poppins", sans-serif !important',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: '"Poppins", sans-serif !important',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: '"Poppins", sans-serif !important',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Poppins", sans-serif !important',
        },
      },
    },
  },
});


const drawerWidth = 240;

const AppContent: React.FC = () => {
  const { state } = useData();
  const [selectedTab, setSelectedTab] = React.useState(0);
  
  // State for Claude credentials
  const [credentialInfo, setCredentialInfo] = React.useState({
    email: 'Loading...',
    subscription: 'unknown',
    licenseType: 'Claude Free'
  });

  // Function to fetch Claude credentials from API
  const fetchClaudeCredentials = async () => {
    try {
      const response = await fetch('/api/claude/credentials');
      const credentials = await response.json();
      
      setCredentialInfo({
        email: credentials.email || state.systemUser || 'Unknown User',
        subscription: credentials.subscription || 'unknown',
        licenseType: credentials.licenseType || 'Claude Free'
      });
    } catch (error) {
      console.warn('Could not fetch Claude credentials:', error);
      // Fallback to existing logic
      setCredentialInfo({
        email: state.systemUser || 'Unknown User',
        subscription: 'unknown',
        licenseType: getLicenseTypeFromUsage()
      });
    }
  };

  // Effect to fetch credentials on component mount
  React.useEffect(() => {
    fetchClaudeCredentials();
  }, [state.systemUser]);

  // Function to determine license type from usage data (fallback)
  const getLicenseTypeFromUsage = () => {
    if (state.sessions.length === 0) return 'Claude Free';
    
    // Check for Claude 3 models to determine if Pro
    const hasClaudeProModels = state.sessions.some(session => 
      session.model?.includes('claude-3') || 
      session.model?.includes('sonnet') || 
      session.model?.includes('opus') ||
      session.model?.includes('haiku')
    );
    
    // Check for team/enterprise features (high token usage could indicate Team)
    const totalTokensToday = state.sessions
      .filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + s.totalTokens, 0);
    
    if (hasClaudeProModels) {
      // If very high usage, might be Team tier
      if (totalTokensToday > 500000) return 'Claude Team';
      return 'Claude Pro';
    }
    
    return 'Claude Free';
  };
  
  const generateInitials = (username: string) => {
    // Handle different username formats
    if (username.includes('@')) {
      // Email format - use first letter of name before @
      const beforeAt = username.split('@')[0];
      return beforeAt.split('.')[0].charAt(0).toUpperCase() + 
             (beforeAt.split('.')[1]?.charAt(0).toUpperCase() || '');
    } else {
      // Username format - split on common separators  
      return username
        .split(/[\s._-]+/)
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
  };
  
  const userInitials = generateInitials(credentialInfo.email);
  
  // Debug log to see what's happening with the credentials
  console.log('Current systemUser:', state.systemUser);
  console.log('Credential info:', credentialInfo);
  console.log('Generated initials:', userInitials);

  const sidebarItems = [
    { label: 'Main Dashboard', icon: <DashboardIcon />, active: true },
    { label: 'Analytics', icon: <BarChartIcon />, active: false },
    { label: 'Projects', icon: <FolderIcon />, active: false },
    { label: 'Weekly', icon: <CalendarWeekIcon />, active: false },
    { label: 'Monthly', icon: <CalendarMonthIcon />, active: false },
    { label: 'Trends', icon: <TimelineIcon />, active: false },
    { label: 'Costs', icon: <MoneyIcon />, active: false },
    { label: 'About', icon: <InfoIcon />, active: false },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid #E2E8F0',
              bgcolor: 'white',
              px: 2,
              py: 3,
            },
          }}
        >
          {/* Claude Branding */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: '#1F2937', 
                fontSize: '1.125rem',
                letterSpacing: '-0.025em'
              }}
            >
              Claude
            </Typography>
            <Chip 
              label="MAX Plan" 
              size="small" 
              sx={{ 
                bgcolor: '#10B981',
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                width: '90px',
                height: 'fit-content',
                borderRadius: '6px',
                py: '5px',
                px: 0,
                '& .MuiChip-label': {
                  px: 0,
                  py: '5px',
                  fontSize: '14px'
                }
              }} 
            />
          </Box>

          {/* Navigation */}
          <List sx={{ px: 0 }}>
            {sidebarItems.map((item, index) => (
              <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={index === selectedTab}
                  onClick={() => setSelectedTab(index)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(99, 102, 241, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: index === selectedTab ? 'white' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{
                      fontWeight: index === selectedTab ? 600 : 500,
                      fontSize: '0.875rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Top Header */}
          <AppBar 
            position="static" 
            elevation={0}
            sx={{ 
              bgcolor: 'white', 
              borderBottom: '1px solid #E5E7EB',
              color: 'text.primary'
            }}
          >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px', px: 3 }}>
              {/* Left Side - Logo and Breadcrumb */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img 
                  src="/vectorsolutions-logo-header.svg" 
                  alt="Vector Solutions"
                  style={{ 
                    height: '45px',
                    width: 'auto'
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6B7280',
                    fontSize: '0.875rem',
                    fontWeight: 400
                  }}
                >
                  Pages / {sidebarItems[selectedTab]?.label || 'Main Dashboard'}
                </Typography>
              </Box>

              {/* Right Side */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Profile */}
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {userInitials}
                </Avatar>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Content Area */}
          <Box sx={{ flexGrow: 1, p: 3 }}>
            {selectedTab === 0 && <Dashboard />}
            {selectedTab === 1 && <PlatformMetrics />}
            {selectedTab === 2 && <ProjectAnalytics />}
            {selectedTab === 3 && <WeeklyAnalytics />}
            {selectedTab === 4 && <MonthlyAnalytics />}
            {selectedTab === 5 && <LiveCharts />}
            {selectedTab === 6 && <CostTracker />}
            {selectedTab === 7 && <About />}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;