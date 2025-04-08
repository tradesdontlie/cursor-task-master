/**
 * MCP Tools Integration for cursor-task-master
 * 
 * This file integrates the cursor-task-master utility functions
 * with MCP (Multi-Command Platform) to allow them to run without 
 * requiring manual confirmation for each command.
 */

const { MCP_TOOLS, ...utils } = require('./utils');
const taskManager = require('./taskManager');

/**
 * Registers tools with MCP
 * @param {Object} mcp - MCP instance to register tools with
 */
function registerMCPTools(mcp) {
  if (!mcp || typeof mcp.registerTool !== 'function') {
    console.error('Invalid MCP instance provided for tool registration');
    return;
  }

  // Register basic utility tools
  Object.entries(MCP_TOOLS).forEach(([name, config]) => {
    mcp.registerTool({
      name: `cursor_task_${name}`,
      description: config.description,
      parameters: config.parameters,
      handler: async (params) => {
        try {
          return await utils[name](...Object.values(params));
        } catch (error) {
          console.error(`Error executing ${name}:`, error);
          throw error;
        }
      }
    });
  });

  // Register task management commands
  const taskManagerCommands = {
    listTasks: {
      description: "List all tasks with optional filtering",
      parameters: {
        status: {
          type: "string",
          description: "Filter tasks by status (pending, in-progress, done)",
          required: false
        },
        withSubtasks: {
          type: "boolean",
          description: "Include subtasks in the list",
          required: false
        }
      }
    },
    showNextTask: {
      description: "Show the next task to work on based on dependencies and status",
      parameters: {}
    },
    showTask: {
      description: "Show details of a specific task",
      parameters: {
        id: {
          type: "string", 
          description: "Task ID to show",
          required: true
        }
      }
    },
    setTaskStatus: {
      description: "Set status of a task or multiple tasks",
      parameters: {
        ids: {
          type: "array",
          description: "Task IDs to update",
          required: true
        },
        status: {
          type: "string",
          description: "Status to set (pending, in-progress, done)",
          required: true
        }
      }
    },
    expandTasks: {
      description: "Expand a task with subtasks",
      parameters: {
        options: {
          type: "object",
          description: "Options for task expansion",
          required: true
        }
      }
    }
  };

  // Register taskManager commands
  Object.entries(taskManagerCommands).forEach(([name, config]) => {
    mcp.registerTool({
      name: `cursor_task_${name}`,
      description: config.description,
      parameters: config.parameters,
      handler: async (params) => {
        try {
          return await taskManager[name](...Object.values(params));
        } catch (error) {
          console.error(`Error executing ${name}:`, error);
          throw error;
        }
      }
    });
  });

  console.log('Cursor Task Master tools registered with MCP');
}

module.exports = {
  registerMCPTools
};