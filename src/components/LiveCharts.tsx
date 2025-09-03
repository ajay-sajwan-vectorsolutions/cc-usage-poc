import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useData } from "../context/DataContext";

export const LiveCharts: React.FC = () => {
  const { state, actions } = useData();
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("line");
  const [timeRange, setTimeRange] = useState<number>(1);

  const timeSeriesData = timeRange === 1 ? actions.getTodayData() : actions.getTimeSeriesData(timeRange);
  const platformMetrics = state.platformMetrics;

  const handleChartTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: "line" | "area" | "bar"
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleTimeRangeChange = (event: SelectChangeEvent<number>) => {
    setTimeRange(event.target.value as number);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange === 1) {
      // For today, show hour by hour or just "Today"
      return "Today";
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatCurrency = (value: number) => `$${value.toFixed(4)}`;
  const formatNumber = (value: number) => value.toLocaleString();
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    } else {
      return tokens.toLocaleString();
    }
  };

  const COLORS = ["#1976d2", "#dc004e", "#00796b", "#f57c00", "#7b1fa2"];

  const renderTimeSeriesChart = () => {
    const data = timeSeriesData.map((item) => ({
      ...item,
      date: formatDate(item.date),
    }));

    const commonProps = {
      width: 500,
      height: 300,
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (name?.toString().includes('Tokens')) {
                  return [formatTokens(Number(value)), name];
                }
                return [formatNumber(Number(value)), name];
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="vscodeTokens"
              stackId="1"
              stroke="#1976d2"
              fill="#1976d2"
              name="VS Code Tokens"
            />
            <Area
              type="monotone"
              dataKey="webTokens"
              stackId="1"
              stroke="#dc004e"
              fill="#dc004e"
              name="Web Tokens"
            />
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (name?.toString().includes('Tokens')) {
                  return [formatTokens(Number(value)), name];
                }
                return [formatNumber(Number(value)), name];
              }}
            />
            <Legend />
            <Bar dataKey="vscodeTokens" fill="#1976d2" name="VS Code Tokens" />
            <Bar dataKey="webTokens" fill="#dc004e" name="Web Tokens" />
          </BarChart>
        );

      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (name?.toString().includes('Tokens')) {
                  return [formatTokens(Number(value)), name];
                }
                return [formatNumber(Number(value)), name];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="tokens"
              stroke="#1976d2"
              strokeWidth={2}
              name="Total Tokens"
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="#dc004e"
              strokeWidth={2}
              name="Sessions"
            />
          </LineChart>
        );
    }
  };

  const renderPlatformPieChart = () => (
    <PieChart width={400} height={300}>
      <Pie
        data={platformMetrics}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ platform, percentageOfTotal }) =>
          `${platform}: ${percentageOfTotal.toFixed(1)}%`
        }
        outerRadius={80}
        fill="#8884d8"
        dataKey="sessions"
      >
        {platformMetrics.map((_entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip
        formatter={(value) => [formatNumber(Number(value)), "Sessions"]}
      />
    </PieChart>
  );

  const renderCostChart = () => {
    const data = timeSeriesData.map((item) => ({
      ...item,
      date: formatDate(item.date),
    }));

    return (
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Daily Cost"]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="cost"
          stroke="#f57c00"
          strokeWidth={2}
          name="Daily Cost"
        />
      </LineChart>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif !important' }}>
          Live Analytics Charts
        </Typography>
        {timeRange === 1 && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontFamily: '"Poppins", sans-serif !important' }}>
            Real-time view of today's Claude usage activity
          </Typography>
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value={1}>Today</MenuItem>
              <MenuItem value={7}>Last 7 days</MenuItem>
              <MenuItem value={14}>Last 14 days</MenuItem>
              <MenuItem value={30}>Last 30 days</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            aria-label="chart type"
            fullWidth
          >
            <ToggleButton value="line" aria-label="line chart">
              Line
            </ToggleButton>
            <ToggleButton value="area" aria-label="area chart">
              Area
            </ToggleButton>
            <ToggleButton value="bar" aria-label="bar chart">
              Bar
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>

      {/* Today's Summary Card - Only show when Today is selected */}
      {timeRange === 1 && timeSeriesData.length > 0 && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: 'white' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Poppins', mb: 2 }}>
              Today's Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins' }}>
                    {formatNumber(timeSeriesData[0]?.sessions || 0)}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Sessions
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins' }}>
                    {formatTokens(timeSeriesData[0]?.tokens || 0)}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Tokens
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'Poppins' }}>
                    {formatCurrency(timeSeriesData[0]?.cost || 0)}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Cost
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Usage Trends */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Usage Trends ({timeRange === 1 ? 'Today' : `${timeRange} days`})
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                {renderTimeSeriesChart()}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Platform Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Distribution
              </Typography>
              <Box display="flex" justifyContent="center">
                <ResponsiveContainer width="100%" height={300}>
                  {renderPlatformPieChart()}
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Trends */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {timeRange === 1 ? "Today's Cost" : "Daily Cost Trends"}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                {renderCostChart()}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Token Usage by Platform */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Token Usage by Platform
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={platformMetrics}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      formatNumber(Number(value)),
                      name,
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalTokens"
                    fill="#1976d2"
                    name="Total Tokens"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
