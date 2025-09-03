import React, { useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  SelectChangeEvent,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useData } from "../context/DataContext";
import { CostBreakdown } from "../types";

export const CostTracker: React.FC = () => {
  const { state, actions } = useData();
  const [timeRange, setTimeRange] = useState<number>(30);

  const handleTimeRangeChange = (event: SelectChangeEvent<number>) => {
    setTimeRange(event.target.value as number);
  };

  const calculateCostBreakdown = (): CostBreakdown[] => {
    const modelGroups = state.sessions.reduce((acc, session) => {
      const model = session.model;
      if (!acc[model]) {
        acc[model] = [];
      }
      acc[model].push(session);
      return acc;
    }, {} as Record<string, typeof state.sessions>);

    return Object.entries(modelGroups).map(([model, modelSessions]) => ({
      model,
      sessions: modelSessions.length,
      inputTokens: modelSessions.reduce((sum, s) => sum + s.inputTokens, 0),
      outputTokens: modelSessions.reduce((sum, s) => sum + s.outputTokens, 0),
      totalCost: modelSessions.reduce((sum, s) => sum + s.cost, 0),
    }));
  };

  const calculateDailyCosts = () => {
    const timeSeriesData = actions.getTimeSeriesData(timeRange);
    return timeSeriesData.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      cost: item.cost,
      sessions: item.sessions,
    }));
  };

  const costBreakdown = calculateCostBreakdown();
  const dailyCosts = calculateDailyCosts();
  const totalCost = costBreakdown.reduce(
    (sum, item) => sum + item.totalCost,
    0
  );
  const averageDailyCost =
    dailyCosts.reduce((sum, item) => sum + item.cost, 0) /
    Math.max(dailyCosts.length, 1);

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`;
  const formatNumber = (num: number) => num.toLocaleString();

  const getModelDisplayName = (model: string) => {
    return model.replace("claude-", "").replace("-", " ").toUpperCase();
  };

  const getModelColor = (model: string) => {
    const colors = {
      "claude-3-opus": "#1976d2",
      "claude-3-sonnet": "#dc004e",
      "claude-3-haiku": "#00796b",
      "claude-2": "#f57c00",
      "claude-instant": "#7b1fa2",
    };
    return colors[model as keyof typeof colors] || "#666666";
  };

  const mostExpensiveModel = costBreakdown.reduce(
    (max, item) => (item.totalCost > max.totalCost ? item : max),
    costBreakdown[0] || { model: "N/A", totalCost: 0 }
  );

  const highestCostDay = dailyCosts.reduce(
    (max, item) => (item.cost > max.cost ? item : max),
    dailyCosts[0] || { date: "N/A", cost: 0 }
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontFamily: '"Poppins", sans-serif !important' }}>
          Cost Analysis
        </Typography>
      </Box>

      {/* Cost Alerts */}
      {averageDailyCost > 1 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>High Usage Alert</AlertTitle>
          Your average daily cost is ${averageDailyCost.toFixed(2)}. Consider
          optimizing your usage patterns.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value={7}>Last 7 days</MenuItem>
              <MenuItem value={14}>Last 14 days</MenuItem>
              <MenuItem value={30}>Last 30 days</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Cost Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6" color="textSecondary">
                  Total Cost
                </Typography>
                <MoneyIcon color="error" />
              </Box>
              <Typography variant="h4" color="error.main">
                {formatCurrency(totalCost)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6" color="textSecondary">
                  Avg Daily Cost
                </Typography>
                <TrendingUpIcon color="primary" />
              </Box>
              <Typography variant="h4" color="primary.main">
                {formatCurrency(averageDailyCost)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last {timeRange} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Most Expensive Model
              </Typography>
              <Typography
                variant="h5"
                sx={{ color: getModelColor(mostExpensiveModel.model) }}
              >
                {getModelDisplayName(mostExpensiveModel.model)}
              </Typography>
              <Typography variant="body1" color="error.main">
                {formatCurrency(mostExpensiveModel.totalCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Highest Cost Day
              </Typography>
              <Typography variant="h6">{highestCostDay.date}</Typography>
              <Typography variant="body1" color="error.main">
                {formatCurrency(highestCostDay.cost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Cost by Model - Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cost Distribution by Model
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ model, totalCost }) =>
                      `${getModelDisplayName(model)}: ${formatCurrency(
                        totalCost
                      )}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalCost"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getModelColor(entry.model)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Cost",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Cost Trends */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily Cost Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dailyCosts}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Daily Cost",
                    ]}
                  />
                  <Bar dataKey="cost" fill="#f57c00" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Cost Breakdown Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Model Cost Breakdown
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Model</TableCell>
                      <TableCell align="right">Sessions</TableCell>
                      <TableCell align="right">Input Tokens</TableCell>
                      <TableCell align="right">Output Tokens</TableCell>
                      <TableCell align="right">Total Cost</TableCell>
                      <TableCell align="right">Avg Cost/Session</TableCell>
                      <TableCell align="right">Cost/1K Tokens</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {costBreakdown
                      .sort((a, b) => b.totalCost - a.totalCost)
                      .map((model) => (
                        <TableRow key={model.model}>
                          <TableCell>
                            <Chip
                              label={getModelDisplayName(model.model)}
                              sx={{
                                backgroundColor: getModelColor(model.model),
                                color: "white",
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(model.sessions)}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(model.inputTokens)}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(model.outputTokens)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              color="error.main"
                              fontWeight="bold"
                            >
                              {formatCurrency(model.totalCost)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(model.totalCost / model.sessions)}
                          </TableCell>
                          <TableCell align="right">
                            $
                            {(
                              (model.totalCost /
                                (model.inputTokens + model.outputTokens)) *
                              1000
                            ).toFixed(6)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Efficiency Analysis */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cost Efficiency Analysis
              </Typography>
              <Grid container spacing={2}>
                {costBreakdown.length > 0 && costBreakdown.map((model) => {
                  const efficiency =
                    (model.inputTokens + model.outputTokens) / model.totalCost;
                  const maxEfficiency = Math.max(
                    ...costBreakdown.map(
                      (m) => (m.inputTokens + m.outputTokens) / m.totalCost
                    )
                  );
                  const efficiencyPercentage =
                    (efficiency / maxEfficiency) * 100;

                  return (
                    <Grid item xs={12} md={6} key={model.model}>
                      <Box>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography variant="body1">
                            {getModelDisplayName(model.model)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {formatNumber(Math.round(efficiency))} tokens/$
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={efficiencyPercentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "rgba(0,0,0,0.1)",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: getModelColor(model.model),
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
