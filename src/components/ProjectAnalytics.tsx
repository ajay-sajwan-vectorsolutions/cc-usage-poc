import React, { useState } from 'react';
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
  Switch,
  FormControlLabel,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Code as CodeIcon,
  Folder as FolderIcon,
  Assessment as AssessmentIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
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
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { useData } from '../context/DataContext';

export const ProjectAnalytics: React.FC = () => {
  const { state } = useData();
  const [showDetails, setShowDetails] = useState(false);
  
  if (state.isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

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
  
  if (projectMetrics.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
          No project data available. Use Claude in VS Code with different projects to see project breakdown.
        </Typography>
      </Box>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`;
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
  
  const formatDuration = (minutes: number) => `${minutes.toFixed(1)} min`;

  const getProjectColor = (index: number) => {
    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#8B5A2B'];
    return colors[index % colors.length];
  };

  const totalTokens = projectMetrics.reduce((sum, p) => sum + p.totalTokens, 0);
  const totalCost = projectMetrics.reduce((sum, p) => sum + p.totalCost, 0);

  const pieChartData = projectMetrics.map((project, index) => ({
    name: project.name,
    value: project.totalTokens,
    cost: project.totalCost,
    fill: getProjectColor(index)
  }));

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontFamily: '"Poppins", sans-serif !important' }}>
            Project Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Usage breakdown by project workspace
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
            />
          }
          label="Show Details"
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" color="textSecondary">
                  Total Projects
                </Typography>
                <FolderIcon color="primary" />
              </Box>
              <Typography variant="h4" color="primary.main">
                {projectMetrics.length}
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
                Most Active Project
              </Typography>
              <Typography variant="h6" sx={{ color: getProjectColor(0) }}>
                {projectMetrics[0]?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {formatTokens(projectMetrics[0]?.totalTokens || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Project Cards */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {projectMetrics.map((project, index) => (
              <Grid item xs={12} md={6} key={project.name}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar 
                        sx={{ 
                          bgcolor: getProjectColor(index),
                          mr: 2,
                          width: 48,
                          height: 48
                        }}
                      >
                        <CodeIcon />
                      </Avatar>
                      <Box flex={1}>
                        <Tooltip title={project.path} arrow>
                          <Typography variant="h6" noWrap>
                            {project.name}
                          </Typography>
                        </Tooltip>
                        <Chip
                          label={`${project.percentageOfTotal.toFixed(1)}% of total`}
                          size="small"
                          sx={{ 
                            bgcolor: getProjectColor(index),
                            color: 'white'
                          }}
                        />
                      </Box>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">
                        Usage Distribution
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={project.percentageOfTotal}
                        sx={{ 
                          mt: 1, 
                          height: 8, 
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getProjectColor(index)
                          }
                        }}
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Sessions
                          </Typography>
                          <Typography variant="h6">
                            {formatNumber(project.sessions)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Tokens
                          </Typography>
                          <Typography variant="h6" color="secondary.main">
                            {formatTokens(project.totalTokens)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Cost
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {formatCurrency(project.totalCost)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Avg Duration
                          </Typography>
                          <Typography variant="h6">
                            {formatDuration(project.averageSessionDuration)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Project Distribution Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Token Distribution by Project
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ value }) => formatTokens(value)}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => [
                      formatTokens(Number(value)),
                      "Tokens"
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Project Comparison Table */}
      {showDetails && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Detailed Project Comparison
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell align="right">Sessions</TableCell>
                  <TableCell align="right">Total Tokens</TableCell>
                  <TableCell align="right">Avg Tokens/Session</TableCell>
                  <TableCell align="right">Total Cost</TableCell>
                  <TableCell align="right">Cost/Session</TableCell>
                  <TableCell align="right">% of Total</TableCell>
                  <TableCell align="right">Last Activity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectMetrics
                  .sort((a, b) => b.totalTokens - a.totalTokens)
                  .map((project, index) => (
                    <TableRow key={project.name}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ 
                              bgcolor: getProjectColor(index),
                              mr: 1,
                              width: 32,
                              height: 32
                            }}
                          >
                            <CodeIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {project.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {project.path.length > 30 ? `...${project.path.slice(-30)}` : project.path}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatNumber(project.sessions)}</TableCell>
                      <TableCell align="right">{formatTokens(project.totalTokens)}</TableCell>
                      <TableCell align="right">
                        {formatTokens(Math.round(project.totalTokens / Math.max(project.sessions, 1)))}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(project.totalCost)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(project.totalCost / Math.max(project.sessions, 1))}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${project.percentageOfTotal.toFixed(1)}%`}
                          size="small"
                          sx={{ 
                            bgcolor: getProjectColor(index),
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="textSecondary">
                          {new Date(project.lastActivityDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Project Comparison Chart */}
      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Project Token Usage Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={projectMetrics.slice(0, 10)} // Show top 10 projects
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis 
                  tickFormatter={formatTokens}
                />
                <RechartsTooltip
                  formatter={(value) => [
                    formatTokens(Number(value)),
                    "Tokens"
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="totalTokens" 
                  fill="#6366F1" 
                  name="Total Tokens"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};