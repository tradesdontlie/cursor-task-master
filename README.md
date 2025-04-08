# Cursor Task Master

An AI-powered task management system that works directly with Cursor IDE, using the built-in Cursor agent for task generation, analysis, and expansion.

## Features

- Parse PRDs into structured tasks with dependencies
- Track task status (pending, in-progress, done)
- Break down complex tasks into subtasks
- Analyze task complexity
- Show the next task to work on based on dependencies
- Update future tasks based on implementation changes
- Generate detailed task files for better organization
- MCP integration for running tasks without confirmation

## MCP Integration

Cursor Task Master can be integrated with MCP (Multi-Command Platform) to allow executing commands without requiring manual confirmation.

### Using MCP Integration

1. First, import and register the tools with MCP:

```javascript
const { mcpIntegration } = require('cursor-task-master');

// Register the tools with MCP
mcpIntegration.registerMCPTools(cursorMCP);
```

2. Then use the tools in your code:

```javascript
// Load tasks without confirmation
const tasksData = await cursorMCP.executeTool('cursor_task_loadTasks', {});

// Get the next task to work on
const nextTask = await cursorMCP.executeTool('cursor_task_getNextTask', { 
  tasks: tasksData.tasks 
});

// Update task status
await cursorMCP.executeTool('cursor_task_setTaskStatus', { 
  ids: [nextTask.id], 
  status: 'in-progress' 
});
```

## Installation

```bash
# Clone the repository
git clone https://github.com/tradesdontlie/cursor-task-master.git

# Install dependencies
cd cursor-task-master
npm install

# Make the CLI executable
npm link
```

## License

MIT