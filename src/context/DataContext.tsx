import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  UsageSession, 
  WeeklyData, 
  MonthlyData, 
  SessionData, 
  BillingBlock, 
  ProjectData,
  DashboardMetrics,
  PlatformMetrics
} from '../types';

interface DataState {
  // Raw data
  sessions: UsageSession[];
  weeklyData: WeeklyData[];
  monthlyData: MonthlyData[];
  sessionData: SessionData[];
  billingBlocks: BillingBlock[];
  projectData: Record<string, ProjectData>;
  
  // Processed data
  dashboardMetrics: DashboardMetrics | null;
  platformMetrics: PlatformMetrics[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  selectedProject: string;
  systemUser: string;
}

type DataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SESSIONS'; payload: UsageSession[] }
  | { type: 'SET_WEEKLY_DATA'; payload: WeeklyData[] }
  | { type: 'SET_MONTHLY_DATA'; payload: MonthlyData[] }
  | { type: 'SET_SESSION_DATA'; payload: SessionData[] }
  | { type: 'SET_BILLING_BLOCKS'; payload: BillingBlock[] }
  | { type: 'SET_PROJECT_DATA'; payload: Record<string, ProjectData> }
  | { type: 'SET_DASHBOARD_METRICS'; payload: DashboardMetrics }
  | { type: 'SET_PLATFORM_METRICS'; payload: PlatformMetrics[] }
  | { type: 'SET_SELECTED_PROJECT'; payload: string }
  | { type: 'SET_SYSTEM_USER'; payload: string }
  | { type: 'SET_LAST_UPDATE' };

const initialState: DataState = {
  sessions: [],
  weeklyData: [],
  monthlyData: [],
  sessionData: [],
  billingBlocks: [],
  projectData: {},
  dashboardMetrics: null,
  platformMetrics: [],
  isLoading: true,
  error: null,
  lastUpdate: null,
  selectedProject: 'all',
  systemUser: 'System User'
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    case 'SET_WEEKLY_DATA':
      return { ...state, weeklyData: action.payload };
    case 'SET_MONTHLY_DATA':
      return { ...state, monthlyData: action.payload };
    case 'SET_SESSION_DATA':
      return { ...state, sessionData: action.payload };
    case 'SET_BILLING_BLOCKS':
      return { ...state, billingBlocks: action.payload };
    case 'SET_PROJECT_DATA':
      return { ...state, projectData: action.payload };
    case 'SET_DASHBOARD_METRICS':
      return { ...state, dashboardMetrics: action.payload };
    case 'SET_PLATFORM_METRICS':
      return { ...state, platformMetrics: action.payload };
    case 'SET_SELECTED_PROJECT':
      return { ...state, selectedProject: action.payload };
    case 'SET_SYSTEM_USER':
      return { ...state, systemUser: action.payload };
    case 'SET_LAST_UPDATE':
      return { ...state, lastUpdate: new Date() };
    default:
      return state;
  }
}

interface DataContextType {
  state: DataState;
  actions: {
    setSelectedProject: (project: string) => void;
    refreshData: () => Promise<void>;
    getFilteredSessions: () => UsageSession[];
    getTodayData: () => any[];
    getTimeSeriesData: (days: number) => any[];
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const API_BASE = 'http://localhost:3002/api/ccusage';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Fetch data from API
  const fetchData = useCallback(async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
    return null;
  }, []);

