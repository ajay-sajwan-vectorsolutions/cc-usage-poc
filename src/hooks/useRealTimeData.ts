import { useState, useEffect, useCallback } from 'react';
import { UsageSession, DashboardMetrics, PlatformMetrics, TimeSeriesData, ProjectData, ProjectMetrics } from '../types';

const API_ENDPOINT = 'http://localhost:3002/api/ccusage';
const PROJECTS_API_ENDPOINT = 'http://localhost:3002/api/ccusage/projects';

export const useRealTimeData = (refreshInterval: number = 5000) => {
  const [sessions, setSessions] = useState<UsageSession[]>([]);
  const [projectData, setProjectData] = useState<Record<string, ProjectData>>({});
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

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

  const fetchFromAPI = useCallback(async (): Promise<UsageSession[]> => {
    try {
      console.log('🔄 Fetching data directly from API:', API_ENDPOINT);
      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Received ${data.length} sessions from API`, data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch from API:', response.status, errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching from API:', error);
      return [];
    }
  }, []);

  const fetchProjectData = useCallback(async (): Promise<Record<string, ProjectData>> => {
    try {
      console.log('🔄 Fetching project data from API:', PROJECTS_API_ENDPOINT);
      const response = await fetch(PROJECTS_API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Received project data for ${Object.keys(data).length} projects`, data);
        return data;
      } else {
        console.error('❌ Failed to fetch project data:', response.status);
        return {};
      }
    } catch (error) {
      console.error('❌ Error fetching project data:', error);
      return {};
    }
  }, []);

  const refreshData = useCallback(async () => {
    console.log('🔄 refreshData called');
    setIsLoading(true);
    try {
      // Fetch both session data and project data in parallel
      const [apiSessions, projectsData] = await Promise.all([
        fetchFromAPI(),
        fetchProjectData()
      ]);
      
      console.log('📊 API Sessions received:', apiSessions.length, apiSessions);
      console.log('📁 Project data received:', Object.keys(projectsData).length, projectsData);
      
      setSessions(apiSessions);
      setProjectData(projectsData);
      
      const filteredSessions = selectedProject === 'all' 
        ? apiSessions 
        : apiSessions.filter(s => s.vscodeData?.projectName === selectedProject);
      
      const metrics = calculateDashboardMetrics(filteredSessions);
      console.log('📈 Calculated metrics:', metrics);
      
      setDashboardMetrics(metrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFromAPI, fetchProjectData, calculateDashboardMetrics, selectedProject]);

  useEffect(() => {
    // Initial fetch
    refreshData();

    // Set up periodic refresh from API
    const interval = setInterval(refreshData, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [refreshData, refreshInterval]);

  const getPlatformMetrics = useCallback((): PlatformMetrics[] => {
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
  }, [sessions]);

  const getTimeSeriesData = useCallback((days: number = 7): TimeSeriesData[] => {
    const now = new Date();
    const data: TimeSeriesData[] = [];

    // Special case for today only (1 day)
    if (days === 1) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const todaySessions = sessions.filter(s => 
        s.timestamp.startsWith(todayStr)
      );

      const vscodeTokens = todaySessions
        .filter(s => s.platform === 'vscode')
        .reduce((sum, s) => sum + s.totalTokens, 0);
      
      const webTokens = todaySessions
        .filter(s => s.platform === 'web')
        .reduce((sum, s) => sum + s.totalTokens, 0);

      data.push({
        date: todayStr,
        sessions: todaySessions.length,
        tokens: todaySessions.reduce((sum, s) => sum + s.totalTokens, 0),
        cost: todaySessions.reduce((sum, s) => sum + s.cost, 0),
        vscodeTokens,
        webTokens
      });

      return data;
    }

    // Regular multi-day data
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const daySessions = sessions.filter(s => 
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
  }, [sessions]);

  const getSessionsByDateRange = useCallback((startDate: Date, endDate: Date): UsageSession[] => {
    // Filter sessions by date range - using current sessions from API
    return sessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }, [sessions]);

  const getProjectMetrics = useCallback((): ProjectMetrics[] => {
    if (Object.keys(projectData).length === 0) return [];
    
    const totalSessions = Object.values(projectData).reduce((sum, project) => sum + project.sessionCount, 0);
    
    return Object.entries(projectData).map(([name, data]) => {
      const projectSessions = sessions.filter(s => s.vscodeData?.projectName === name);
      const lastActivity = projectSessions.length > 0 
        ? Math.max(...projectSessions.map(s => new Date(s.timestamp).getTime()))
        : 0;
      
      return {
        name,
        path: data.path,
        sessions: data.sessionCount,
        totalTokens: data.totalTokens,
        totalCost: data.totalCost,
        averageSessionDuration: projectSessions.reduce((sum, s) => sum + s.sessionDuration, 0) / Math.max(projectSessions.length, 1),
        percentageOfTotal: totalSessions > 0 ? (data.sessionCount / totalSessions) * 100 : 0,
        lastActivityDate: lastActivity > 0 ? new Date(lastActivity).toISOString() : new Date().toISOString()
      };
    }).sort((a, b) => b.totalTokens - a.totalTokens);
  }, [projectData, sessions]);

  const getFilteredSessions = useCallback((): UsageSession[] => {
    if (selectedProject === 'all') return sessions;
    return sessions.filter(s => s.vscodeData?.projectName === selectedProject);
  }, [sessions, selectedProject]);

  return {
    sessions: getFilteredSessions(),
    allSessions: sessions,
    projectData,
    selectedProject,
    setSelectedProject,
    dashboardMetrics,
    isLoading,
    lastUpdate,
    refreshData,
    getPlatformMetrics,
    getProjectMetrics,
    getTimeSeriesData,
    getTodayData: () => getTimeSeriesData(1),
    getSessionsByDateRange
  };
};