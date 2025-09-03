import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Code as CodeIcon,
  Web as WebIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Today as TodayIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { useData } from "../context/DataContext";

export const Dashboard: React.FC = () => {
  const { state, actions } = useData();
  
  // Get filtered sessions based on selected project
  const filteredSessions = actions.getFilteredSessions();
  
  // Calculate dashboard metrics for filtered sessions
  const calculateFilteredMetrics = () => {
    if (filteredSessions.length === 0) {
      return {
        totalSessions: 0,
        totalTokens: 0,
        totalCost: 0,
        averageSessionDuration: 0,
        mostUsedPlatform: 'web' as const,
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

    const todaySessions = filteredSessions.filter(s => new Date(s.timestamp) >= today);
    const weeklySessions = filteredSessions.filter(s => new Date(s.timestamp) >= weekAgo);
    const monthlySessions = filteredSessions.filter(s => new Date(s.timestamp) >= monthAgo);

    const platformCounts = filteredSessions.reduce((acc, session) => {
      acc[session.platform] = (acc[session.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedPlatform = Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as 'vscode' | 'web' | 'api' || 'web';

    return {
      totalSessions: filteredSessions.length,
      totalTokens: filteredSessions.reduce((sum, s) => sum + s.totalTokens, 0),
      totalCost: filteredSessions.reduce((sum, s) => sum + s.cost, 0),
      averageSessionDuration: filteredSessions.reduce((sum, s) => sum + s.sessionDuration, 0) / filteredSessions.length,
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
  };

  // Get the appropriate metrics (filtered if project is selected)
  const metrics = state.selectedProject === 'all' && state.dashboardMetrics 
    ? state.dashboardMetrics 
    : calculateFilteredMetrics();
  
  // Get project metrics from project data
  const projectMetrics = Object.entries(state.projectData).map(([name, data]) => ({
    name,
    path: name, // Use name as path since ccusage doesn't provide file paths
    sessions: data.totalSessions,
    totalTokens: data.totalTokens,
    totalCost: data.totalCost,
    percentageOfTotal: state.sessions.length > 0 ? (data.totalSessions / state.sessions.length) * 100 : 0,
    averageSessionDuration: data.totalSessions > 0 ? data.totalTokens / data.totalSessions / 1000 : 0,
    lastActivityDate: data.lastActive
  }));

  const handleProjectChange = (event: SelectChangeEvent<string>) => {
    actions.setSelectedProject(event.target.value);
  };

  const handleTriggerRefresh = async () => {
    console.log("🔄 Manually triggering ccusage collection...");
    try {
      // Trigger fresh collection from ccusage CLI
      const response = await fetch(
        "http://localhost:3002/api/ccusage/refresh",
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(
          `✅ Triggered refresh, ${result.dataCount} records updated`
        );

        // Refresh the dashboard data
        setTimeout(() => {
          actions.refreshData();
        }, 1000);
      }
    } catch (error) {
      console.error("Error triggering refresh:", error);
    }
  };

  if (state.isLoading) {
    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1, textAlign: "center" }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (!state.dashboardMetrics) {
    return (
      <Typography variant="h6" sx={{ textAlign: "center", mt: 4 }}>
        No usage data available
      </Typography>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatNumber = (num: number) => num.toLocaleString();
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    } else {
      return tokens.toLocaleString();
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Dashboard Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Overview
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              Main Dashboard
            </Typography>
          </Box>
          
          {projectMetrics.length > 0 && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Project Filter</InputLabel>
              <Select
                value={state.selectedProject}
                label="Project Filter"
                onChange={handleProjectChange}
              >
                <MenuItem value="all">All Projects</MenuItem>
                {projectMetrics.map((project) => (
                  <MenuItem key={project.name} value={project.name}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>

      {/* Show loading state */}
      {metrics?.totalSessions === 0 && (
        <Alert
          severity="info"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <IconButton
              color="primary"
              size="small"
              onClick={handleTriggerRefresh}
            >
              <RefreshIcon />
            </IconButton>
          }
        >
          <strong>Loading usage data...</strong>
          <br />
          Fetching real-time analytics from Claude AI usage monitoring.
        </Alert>
      )}

      {/* Today's Analytics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontFamily: "Poppins",
            mb: 3,
            color: "text.primary",
          }}
        >
          📅 Today's Analytics
        </Typography>
        <Grid container spacing={3}>
          {/* Today's Sessions */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="textSecondary">
                    Sessions
                  </Typography>
                  <TodayIcon color="primary" />
                </Box>
                <Typography
                  variant="h4"
                  color="primary.main"
                  sx={{ fontFamily: "Poppins", fontWeight: 700 }}
                >
                  {formatNumber(metrics.todayUsage.sessions)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Active today
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Tokens */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="textSecondary">
                    Tokens
                  </Typography>
                  <CodeIcon color="secondary" />
                </Box>
                <Typography
                  variant="h4"
                  color="secondary.main"
                  sx={{ fontFamily: "Poppins", fontWeight: 700 }}
                >
                  {formatTokens(metrics.todayUsage.tokens)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Processed today
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Cost */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="textSecondary">
                    Cost
                  </Typography>
                  <MoneyIcon color="warning" />
                </Box>
                <Typography
                  variant="h4"
                  color="warning.main"
                  sx={{ fontFamily: "Poppins", fontWeight: 700 }}
                >
                  {formatCurrency(metrics.todayUsage.cost)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Spent today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Weekly Analytics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontFamily: "Poppins",
            mb: 3,
            color: "text.primary",
          }}
        >
          📊 Weekly Analytics
        </Typography>
        <Grid container spacing={3}>
          {/* Weekly Sessions */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="textSecondary">
                    Sessions
                  </Typography>
                  <TimelineIcon color="primary" />
                </Box>
                <Typography
                  variant="h4"
                  color="primary.main"
                  sx={{ fontFamily: "Poppins", fontWeight: 700 }}
                >
                  {formatNumber(metrics.weeklyUsage.sessions)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last 7 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Tokens */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="textSecondary">
                    Tokens
                  </Typography>
                  <AssessmentIcon color="secondary" />
                </Box>
                <Typography
                  variant="h4"
                  color="secondary.main"
                  sx={{ fontFamily: "Poppins", fontWeight: 700 }}
                >
                  {formatTokens(metrics.weeklyUsage.tokens)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last 7 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Cost */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="textSecondary">
                    Cost
                  </Typography>
                  <MoneyIcon color="warning" />
                </Box>
                <Typography
                  variant="h4"
                  color="warning.main"
                  sx={{ fontFamily: "Poppins", fontWeight: 700 }}
                >
                  {formatCurrency(metrics.weeklyUsage.cost)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last 7 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Monthly Analytics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontFamily: "Poppins",
            mb: 3,
            color: "text.primary",
          }}
        >
          📈 Monthly Analytics
        </Typography>
        <Grid container spacing={3}>
          {/* Monthly Sessions */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="textSecondary">
                    Sessions
                  </Typography>
                  <TrendingUpIcon color="primary" />
                </Box>
                <Typography
                  variant="h4"
                  color="primary.main"
                  sx={{ fontFamily: "Poppins", fontWeight: 700 }}
                >
                  {formatNumber(metrics.monthlyUsage.sessions)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Tokens */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="textSecondary">
                    Tokens
                  </Typography>
                  <AssessmentIcon color="secondary" />
                </Box>
                <Typography
                  variant="h4"
                  color="secondary.main"
                  sx={{ fontFamily: "Poppins", fontWeight: 700 }}
                >
                  {formatTokens(metrics.monthlyUsage.tokens)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Cost */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="textSecondary">
                    Cost
                  </Typography>
                  <MoneyIcon color="error" />
                </Box>
                <Typography
                  variant="h4"
                  color="error.main"
                  sx={{ fontFamily: "Poppins", fontWeight: 700 }}
                >
                  {formatCurrency(metrics.monthlyUsage.cost)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Sessions Summary */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="textSecondary">
                    Total Sessions
                  </Typography>
                  <TrendingUpIcon color="info" />
                </Box>
                <Typography
                  variant="h4"
                  color="info.main"
                  sx={{ fontFamily: "Poppins", fontWeight: 700 }}
                >
                  {formatNumber(metrics.totalSessions)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  All time
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Tokens Summary */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="textSecondary">
                    Total Tokens
                  </Typography>
                  <AssessmentIcon color="success" />
                </Box>
                <Typography
                  variant="h4"
                  color="success.main"
                  sx={{ fontFamily: "Poppins", fontWeight: 700 }}
                >
                  {formatTokens(metrics.totalTokens)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  All time processed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Platform Usage */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Primary Platform
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {metrics.mostUsedPlatform === "vscode" ? (
                    <CodeIcon color="primary" />
                  ) : (
                    <WebIcon sx={{ color: "secondary.main" }} />
                  )}
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 600,
                      color:
                        metrics.mostUsedPlatform === "vscode"
                          ? "primary.main"
                          : "secondary.main",
                    }}
                  >
                    {metrics.mostUsedPlatform === "vscode"
                      ? "VS Code"
                      : "Web"}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Most used platform
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
