import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import {
  CalendarViewWeek as CalendarWeekIcon,
  Assessment as AssessmentIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useData } from '../context/DataContext';

export const WeeklyAnalytics: React.FC = () => {
  const { state } = useData();

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`;
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    } else {
      return tokens.toLocaleString();
    }
  };

  const formatWeek = (weekStr: string) => {
    const date = new Date(weekStr);
    return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (state.isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
          Loading weekly analytics...
        </Typography>
      </Box>
    );
  }

  if (state.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{state.error}</Alert>
      </Box>
    );
  }

  if (state.weeklyData.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
          No weekly data available
        </Typography>
      </Box>
    );
  }

  const weeklyData = state.weeklyData;
  const totalTokens = weeklyData.reduce((sum, week) => sum + week.totalTokens, 0);
  const totalCost = weeklyData.reduce((sum, week) => sum + week.totalCost, 0);
  const currentWeek = weeklyData[weeklyData.length - 1];
  const previousWeek = weeklyData[weeklyData.length - 2];

  const weekGrowth = previousWeek 
    ? ((currentWeek.totalCost - previousWeek.totalCost) / previousWeek.totalCost) * 100
    : 0;

  // Prepare chart data
  const chartData = weeklyData.map(week => ({
    ...week,
    weekLabel: formatWeek(week.week),
    cacheTokens: week.cacheCreationTokens + week.cacheReadTokens,
    directTokens: week.inputTokens + week.outputTokens
  }));

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontFamily: '"Poppins", sans-serif !important' }}>
          Weekly Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Usage patterns and trends by week
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" color="textSecondary">
                  Total Weeks
                </Typography>
                <CalendarWeekIcon color="primary" />
              </Box>
              <Typography variant="h4" color="primary.main">
                {weeklyData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" color="textSecondary">
                  Total Usage
                </Typography>
                <AssessmentIcon color="secondary" />
              </Box>
              <Typography variant="h4" color="secondary.main">
                {formatTokens(totalTokens)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                tokens
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" color="textSecondary">
                  Total Cost
                </Typography>
                <MoneyIcon color="error" />
              </Box>
              <Typography variant="h4" color="error.main">
                {formatCurrency(totalCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Week-over-Week Growth
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: weekGrowth >= 0 ? 'success.main' : 'error.main' 
                }}
              >
                {weekGrowth >= 0 ? '+' : ''}{weekGrowth.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                vs previous week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Weekly Cost Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Cost Trends
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="weekLabel" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Cost"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalCost"
                    stroke="#6366F1"
                    fill="#6366F1"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Week Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Week Breakdown
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  {formatWeek(currentWeek.week)}
                </Typography>
                <Typography variant="h5" color="primary.main">
                  {formatCurrency(currentWeek.totalCost)}
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Direct Processing Tokens
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    {formatTokens(currentWeek.inputTokens + currentWeek.outputTokens)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {(((currentWeek.inputTokens + currentWeek.outputTokens) / currentWeek.totalTokens) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={((currentWeek.inputTokens + currentWeek.outputTokens) / currentWeek.totalTokens) * 100}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Cache Tokens
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" color="secondary.main">
                    {formatTokens(currentWeek.cacheCreationTokens + currentWeek.cacheReadTokens)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {(((currentWeek.cacheCreationTokens + currentWeek.cacheReadTokens) / currentWeek.totalTokens) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={((currentWeek.cacheCreationTokens + currentWeek.cacheReadTokens) / currentWeek.totalTokens) * 100}
                  color="secondary"
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Token Usage Comparison */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Token Usage Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="weekLabel" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis 
                    tickFormatter={formatTokens}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatTokens(Number(value)),
                      name === 'directTokens' ? 'Direct Processing' : 'Cache Tokens'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="directTokens" stackId="a" fill="#6366F1" name="Direct Processing" />
                  <Bar dataKey="cacheTokens" stackId="a" fill="#8B5CF6" name="Cache Tokens" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Weekly Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Weekly Breakdown
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Week</TableCell>
                  <TableCell align="right">Input Tokens</TableCell>
                  <TableCell align="right">Output Tokens</TableCell>
                  <TableCell align="right">Cache Tokens</TableCell>
                  <TableCell align="right">Total Tokens</TableCell>
                  <TableCell align="right">Total Cost</TableCell>
                  <TableCell align="right">Models Used</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weeklyData.map((week) => (
                  <TableRow key={week.week}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatWeek(week.week)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatTokens(week.inputTokens)}</TableCell>
                    <TableCell align="right">{formatTokens(week.outputTokens)}</TableCell>
                    <TableCell align="right">
                      {formatTokens(week.cacheCreationTokens + week.cacheReadTokens)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {formatTokens(week.totalTokens)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="error.main">
                        {formatCurrency(week.totalCost)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={0.5} justifyContent="flex-end">
                        {week.modelsUsed.map(model => (
                          <Chip
                            key={model}
                            label={model.replace('claude-', '').replace('-20250514', '')}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};