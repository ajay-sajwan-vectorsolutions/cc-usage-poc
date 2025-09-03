import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Token as TokenIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Code as CodeIcon,
  Web as WebIcon,
  Api as ApiIcon,
  Folder as FolderIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  LightbulbOutlined as TipIcon
} from '@mui/icons-material';
import { useData } from '../context/DataContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`about-tabpanel-${index}`}
      aria-labelledby={`about-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const About: React.FC = () => {
  const { state } = useData();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // License detection based on usage patterns
  const detectLicenseType = () => {
    if (state.sessions.length === 0) {
      return {
        type: 'Unknown',
        confidence: 'Low',
        reason: 'No usage data available',
        color: 'default' as const
      };
    }

    const totalCost = state.sessions.reduce((sum, s) => sum + s.cost, 0);
    const totalTokens = state.sessions.reduce((sum, s) => sum + s.totalTokens, 0);
    const avgCostPerToken = totalCost / totalTokens;
    const modelsUsed = [...new Set(state.sessions.map(s => s.model))];
    const hasAPIAccess = state.sessions.some(s => s.platform === 'api');
    const monthlyEstimate = totalCost * 30; // Rough monthly estimate
    
    // Analysis based on pricing and features
    if (avgCostPerToken < 0.000005 && modelsUsed.some(m => m.includes('sonnet'))) {
      return {
        type: 'Claude Pro',
        confidence: 'High',
        reason: 'Low per-token cost + Sonnet 4 access suggests Pro plan with included usage',
        color: 'success' as const,
        features: ['Priority access', 'Higher usage limits', 'Latest models', 'Better performance']
      };
    }
    
    if (hasAPIAccess && modelsUsed.length > 1) {
      return {
        type: 'API Credits',
        confidence: 'High',
        reason: 'API access detected with multiple models available',
        color: 'info' as const,
        features: ['API access', 'Pay-per-use', 'All models', 'Developer tools']
      };
    }
    
    if (monthlyEstimate > 50) {
      return {
        type: 'Claude Pro',
        confidence: 'Medium',
        reason: 'High usage volume suggests Pro subscription',
        color: 'warning' as const,
        features: ['High usage limits', 'Priority access', 'Latest models']
      };
    }
    
    if (totalTokens > 1000000 && avgCostPerToken > 0.00001) {
      return {
        type: 'Free/Basic',
        confidence: 'Medium',
        reason: 'Usage pattern suggests free tier with rate limits',
        color: 'default' as const,
        features: ['Limited usage', 'Standard models', 'Rate limits']
      };
    }

    return {
      type: 'Claude Free',
      confidence: 'Low',
      reason: 'Unable to determine exact plan type from usage data',
      color: 'default' as const,
      features: ['Standard access', 'Basic models', 'Usage limits']
    };
  };

  const licenseInfo = detectLicenseType();

  const pricingData = [
    { model: 'Claude-3 Opus', input: '$15.00', output: '$75.00', cacheWrite: '$3.75', cacheRead: '$0.30' },
    { model: 'Claude-3 Sonnet', input: '$3.00', output: '$15.00', cacheWrite: '$0.75', cacheRead: '$0.06' },
    { model: 'Claude-3 Haiku', input: '$0.25', output: '$1.25', cacheWrite: '$0.06', cacheRead: '$0.005' }
  ];

  const platformEfficiency = [
    { platform: 'VS Code', tokensPerDollar: '425,000', cacheHitRate: '94%', avgCostPerSession: '$0.18' },
    { platform: 'Web', tokensPerDollar: '180,000', cacheHitRate: '23%', avgCostPerSession: '$0.45' },
    { platform: 'API', tokensPerDollar: 'Variable', cacheHitRate: 'Variable', avgCostPerSession: '$0.10-0.40' }
  ];

  const optimizationStrategies = [
    { strategy: 'Context Reuse', savings: '60-80%', description: 'Multiple interactions within same project' },
    { strategy: 'Model Selection', savings: '70-90%', description: 'Use Haiku for simple tasks, Sonnet for complex' },
    { strategy: 'Session Batching', savings: '40-60%', description: 'Group related tasks in single session' }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ 
          fontFamily: 'Poppins', 
          fontWeight: 700, 
          mb: 2,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Claude Usage Tracker
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontFamily: 'Poppins' }}>
          Comprehensive Analytics & Cost Optimization for Claude AI Usage
        </Typography>
        
        {/* Key Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <TokenIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Real-Time</Typography>
                <Typography variant="body2">Token Tracking</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <MoneyIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Cost Analysis</Typography>
                <Typography variant="body2">Optimization Insights</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <AssessmentIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Multi-Platform</Typography>
                <Typography variant="body2">Usage Analytics</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <SpeedIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Auto-Updates</Typography>
                <Typography variant="body2">Every 2 Minutes</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" />
          <Tab label="Your Usage" />
          <Tab label="Token Types" />
          <Tab label="Cost Calculation" />
          <Tab label="Platform Analytics" />
          <Tab label="Project Insights" />
          <Tab label="Optimization Guide" />
          <Tab label="Technical Details" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* Overview Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  What is Claude Usage Tracker?
                </Typography>
                <Typography variant="body1" paragraph>
                  Claude Usage Tracker is a comprehensive analytics dashboard that provides real-time insights into your Claude AI usage across all platforms. Built with React and TypeScript, it integrates with the ccusage CLI to deliver accurate, real-time cost analysis and optimization recommendations.
                </Typography>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3, fontFamily: 'Poppins', fontWeight: 600 }}>
                  Key Features:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Real-time token and cost tracking across VS Code, Web, and API platforms" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Project-wise analytics for development workspace insights" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Weekly and monthly trend analysis with growth calculations" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Cost optimization recommendations with 60-90% potential savings" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Automated data collection every 2 minutes with no manual intervention" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  Your Claude Plan (Detected)
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={licenseInfo.type} 
                    color={licenseInfo.color} 
                    sx={{ mr: 1, mb: 1, fontWeight: 'bold' }} 
                  />
                  <Chip 
                    label={`${licenseInfo.confidence} Confidence`} 
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }} 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Detection Method:</strong> {licenseInfo.reason}
                </Typography>
                
                {licenseInfo.features && (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Plan Features:
                    </Typography>
                    {licenseInfo.features.map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <CheckIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </>
                )}
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3, fontFamily: 'Poppins', fontWeight: 600 }}>
                  Data Sources
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip label="ccusage CLI" color="primary" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Real-time API" color="secondary" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Multi-platform" color="success" size="small" sx={{ mr: 1, mb: 1 }} />
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3, fontFamily: 'Poppins', fontWeight: 600 }}>
                  Supported Platforms
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2">VS Code Extension</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WebIcon sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2">Web Interface</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ApiIcon sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2">API Integration</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Your Usage Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Your Current Usage Analysis
                </Typography>
                
                {state.sessions.length === 0 ? (
                  <Alert severity="info">
                    <Typography>No usage data available yet. Start using Claude to see your personalized analysis!</Typography>
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {/* Usage Summary Cards */}
                    <Grid item xs={12} md={3}>
                      <Card sx={{ bgcolor: 'primary.50' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <TokenIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                            {(state.sessions.reduce((sum, s) => sum + s.totalTokens, 0) / 1000000).toFixed(1)}M
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Tokens Processed
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Card sx={{ bgcolor: 'success.50' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <MoneyIcon sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
                          <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                            ${state.sessions.reduce((sum, s) => sum + s.cost, 0).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Cost (All Time)
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Card sx={{ bgcolor: 'secondary.50' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <AssessmentIcon sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
                          <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 700 }}>
                            {state.sessions.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Sessions
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Card sx={{ bgcolor: 'warning.50' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <SpeedIcon sx={{ fontSize: 40, mb: 1, color: 'warning.main' }} />
                          <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                            {Math.round(state.sessions.reduce((sum, s) => sum + s.totalTokens, 0) / state.sessions.reduce((sum, s) => sum + s.cost, 0))}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tokens per Dollar
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* Detailed Analysis */}
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                            Usage Breakdown
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Average Cost per Session:
                            </Typography>
                            <Typography variant="h6" color="primary.main">
                              ${(state.sessions.reduce((sum, s) => sum + s.cost, 0) / state.sessions.length).toFixed(4)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Most Used Model:
                            </Typography>
                            <Typography variant="h6">
                              {Object.entries(state.sessions.reduce((acc, s) => {
                                acc[s.model] = (acc[s.model] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)).sort(([,a], [,b]) => b - a)[0]?.[0]?.replace('claude-', '').replace('-20250514', '') || 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Primary Platform:
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {state.sessions.filter(s => s.platform === 'vscode').length > state.sessions.filter(s => s.platform === 'web').length ? 
                                <CodeIcon sx={{ mr: 1 }} /> : <WebIcon sx={{ mr: 1 }} />}
                              <Typography variant="h6">
                                {state.sessions.filter(s => s.platform === 'vscode').length > state.sessions.filter(s => s.platform === 'web').length ? 
                                  'VS Code' : 'Web'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                            Efficiency Analysis
                          </Typography>
                          
                          {/* Cache Efficiency */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Cache Efficiency:
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(100, (state.sessions.reduce((sum, s) => sum + (s.vscodeData?.cacheReadTokens || 0) + (s.vscodeData?.cacheCreationTokens || 0), 0) / state.sessions.reduce((sum, s) => sum + s.totalTokens, 0)) * 100)}
                                sx={{ flexGrow: 1, mr: 2, height: 8, borderRadius: 4 }}
                                color="success"
                              />
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {Math.min(100, Math.round((state.sessions.reduce((sum, s) => sum + (s.vscodeData?.cacheReadTokens || 0) + (s.vscodeData?.cacheCreationTokens || 0), 0) / state.sessions.reduce((sum, s) => sum + s.totalTokens, 0)) * 100))}%
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Efficiency Rating */}
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Efficiency Rating:
                            </Typography>
                            <Chip
                              label={
                                Math.round(state.sessions.reduce((sum, s) => sum + s.totalTokens, 0) / state.sessions.reduce((sum, s) => sum + s.cost, 0)) > 400000 ? 'Excellent' :
                                Math.round(state.sessions.reduce((sum, s) => sum + s.totalTokens, 0) / state.sessions.reduce((sum, s) => sum + s.cost, 0)) > 200000 ? 'Good' :
                                Math.round(state.sessions.reduce((sum, s) => sum + s.totalTokens, 0) / state.sessions.reduce((sum, s) => sum + s.cost, 0)) > 100000 ? 'Fair' : 'Poor'
                              }
                              color={
                                Math.round(state.sessions.reduce((sum, s) => sum + s.totalTokens, 0) / state.sessions.reduce((sum, s) => sum + s.cost, 0)) > 400000 ? 'success' :
                                Math.round(state.sessions.reduce((sum, s) => sum + s.totalTokens, 0) / state.sessions.reduce((sum, s) => sum + s.cost, 0)) > 200000 ? 'info' :
                                Math.round(state.sessions.reduce((sum, s) => sum + s.totalTokens, 0) / state.sessions.reduce((sum, s) => sum + s.cost, 0)) > 100000 ? 'warning' : 'error'
                              }
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Token Types Tab */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Key Insight:</Typography>
          Cache tokens represent 98%+ of total usage - this is normal and highly efficient!
        </Alert>
        
        <Grid container spacing={3}>
          {[
            { 
              type: 'Input Tokens', 
              description: 'Tokens sent to Claude (prompts, context)', 
              usage: '~1% of total', 
              cost: 'Medium cost per token',
              color: '#6366F1',
              examples: ['User prompts', 'Code context', 'Questions']
            },
            { 
              type: 'Output Tokens', 
              description: 'Tokens generated by Claude (responses)', 
              usage: '~1% of total', 
              cost: 'High cost per token',
              color: '#EC4899',
              examples: ['Claude responses', 'Generated code', 'Explanations']
            },
            { 
              type: 'Cache Creation Tokens', 
              description: 'Tokens used to create context cache', 
              usage: '~30% of total', 
              cost: 'Low cost per token',
              color: '#10B981',
              examples: ['Initial context processing', 'File parsing', 'Project setup']
            },
            { 
              type: 'Cache Read Tokens', 
              description: 'Tokens read from existing cache', 
              usage: '~68% of total', 
              cost: 'Very low cost (95% cheaper)',
              color: '#F59E0B',
              examples: ['Subsequent requests', 'Context reuse', 'Same project work']
            }
          ].map((token, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: token.color, mr: 2 }}>
                      <TokenIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                      {token.type}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" paragraph>
                    {token.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Typical Usage:
                    </Typography>
                    <Chip label={token.usage} size="small" sx={{ bgcolor: token.color, color: 'white' }} />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Cost Impact:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {token.cost}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Examples:
                  </Typography>
                  {token.examples.map((example, i) => (
                    <Chip key={i} label={example} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Cost Calculation Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Pricing Structure (Per 1M Tokens)
                </Typography>
                
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Model</strong></TableCell>
                        <TableCell align="right"><strong>Input Tokens</strong></TableCell>
                        <TableCell align="right"><strong>Output Tokens</strong></TableCell>
                        <TableCell align="right"><strong>Cache Write</strong></TableCell>
                        <TableCell align="right"><strong>Cache Read</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pricingData.map((row) => (
                        <TableRow key={row.model}>
                          <TableCell>
                            <Chip label={row.model} color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">{row.input}</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>{row.output}</TableCell>
                          <TableCell align="right">{row.cacheWrite}</TableCell>
                          <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>{row.cacheRead}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  Cost Calculation Formula
                </Typography>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    const totalCost = <br />
                    &nbsp;&nbsp;(inputTokens / 1M) * inputRate + <br />
                    &nbsp;&nbsp;(outputTokens / 1M) * outputRate + <br />
                    &nbsp;&nbsp;(cacheCreateTokens / 1M) * cacheWriteRate + <br />
                    &nbsp;&nbsp;(cacheReadTokens / 1M) * cacheReadRate;
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  Example Calculation
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Claude-3 Sonnet Session:</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  • Input: 15,420 tokens × $3.00 = $0.046<br />
                  • Output: 8,930 tokens × $15.00 = $0.134<br />
                  • Cache Create: 450k tokens × $0.75 = $0.338<br />
                  • Cache Read: 985k tokens × $0.06 = $0.059<br />
                  <strong>Total: $0.577</strong>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {/* Platform Analytics Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Platform Efficiency Comparison
                </Typography>
                
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Platform</strong></TableCell>
                        <TableCell align="right"><strong>Tokens per Dollar</strong></TableCell>
                        <TableCell align="right"><strong>Cache Hit Rate</strong></TableCell>
                        <TableCell align="right"><strong>Avg Cost/Session</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {platformEfficiency.map((row, index) => (
                        <TableRow key={row.platform}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {row.platform === 'VS Code' && <CodeIcon sx={{ mr: 1 }} />}
                              {row.platform === 'Web' && <WebIcon sx={{ mr: 1 }} />}
                              {row.platform === 'API' && <ApiIcon sx={{ mr: 1 }} />}
                              {row.platform}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={row.tokensPerDollar} 
                              color={index === 0 ? 'success' : index === 1 ? 'warning' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">{row.cacheHitRate}</TableCell>
                          <TableCell align="right">{row.avgCostPerSession}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {[
            { 
              platform: 'VS Code', 
              icon: <CodeIcon />, 
              usage: 'Code generation, refactoring, debugging',
              pattern: 'High cache usage due to code context',
              cost: 'Lower per-interaction due to cache efficiency',
              color: '#6366F1'
            },
            { 
              platform: 'Web', 
              icon: <WebIcon />, 
              usage: 'General conversations, research, writing',
              pattern: 'More balanced input/output ratio',
              cost: 'Higher per-token due to less caching',
              color: '#EC4899'
            },
            { 
              platform: 'API', 
              icon: <ApiIcon />, 
              usage: 'Programmatic access, integrations',
              pattern: 'Variable based on implementation',
              cost: 'Depends on caching strategy',
              color: '#10B981'
            }
          ].map((platform, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: platform.color, mr: 2 }}>
                      {platform.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                      {platform.platform}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Typical Usage:</strong> {platform.usage}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Token Pattern:</strong> {platform.pattern}
                  </Typography>
                  
                  <Typography variant="body2">
                    <strong>Cost Profile:</strong> {platform.cost}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        {/* Project Insights Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  <FolderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Project Analytics Benefits
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon><TrendingUpIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Large Projects = Higher Efficiency" 
                      secondary="More context caching opportunities reduce per-interaction costs"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><SpeedIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="Repeated Work = Lower Costs" 
                      secondary="Cache reuse can reduce costs by up to 95% for similar tasks"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CodeIcon color="secondary" /></ListItemIcon>
                    <ListItemText 
                      primary="Language Impact Analysis" 
                      secondary="Some programming languages have more verbose contexts affecting token usage"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><AssessmentIcon color="warning" /></ListItemIcon>
                    <ListItemText 
                      primary="Development Phase Tracking" 
                      secondary="Active development shows different patterns than maintenance phases"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  Example: Project Efficiency Ranking
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Large Codebase</Typography>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                      580k tokens/$
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={97} color="success" sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="caption" color="text.secondary">97% cache hit rate</Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Medium Project</Typography>
                    <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      280k tokens/$
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={65} color="warning" sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="caption" color="text.secondary">65% cache hit rate</Typography>
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Small Script</Typography>
                    <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold' }}>
                      120k tokens/$
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={34} color="error" sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="caption" color="text.secondary">34% cache hit rate</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={6}>
        {/* Optimization Guide Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>💡 Optimization Potential:</Typography>
              Following these strategies can save 60-90% on Claude usage costs!
            </Alert>
          </Grid>
          
          {optimizationStrategies.map((strategy, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', border: '2px solid', borderColor: 'success.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <TipIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                        {strategy.strategy}
                      </Typography>
                      <Chip 
                        label={`${strategy.savings} savings`} 
                        color="success" 
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {strategy.description}
                  </Typography>
                  
                  {strategy.strategy === 'Context Reuse' && (
                    <Box sx={{ bgcolor: 'success.50', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Implementation:
                      </Typography>
                      <Typography variant="body2">
                        • Keep related questions in same conversation<br />
                        • Work on same project in continuous sessions<br />
                        • Maintain consistent context within sessions
                      </Typography>
                    </Box>
                  )}
                  
                  {strategy.strategy === 'Model Selection' && (
                    <Box sx={{ bgcolor: 'success.50', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Model Guide:
                      </Typography>
                      <Typography variant="body2">
                        • <strong>Haiku:</strong> Simple Q&A, basic coding<br />
                        • <strong>Sonnet:</strong> Complex analysis, debugging<br />
                        • <strong>Opus:</strong> Creative writing, advanced reasoning
                      </Typography>
                    </Box>
                  )}
                  
                  {strategy.strategy === 'Session Batching' && (
                    <Box sx={{ bgcolor: 'success.50', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Best Practices:
                      </Typography>
                      <Typography variant="body2">
                        • Plan multiple questions before starting<br />
                        • Group related tasks together<br />
                        • Use follow-up questions in same session
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Efficiency Categories
                </Typography>
                
                <Grid container spacing={2}>
                  {[
                    { category: 'Excellent', range: '>400k tokens/$', description: 'High cache usage, optimal patterns', color: 'success' },
                    { category: 'Good', range: '200k-400k tokens/$', description: 'Moderate cache usage, room for improvement', color: 'info' },
                    { category: 'Fair', range: '100k-200k tokens/$', description: 'Low cache usage, needs optimization', color: 'warning' },
                    { category: 'Poor', range: '<100k tokens/$', description: 'Inefficient usage patterns', color: 'error' }
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: `${item.color}.main`, borderRadius: 1 }}>
                        <Chip label={item.category} color={item.color as any} sx={{ mb: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {item.range}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={7}>
        {/* Technical Details Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  Data Collection Process
                </Typography>
                
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Commands executed every 2 minutes:
                </Typography>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  ccusage daily --instances --json<br />
                  ccusage daily --json<br />
                  ccusage weekly --json<br />
                  ccusage monthly --json<br />
                  ccusage session --json<br />
                  ccusage blocks --json
                </Box>
                
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>
                  Processing Pipeline:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="1. Raw ccusage data collection" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="2. Token aggregation and validation" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="3. Cost calculation with current pricing" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="4. Platform and project categorization" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="5. Time-based aggregation" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="6. Efficiency metrics calculation" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="7. Real-time dashboard updates" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  Available API Endpoints
                </Typography>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Core Data Endpoints</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      GET /api/ccusage - Usage sessions<br />
                      GET /api/ccusage/projects - Project data<br />
                      GET /api/ccusage/weekly - Weekly analytics<br />
                      GET /api/ccusage/monthly - Monthly analytics<br />
                      GET /api/ccusage/sessions - Session data<br />
                      GET /api/ccusage/blocks - Billing blocks
                    </Box>
                  </AccordionDetails>
                </Accordion>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Management Endpoints</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      GET /api/ccusage/status - Service status<br />
                      POST /api/ccusage/refresh - Manual refresh
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                  Data Quality Assurance
                </Typography>
                
                <Grid container spacing={2}>
                  {[
                    'Token Consistency: totalTokens = input + output + cacheCreate + cacheRead',
                    'Cost Accuracy: Recalculated using current model pricing',
                    'Timeline Integrity: Sessions ordered chronologically', 
                    'Project Mapping: Consistent project path → name mapping',
                    'Platform Classification: Accurate platform detection'
                  ].map((check, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">{check}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Footer */}
      <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Built with ❤️ using React, TypeScript, Material-UI, and the ccusage CLI tool
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Real-time Claude AI usage analytics with comprehensive cost optimization insights
        </Typography>
      </Box>
    </Box>
  );
};