const fs = require('fs');
const path = require('path');

// Read the daily data
const dailyData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/sample-daily.json'), 'utf8'));

// Helper function to get week start date (Monday)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay() || 7; // Make Sunday = 7 instead of 0
  if (day !== 1) {
    d.setHours(-24 * (day - 1));
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper function to get month start date
function getMonthStart(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Generate weekly data
function generateWeeklyData(dailyEntries) {
  const weeklyMap = new Map();
  
  dailyEntries.forEach(day => {
    const date = new Date(day.date);
    const weekStart = getWeekStart(date);
    const weekKey = formatDate(weekStart);
    
    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        week: weekKey,
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        modelsUsed: new Set(),
        modelBreakdowns: new Map()
      });
    }
    
    const week = weeklyMap.get(weekKey);
    week.inputTokens += day.inputTokens || 0;
    week.outputTokens += day.outputTokens || 0;
    week.cacheCreationTokens += day.cacheCreationTokens || 0;
    week.cacheReadTokens += day.cacheReadTokens || 0;
    week.totalTokens += day.totalTokens || 0;
    week.totalCost += day.totalCost || 0;
    
    // Add models
    day.modelsUsed.forEach(model => week.modelsUsed.add(model));
    
    // Aggregate model breakdowns
    day.modelBreakdowns.forEach(breakdown => {
      const existing = week.modelBreakdowns.get(breakdown.modelName) || {
        modelName: breakdown.modelName,
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        cost: 0
      };
      
      existing.inputTokens += breakdown.inputTokens || 0;
      existing.outputTokens += breakdown.outputTokens || 0;
      existing.cacheCreationTokens += breakdown.cacheCreationTokens || 0;
      existing.cacheReadTokens += breakdown.cacheReadTokens || 0;
      existing.cost += breakdown.cost || 0;
      
      week.modelBreakdowns.set(breakdown.modelName, existing);
    });
  });
  
  // Convert to array format
  return Array.from(weeklyMap.values())
    .map(week => ({
      week: week.week,
      inputTokens: week.inputTokens,
      outputTokens: week.outputTokens,
      cacheCreationTokens: week.cacheCreationTokens,
      cacheReadTokens: week.cacheReadTokens,
      totalTokens: week.totalTokens,
      totalCost: week.totalCost,
      modelsUsed: Array.from(week.modelsUsed),
      modelBreakdowns: Array.from(week.modelBreakdowns.values())
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

// Generate monthly data
function generateMonthlyData(dailyEntries) {
  const monthlyMap = new Map();
  
  dailyEntries.forEach(day => {
    const date = new Date(day.date);
    const monthStart = getMonthStart(date);
    const monthKey = formatDate(monthStart);
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthKey,
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        modelsUsed: new Set(),
        modelBreakdowns: new Map()
      });
    }
    
    const month = monthlyMap.get(monthKey);
    month.inputTokens += day.inputTokens || 0;
    month.outputTokens += day.outputTokens || 0;
    month.cacheCreationTokens += day.cacheCreationTokens || 0;
    month.cacheReadTokens += day.cacheReadTokens || 0;
    month.totalTokens += day.totalTokens || 0;
    month.totalCost += day.totalCost || 0;
    
    // Add models
    day.modelsUsed.forEach(model => month.modelsUsed.add(model));
    
    // Aggregate model breakdowns
    day.modelBreakdowns.forEach(breakdown => {
      const existing = month.modelBreakdowns.get(breakdown.modelName) || {
        modelName: breakdown.modelName,
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        cost: 0
      };
      
      existing.inputTokens += breakdown.inputTokens || 0;
      existing.outputTokens += breakdown.outputTokens || 0;
      existing.cacheCreationTokens += breakdown.cacheCreationTokens || 0;
      existing.cacheReadTokens += breakdown.cacheReadTokens || 0;
      existing.cost += breakdown.cost || 0;
      
      month.modelBreakdowns.set(breakdown.modelName, existing);
    });
  });
  
  // Convert to array format
  return Array.from(monthlyMap.values())
    .map(month => ({
      month: month.month,
      inputTokens: month.inputTokens,
      outputTokens: month.outputTokens,
      cacheCreationTokens: month.cacheCreationTokens,
      cacheReadTokens: month.cacheReadTokens,
      totalTokens: month.totalTokens,
      totalCost: month.totalCost,
      modelsUsed: Array.from(month.modelsUsed),
      modelBreakdowns: Array.from(month.modelBreakdowns.values())
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Generate the data
const weeklyData = generateWeeklyData(dailyData.daily);
const monthlyData = generateMonthlyData(dailyData.daily);

// Create formatted output
const weeklyOutput = {
  weekly: weeklyData
};

const monthlyOutput = {
  monthly: monthlyData
};

// Write files
fs.writeFileSync(
  path.join(__dirname, '../public/sample-weekly.json'),
  JSON.stringify(weeklyOutput, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(__dirname, '../public/sample-monthly.json'),
  JSON.stringify(monthlyOutput, null, 2),
  'utf8'
);

console.log('Generated weekly and monthly data:');
console.log(`- Weekly entries: ${weeklyData.length}`);
console.log(`- Monthly entries: ${monthlyData.length}`);
console.log(`- Total weekly cost: $${weeklyData.reduce((sum, w) => sum + w.totalCost, 0).toFixed(2)}`);
console.log(`- Total monthly cost: $${monthlyData.reduce((sum, m) => sum + m.totalCost, 0).toFixed(2)}`);
console.log('Saved to public/sample-weekly.json and public/sample-monthly.json');