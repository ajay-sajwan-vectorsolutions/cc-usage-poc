export interface UsageSession {
  sessionId: string;
  timestamp: string;
  platform: 'vscode' | 'web' | 'api';
  model: string;
  
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  sessionDuration: number;
  projectName: string;
  
  vscodeData?: VSCodeData;
  webData?: WebData;
}

export interface VSCodeData {
  projectPath: string;
  projectName?: string;
  programmingLanguage: string;
  filesModified: number;
  codeGenerated: boolean;
  linesAdded: number;
  linesDeleted: number;
  commandUsed?: string;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
}

export interface WebData {
  conversationLength: number;
  artifactsCreated: number;
  contentType: 'code' | 'analysis' | 'creative' | 'general' | 'research';
  filesUploaded: number;
  features: string[];
}

export interface DashboardMetrics {
  totalSessions: number;
  totalTokens: number;
  totalCost: number;
  averageSessionDuration: number;
  mostUsedPlatform: 'vscode' | 'web' | 'api';
  todayUsage: {
    sessions: number;
    tokens: number;
    cost: number;
  };
  weeklyUsage: {
    sessions: number;
    tokens: number;
    cost: number;
  };
  monthlyUsage: {
    sessions: number;
    tokens: number;
    cost: number;
  };
}

export interface PlatformMetrics {
  platform: 'vscode' | 'web' | 'api';
  sessions: number;
  totalTokens: number;
  totalCost: number;
  averageSessionDuration: number;
  percentageOfTotal: number;
}

export interface TimeSeriesData {
  date: string;
  sessions: number;
  tokens: number;
  cost: number;
  vscodeTokens: number;
  webTokens: number;
}

export interface CostBreakdown {
  model: string;
  sessions: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
}

export interface ProjectData {
  name: string;
  totalSessions: number;
  totalTokens: number;
  totalCost: number;
  lastActive: string;
  models: string[];
  platforms: Array<'web' | 'vscode' | 'api'>;
}

export interface ProjectMetrics {
  name: string;
  path: string;
  sessions: number;
  totalTokens: number;
  totalCost: number;
  averageSessionDuration: number;
  percentageOfTotal: number;
  lastActivityDate: string;
}

export interface WeeklyData {
  week: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  totalCost: number;
  modelsUsed: string[];
  modelBreakdowns: ModelBreakdown[];
}

export interface MonthlyData {
  month: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  totalCost: number;
  modelsUsed: string[];
  modelBreakdowns: ModelBreakdown[];
}

export interface SessionData {
  sessionId: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  totalCost: number;
  lastActivity: string;
  modelsUsed: string[];
  modelBreakdowns: ModelBreakdown[];
  projectPath: string;
}

export interface BillingBlock {
  id: string;
  startTime: string;
  endTime: string;
  actualEndTime: string | null;
  isActive: boolean;
  isGap: boolean;
  entries: number;
  tokenCounts: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationInputTokens: number;
    cacheReadInputTokens: number;
  };
  totalTokens: number;
  costUSD: number;
  models: string[];
  burnRate: number | null;
  projection: number | null;
}

export interface ModelBreakdown {
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  cost: number;
}

export interface CacheAnalytics {
  totalCacheCreationTokens: number;
  totalCacheReadTokens: number;
  cacheHitRate: number;
  cacheSavings: number;
  cacheEfficiency: number;
}

export interface Settings {
  costPerMillionInputTokens: {
    'claude-3-opus': number;
    'claude-3-sonnet': number;
    'claude-3-haiku': number;
    'claude-2': number;
    'claude-instant': number;
  };
  costPerMillionOutputTokens: {
    'claude-3-opus': number;
    'claude-3-sonnet': number;
    'claude-3-haiku': number;
    'claude-2': number;
    'claude-instant': number;
  };
  autoCollectEnabled: boolean;
  vscodeMonitoringEnabled: boolean;
  webMonitoringEnabled: boolean;
  dataRetentionDays: number;
  refreshInterval: number;
}