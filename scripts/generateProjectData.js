const fs = require('fs');
const path = require('path');

// Read the sessions data
const sessionsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/sample-sessions.json'), 'utf8'));

// Extract project data from sessions
function generateProjectData(sessions) {
  const projects = {};
  
  sessions.forEach(session => {
    // Extract project name from sessionId
    // Format: "D--working-AI-Study-ProjectName"
    const parts = session.sessionId.split('-');
    const projectName = parts.slice(4).join('-') || 'Default Project';
    
    if (!projects[projectName]) {
      projects[projectName] = {
        name: projectName,
        totalSessions: 0,
        totalTokens: 0,
        totalCost: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        lastActive: session.lastActivity,
        models: new Set(),
        platforms: ['web'], // Default since ccusage doesn't track platform
        sessions: []
      };
    }
    
    // Update project metrics
    projects[projectName].totalSessions++;
    projects[projectName].totalTokens += session.totalTokens || 0;
    projects[projectName].totalCost += session.totalCost || 0;
    projects[projectName].inputTokens += session.inputTokens || 0;
    projects[projectName].outputTokens += session.outputTokens || 0;
    projects[projectName].cacheCreationTokens += session.cacheCreationTokens || 0;
    projects[projectName].cacheReadTokens += session.cacheReadTokens || 0;
    
    // Update last active date
    if (session.lastActivity > projects[projectName].lastActive) {
      projects[projectName].lastActive = session.lastActivity;
    }
    
    // Add models
    if (session.modelsUsed) {
      session.modelsUsed.forEach(model => projects[projectName].models.add(model));
    }
    
    // Add session reference
    projects[projectName].sessions.push({
      sessionId: session.sessionId,
      date: session.lastActivity,
      cost: session.totalCost,
      tokens: session.totalTokens
    });
  });
  
  // Convert sets to arrays and format final output
  const projectsArray = Object.values(projects).map(project => ({
    name: project.name,
    totalSessions: project.totalSessions,
    totalTokens: project.totalTokens,
    totalCost: project.totalCost,
    inputTokens: project.inputTokens,
    outputTokens: project.outputTokens,
    cacheCreationTokens: project.cacheCreationTokens,
    cacheReadTokens: project.cacheReadTokens,
    lastActive: project.lastActive,
    models: Array.from(project.models),
    platforms: project.platforms,
    averageCostPerSession: project.totalCost / project.totalSessions,
    averageTokensPerSession: Math.round(project.totalTokens / project.totalSessions)
  }));
  
  // Sort by total cost (descending)
  projectsArray.sort((a, b) => b.totalCost - a.totalCost);
  
  return {
    projects: projectsArray,
    summary: {
      totalProjects: projectsArray.length,
      totalCost: projectsArray.reduce((sum, p) => sum + p.totalCost, 0),
      totalTokens: projectsArray.reduce((sum, p) => sum + p.totalTokens, 0),
      mostExpensiveProject: projectsArray[0]?.name || null,
      mostActiveProject: projectsArray.reduce((max, p) => 
        !max || p.totalSessions > max.totalSessions ? p : max, null
      )?.name || null
    }
  };
}

// Generate project data
const projectData = generateProjectData(sessionsData.sessions);

// Write to file
fs.writeFileSync(
  path.join(__dirname, '../public/sample-projects.json'),
  JSON.stringify(projectData, null, 2),
  'utf8'
);

console.log('Generated project data:');
console.log(`- Total projects: ${projectData.summary.totalProjects}`);
console.log(`- Total cost: $${projectData.summary.totalCost.toFixed(2)}`);
console.log(`- Most expensive: ${projectData.summary.mostExpensiveProject}`);
console.log('Saved to public/sample-projects.json');