  // Calculate dashboard metrics from sessions
  const calculateDashboardMetrics = useCallback((sessions: UsageSession[]): DashboardMetrics => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTokens: 0,
        totalCost: 0,
        averageSessionDuration: 0,
        mostUsedPlatform: 'web',
        todayUsage: { sessions: 0, tokens: 0, cost: 0 },
        weeklyUsage: { sessions: 0, tokens: 0, cost: 0 },
        monthlyUsage: { sessions: 0, tokens: 0, cost: 0 }
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const todaySessions = sessions.filter(s => new Date(s.timestamp) >= today);
    const weeklySessions = sessions.filter(s => new Date(s.timestamp) >= weekAgo);
    const monthlySessions = sessions.filter(s => new Date(s.timestamp) >= monthAgo);

    const platformCounts = sessions.reduce((acc, session) => {
      acc[session.platform] = (acc[session.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedPlatform = Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as 'vscode' | 'web' | 'api' || 'web';

    return {
      totalSessions: sessions.length,
      totalTokens: sessions.reduce((sum, s) => sum + s.totalTokens, 0),
      totalCost: sessions.reduce((sum, s) => sum + s.cost, 0),
      averageSessionDuration: sessions.reduce((sum, s) => sum + s.sessionDuration, 0) / sessions.length,
      mostUsedPlatform,
      todayUsage: {
        sessions: todaySessions.length,
        tokens: todaySessions.reduce((sum, s) => sum + s.totalTokens, 0),
        cost: todaySessions.reduce((sum, s) => sum + s.cost, 0)
      },
      weeklyUsage: {
        sessions: weeklySessions.length,
        tokens: weeklySessions.reduce((sum, s) => sum + s.totalTokens, 0),
        cost: weeklySessions.reduce((sum, s) => sum + s.cost, 0)
      },
      monthlyUsage: {
        sessions: monthlySessions.length,
        tokens: monthlySessions.reduce((sum, s) => sum + s.totalTokens, 0),
        cost: monthlySessions.reduce((sum, s) => sum + s.cost, 0)
      }
    };
  }, []);

  // Calculate platform metrics
  const calculatePlatformMetrics = useCallback((sessions: UsageSession[]): PlatformMetrics[] => {
    const platformGroups = sessions.reduce((acc, session) => {
      if (!acc[session.platform]) {
        acc[session.platform] = [];
      }
      acc[session.platform].push(session);
      return acc;
    }, {} as Record<string, UsageSession[]>);

    const totalSessions = sessions.length;

    return Object.entries(platformGroups).map(([platform, platformSessions]) => ({
      platform: platform as 'vscode' | 'web' | 'api',
      sessions: platformSessions.length,
      totalTokens: platformSessions.reduce((sum, s) => sum + s.totalTokens, 0),
      totalCost: platformSessions.reduce((sum, s) => sum + s.cost, 0),
      averageSessionDuration: platformSessions.reduce((sum, s) => sum + s.sessionDuration, 0) / platformSessions.length,
      percentageOfTotal: totalSessions > 0 ? (platformSessions.length / totalSessions) * 100 : 0
    }));
  }, []);

  // Main data refresh function
  const refreshData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Fetch all data in parallel
      const [
        sessions,
        weeklyData,
        monthlyData,
        sessionData,
        billingBlocks,
        projectData
      ] = await Promise.all([
        fetchData(''),
        fetchData('/weekly'),
        fetchData('/monthly'),
        fetchData('/sessions'),
        fetchData('/blocks'),
        fetchData('/projects')
      ]);

      // Update state with fetched data
      if (sessions) {
        dispatch({ type: 'SET_SESSIONS', payload: sessions });
        
        // Get system user from first session
        if (sessions.length > 0 && sessions[0].userId) {
          console.log('Setting system user from session data:', sessions[0].userId);
          dispatch({ type: 'SET_SYSTEM_USER', payload: sessions[0].userId });
        } else {
          console.log('No userId found in sessions, sessions length:', sessions.length);
        }

        // Calculate derived metrics
        const dashboardMetrics = calculateDashboardMetrics(sessions);
        const platformMetrics = calculatePlatformMetrics(sessions);
        
        dispatch({ type: 'SET_DASHBOARD_METRICS', payload: dashboardMetrics });
        dispatch({ type: 'SET_PLATFORM_METRICS', payload: platformMetrics });
      }

      if (weeklyData) dispatch({ type: 'SET_WEEKLY_DATA', payload: weeklyData });
      if (monthlyData) dispatch({ type: 'SET_MONTHLY_DATA', payload: monthlyData });
      if (sessionData) dispatch({ type: 'SET_SESSION_DATA', payload: sessionData });
      if (billingBlocks) dispatch({ type: 'SET_BILLING_BLOCKS', payload: billingBlocks });
      if (projectData) dispatch({ type: 'SET_PROJECT_DATA', payload: projectData });

      dispatch({ type: 'SET_LAST_UPDATE' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch data' });
      console.error('Data fetch error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [fetchData, calculateDashboardMetrics, calculatePlatformMetrics]);

  // Set up automatic refresh
  useEffect(() => {
    refreshData();
    
    // Refresh every 2 minutes
    const interval = setInterval(refreshData, 120000);
    
    return () => clearInterval(interval);
  }, [refreshData]);

  // Helper functions
  const getFilteredSessions = useCallback((): UsageSession[] => {
    if (state.selectedProject === 'all') return state.sessions;
    return state.sessions.filter(s => s.vscodeData?.projectName === state.selectedProject);
  }, [state.sessions, state.selectedProject]);

  const getTodayData = useCallback(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todaySessions = state.sessions.filter(s => 
      s.timestamp.startsWith(todayStr)
    );

    if (todaySessions.length === 0) return [];

    const vscodeTokens = todaySessions
      .filter(s => s.platform === 'vscode')
      .reduce((sum, s) => sum + s.totalTokens, 0);
    
    const webTokens = todaySessions
      .filter(s => s.platform === 'web')
      .reduce((sum, s) => sum + s.totalTokens, 0);

    return [{
      date: todayStr,
      sessions: todaySessions.length,
      tokens: todaySessions.reduce((sum, s) => sum + s.totalTokens, 0),
      cost: todaySessions.reduce((sum, s) => sum + s.cost, 0),
      vscodeTokens,
      webTokens
    }];
  }, [state.sessions]);

  const getTimeSeriesData = useCallback((days: number = 7) => {
    if (days === 1) return getTodayData();

    const now = new Date();
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const daySessions = state.sessions.filter(s => 
        s.timestamp.startsWith(dateStr)
      );

      const vscodeTokens = daySessions
        .filter(s => s.platform === 'vscode')
        .reduce((sum, s) => sum + s.totalTokens, 0);
      
      const webTokens = daySessions
        .filter(s => s.platform === 'web')
        .reduce((sum, s) => sum + s.totalTokens, 0);

      data.push({
        date: dateStr,
        sessions: daySessions.length,
        tokens: daySessions.reduce((sum, s) => sum + s.totalTokens, 0),
        cost: daySessions.reduce((sum, s) => sum + s.cost, 0),
        vscodeTokens,
        webTokens
      });
    }

    return data;
  }, [state.sessions, getTodayData]);

  const setSelectedProject = useCallback((project: string) => {
    dispatch({ type: 'SET_SELECTED_PROJECT', payload: project });
    
    // Recalculate metrics for filtered data
    const filteredSessions = project === 'all' 
      ? state.sessions 
      : state.sessions.filter(s => s.vscodeData?.projectName === project);
    
    const dashboardMetrics = calculateDashboardMetrics(filteredSessions);
    const platformMetrics = calculatePlatformMetrics(filteredSessions);
    
    dispatch({ type: 'SET_DASHBOARD_METRICS', payload: dashboardMetrics });
    dispatch({ type: 'SET_PLATFORM_METRICS', payload: platformMetrics });
  }, [state.sessions, calculateDashboardMetrics, calculatePlatformMetrics]);

  const contextValue: DataContextType = {
    state,
    actions: {
      setSelectedProject,
      refreshData,
      getFilteredSessions,
      getTodayData,
      getTimeSeriesData
    }
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};