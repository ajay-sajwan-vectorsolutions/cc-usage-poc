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
  CalendarMonth as CalendarMonthIcon,
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
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useData } from '../context/DataContext';

export const MonthlyAnalytics: React.FC = () => {
  const { state } = useData();

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    } else {
      return tokens.toLocaleString();
    }
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (state.isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
          Loading monthly analytics...
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

  if (state.monthlyData.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
          No monthly data available
        </Typography>
      </Box>
    );
  }

  const monthlyData = state.monthlyData;
  const totalCost = monthlyData.reduce((sum, month) => sum + month.totalCost, 0);
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];

  const monthGrowth = previousMonth 
    ? ((currentMonth.totalCost - previousMonth.totalCost) / previousMonth.totalCost) * 100
    : 0;

  // Prepare chart data
  const chartData = monthlyData.map((month, index) => ({
    ...month,
    monthLabel: formatMonth(month.month),
    cacheTokens: month.cacheCreationTokens + month.cacheReadTokens,
    directTokens: month.inputTokens + month.outputTokens,
    color: index === monthlyData.length - 1 ? '#6366F1' : '#8B5CF6'
  }));

  const pieData = [
    {
      name: 'Cache Tokens',
      value: currentMonth.cacheCreationTokens + currentMonth.cacheReadTokens,
      fill: '#8B5CF6'
    },
    {
      name: 'Direct Processing',
      value: currentMonth.inputTokens + currentMonth.outputTokens,
      fill: '#6366F1'
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontFamily: '"Poppins", sans-serif !important' }}>
          Monthly Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Long-term usage patterns and cost analysis
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" color="textSecondary">
                  Total Months
                </Typography>
                <CalendarMonthIcon color="primary" />
              </Box>
              <Typography variant="h4" color="primary.main">
                {monthlyData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" color="textSecondary">
                  Current Month
                </Typography>
                <AssessmentIcon color="secondary" />
              </Box>
              <Typography variant="h4" color="secondary.main">
                {formatTokens(currentMonth.totalTokens)}
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
                  Total Spend
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
                Month-over-Month
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: monthGrowth >= 0 ? 'error.main' : 'success.main' 
                }}
              >
                {monthGrowth >= 0 ? '+' : ''}{monthGrowth.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                cost change
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Month Insights */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: 'white' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Poppins', mb: 2 }}>
            {formatMonth(currentMonth.month)} Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins' }}>
                  {formatCurrency(currentMonth.totalCost)}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Cost
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins' }}>
                  {formatTokens(currentMonth.totalTokens)}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Tokens
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins' }}>
                  {(((currentMonth.cacheCreationTokens + currentMonth.cacheReadTokens) / currentMonth.totalTokens) * 100).toFixed(0)}%
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Cache Efficiency
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box textAlign="center">
                <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins' }}>
                  {formatCurrency(currentMonth.totalCost / Math.max(1, Math.round(currentMonth.totalTokens / 1000000)))}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Cost per 1M tokens
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Monthly Cost Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Cost Evolution
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthLabel" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Cost"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalCost"
                    stroke="#6366F1"
                    fill="url(#colorGradient)"
                    fillOpacity={0.6}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Month Token Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {formatMonth(currentMonth.month)} Token Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatTokens(Number(value)), "Tokens"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Cache efficiency: {(((currentMonth.cacheCreationTokens + currentMonth.cacheReadTokens) / currentMonth.totalTokens) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Token Comparison */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Token Usage Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthLabel" />
                  <YAxis tickFormatter={formatTokens} />
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

      {/* Detailed Monthly Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Monthly Breakdown
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Input Tokens</TableCell>
                  <TableCell align="right">Output Tokens</TableCell>
                  <TableCell align="right">Cache Tokens</TableCell>
                  <TableCell align="right">Total Tokens</TableCell>
                  <TableCell align="right">Total Cost</TableCell>
                  <TableCell align="right">Avg Cost/1M</TableCell>
                  <TableCell align="right">Models Used</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyData.map((month) => {
                  const costPer1M = month.totalCost / Math.max(1, month.totalTokens / 1000000);
                  return (
                    <TableRow key={month.month}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatMonth(month.month)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{formatTokens(month.inputTokens)}</TableCell>
                      <TableCell align="right">{formatTokens(month.outputTokens)}</TableCell>
                      <TableCell align="right">
                        {formatTokens(month.cacheCreationTokens + month.cacheReadTokens)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {formatTokens(month.totalTokens)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="error.main">
                          {formatCurrency(month.totalCost)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(costPer1M)}
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" gap={0.5} justifyContent="flex-end">
                          {month.modelsUsed.map(model => (
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
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};