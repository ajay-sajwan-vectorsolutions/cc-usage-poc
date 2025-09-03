import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar
} from '@mui/material';
import {
  Code as CodeIcon,
  Web as WebIcon,
  Api as ApiIcon
} from '@mui/icons-material';
import { useData } from '../context/DataContext';

export const PlatformMetrics: React.FC = () => {
  const { state } = useData();
  const [showDetails, setShowDetails] = useState(false);
  
  if (state.isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  const platformMetrics = state.platformMetrics;
  const totalSessions = state.sessions.length;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'vscode': return <CodeIcon />;
      case 'web': return <WebIcon />;
      case 'api': return <ApiIcon />;
      default: return <ApiIcon />;
    }
  };

  const getPlatformColor = (platform: string): "primary" | "secondary" | "success" => {
    switch (platform) {
      case 'vscode': return 'primary';
      case 'web': return 'secondary';
      case 'api': return 'success';
      default: return 'primary';
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`;
  const formatNumber = (num: number) => num.toLocaleString();
  const formatDuration = (minutes: number) => `${minutes.toFixed(1)} min`;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontFamily: '"Poppins", sans-serif !important' }}>
            Platform Comparison
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

      {totalSessions === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
          No platform data available
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {platformMetrics.map((metric) => (
            <Grid item xs={12} md={4} key={metric.platform}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${getPlatformColor(metric.platform)}.main`,
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      {getPlatformIcon(metric.platform)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                        {metric.platform === 'vscode' ? 'VS Code' : metric.platform}
                      </Typography>
                      <Chip
                        label={`${metric.percentageOfTotal.toFixed(1)}% of total`}
                        size="small"
                        color={getPlatformColor(metric.platform)}
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Usage Distribution
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={metric.percentageOfTotal}
                      color={getPlatformColor(metric.platform)}
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Sessions
                        </Typography>
                        <Typography variant="h6">
                          {formatNumber(metric.sessions)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Avg Duration
                        </Typography>
                        <Typography variant="h6">
                          {formatDuration(metric.averageSessionDuration)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Total Tokens
                        </Typography>
                        <Typography variant="h6" color="secondary.main">
                          {formatNumber(metric.totalTokens)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Total Cost
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {formatCurrency(metric.totalCost)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {showDetails && platformMetrics.length > 0 && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Detailed Platform Breakdown
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Platform</TableCell>
                  <TableCell align="right">Sessions</TableCell>
                  <TableCell align="right">Total Tokens</TableCell>
                  <TableCell align="right">Avg Tokens/Session</TableCell>
                  <TableCell align="right">Total Cost</TableCell>
                  <TableCell align="right">Avg Cost/Session</TableCell>
                  <TableCell align="right">Avg Duration</TableCell>
                  <TableCell align="right">% of Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {platformMetrics
                  .sort((a, b) => b.sessions - a.sessions)
                  .map((metric) => (
                    <TableRow key={metric.platform}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ 
                              bgcolor: `${getPlatformColor(metric.platform)}.main`,
                              mr: 1,
                              width: 32,
                              height: 32
                            }}
                          >
                            {getPlatformIcon(metric.platform)}
                          </Avatar>
                          <Typography sx={{ textTransform: 'capitalize' }}>
                            {metric.platform === 'vscode' ? 'VS Code' : metric.platform}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatNumber(metric.sessions)}</TableCell>
                      <TableCell align="right">{formatNumber(metric.totalTokens)}</TableCell>
                      <TableCell align="right">
                        {formatNumber(Math.round(metric.totalTokens / metric.sessions))}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(metric.totalCost)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(metric.totalCost / metric.sessions)}
                      </TableCell>
                      <TableCell align="right">
                        {formatDuration(metric.averageSessionDuration)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${metric.percentageOfTotal.toFixed(1)}%`}
                          color={getPlatformColor(metric.platform)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Platform-specific insights */}
      <Grid container spacing={3} mt={2}>
        {platformMetrics.map((metric) => {
          const platformSessions = state.sessions.filter(s => s.platform === metric.platform);
          const mostUsedModel = platformSessions
            .reduce((acc, session) => {
              acc[session.model] = (acc[session.model] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
          
          const topModel = Object.entries(mostUsedModel)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

          return (
            <Grid item xs={12} md={4} key={`insights-${metric.platform}`}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {metric.platform === 'vscode' ? 'VS Code' : metric.platform} Insights
                  </Typography>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Most Used Model
                    </Typography>
                    <Typography variant="body1">
                      {topModel.replace('-', ' ').toUpperCase()}
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Cost per Token
                    </Typography>
                    <Typography variant="body1">
                      ${(metric.totalCost / metric.totalTokens * 1000).toFixed(6)}/1k tokens
                    </Typography>
                  </Box>

                  {metric.platform === 'vscode' && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Code Generation Sessions
                      </Typography>
                      <Typography variant="body1">
                        {platformSessions.filter(s => s.vscodeData?.codeGenerated).length} / {metric.sessions}
                      </Typography>
                    </Box>
                  )}

                  {metric.platform === 'web' && (
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Avg Conversation Length
                      </Typography>
                      <Typography variant="body1">
                        {(platformSessions.reduce((sum, s) => sum + (s.webData?.conversationLength || 0), 0) / metric.sessions).toFixed(1)} messages
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};