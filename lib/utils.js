const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Constants
const DEFAULT_TASKS_FILE = 'tasks.json';
const DEFAULT_TASKS_DIR = 'tasks';
const DEFAULT_COMPLEXITY_REPORT = 'task-complexity-report.json';
const DEFAULT_SUBTASKS = 5;
const COMPLEXITY_THRESHOLD = 6;

// MCP Tool Registration
// This section registers the utilities as MCP tools that can run without confirmation
const MCP_TOOLS = {
  // Task file management tools
  loadTasks: {
    description: "Load tasks from the tasks.json file",
    parameters: {
      customPath: {
        type: "string",
        description: "Optional custom path to tasks file",
        required: false
      }
    }
  },
  saveTasks: {
    description: "Save tasks to the tasks.json file",
    parameters: {
      tasks: {
        type: "object",
        description: "Tasks object to save",
        required: true
      },
      customPath: {
        type: "string",
        description: "Optional custom path to tasks file",
        required: false
      }
    }
  },
  
  // Task management tools
  getTaskById: {
    description: "Get a task by its ID",
    parameters: {
      tasks: {
        type: "array",
        description: "Array of tasks to search through",
        required: true
      },
      id: {
        type: "string",
        description: "Task ID (can be a subtask ID like '1.2')",
        required: true
      }
    }
  },
  getNextTask: {
    description: "Get the next task to work on based on priority and dependencies",
    parameters: {
      tasks: {
        type: "array",
        description: "Array of tasks to search through",
        required: true
      }
    }
  },
  
  // Utility tools
  formatTask: {
    description: "Format a task into a string representation",
    parameters: {
      task: {
        type: "object", 
        description: "Task object to format",
        required: true
      },
      detailed: {
        type: "boolean",
        description: "Whether to include details",
        required: false
      },
      isSubtask: {
        type: "boolean",
        description: "Whether this is a subtask",
        required: false
      },
      parentId: {
        type: "number",
        description: "Parent task ID if this is a subtask",
        required: false
      }
    }
  },
  areDependenciesSatisfied: {
    description: "Check if a task's dependencies are satisfied",
    parameters: {
      task: {
        type: "object",
        description: "Task object to check",
        required: true
      },
      allTasks: {
        type: "array",
        description: "Array of all tasks",
        required: true
      }
    }
  },
  invokeCursorAgent: {
    description: "Invoke Cursor agent for AI-powered operations",
    parameters: {
      prompt: {
        type: "string",
        description: "Prompt for the Cursor agent",
        required: true
      }
    }
  }
};

/**
 * Get the path to the tasks.json file
 * @param {String} customPath - Custom path to tasks file
 * @returns {String} Path to tasks file
 */
function getTasksFilePath(customPath) {
  if (customPath) {
    return path.resolve(process.cwd(), customPath);
  }
  return path.resolve(process.cwd(), DEFAULT_TASKS_FILE);
}

/**
 * Get the path to the tasks directory
 * @returns {String} Path to tasks directory
 */
function getTasksDir() {
  return path.resolve(process.cwd(), DEFAULT_TASKS_DIR);
}

/**
 * Get the path to the complexity report file
 * @param {String} customPath - Custom path to complexity report
 * @returns {String} Path to complexity report
 */
function getComplexityReportPath(customPath) {
  if (customPath) {
    return path.resolve(process.cwd(), customPath);
  }
  return path.resolve(process.cwd(), DEFAULT_COMPLEXITY_REPORT);
}

/**
 * Load tasks from tasks.json file
 * @param {String} customPath - Custom path to tasks file
 * @returns {Object} Tasks object
 */
async function loadTasks(customPath) {
  const tasksPath = getTasksFilePath(customPath);
  try {
    if (await fs.pathExists(tasksPath)) {
      const tasksData = await fs.readJSON(tasksPath);
      return tasksData;
    }
    return { tasks: [] };
  } catch (error) {
    throw new Error(`Failed to load tasks: ${error.message}`);
  }
}

/**
 * Save tasks to tasks.json file
 * @param {Object} tasks - Tasks object
 * @param {String} customPath - Custom path to tasks file
 */
async function saveTasks(tasks, customPath) {
  const tasksPath = getTasksFilePath(customPath);
  try {
    await fs.writeJSON(tasksPath, tasks, { spaces: 2 });
  } catch (error) {
    throw new Error(`Failed to save tasks: ${error.message}`);
  }
}

/**
 * Get task by ID
 * @param {Array} tasks - Array of tasks
 * @param {String|Number} id - Task ID (can be a subtask ID like "1.2")
 * @returns {Object} Task object and parent task if it's a subtask
 */
function getTaskById(tasks, id) {
  // Check if it's a subtask ID (e.g., "1.2")
  if (id.toString().includes('.')) {
    const [parentId, subtaskId] = id.toString().split('.').map(Number);
    const parentTask = tasks.find(t => t.id === parentId);
    
    if (!parentTask) {
      throw new Error(`Task with ID ${parentId} not found`);
    }
    
    if (!parentTask.subtasks || !parentTask.subtasks[subtaskId - 1]) {
      throw new Error(`Subtask ${subtaskId} of task ${parentId} not found`);
    }
    
    return {
      task: parentTask.subtasks[subtaskId - 1],
      parentTask,
      isSubtask: true,
      subtaskIndex: subtaskId - 1
    };
  }
  
  // Regular task ID
  const numericId = Number(id);
  const task = tasks.find(t => t.id === numericId);
  
  if (!task) {
    throw new Error(`Task with ID ${id} not found`);
  }
  
  return { task, isSubtask: false };
}

/**
 * Format task to string representation
 * @param {Object} task - Task object
 * @param {Boolean} detailed - Whether to include details
 * @param {Boolean} isSubtask - Whether this is a subtask
 * @param {Number} parentId - Parent task ID if this is a subtask
 * @returns {String} Formatted task string
 */
function formatTask(task, detailed = false, isSubtask = false, parentId = null) {
  const chalk = require('chalk');
  
  // Status colors
  const statusColors = {
    'pending': chalk.yellow,
    'in-progress': chalk.blue,
    'done': chalk.green
  };
  
  // Priority colors
  const priorityColors = {
    'low': chalk.gray,
    'medium': chalk.white,
    'high': chalk.red
  };
  
  const status = statusColors[task.status] ? statusColors[task.status](task.status) : task.status;
  const priority = task.priority && priorityColors[task.priority] ? 
    priorityColors[task.priority](task.priority) : 
    (task.priority || 'medium');
  
  let id = isSubtask ? `${parentId}.${task.id}` : task.id;
  let title = task.title || 'Untitled Task';
  
  let output = `${chalk.bold(`[${id}]`)} ${title} (${status}, ${priority})`;
  
  if (detailed) {
    output += '\n';
    
    if (task.dependencies && task.dependencies.length > 0) {
      output += `  ${chalk.dim('Dependencies:')} ${task.dependencies.join(', ')}\n`;
    }
    
    if (task.implementation) {
      output += `  ${chalk.dim('Implementation:')}\n${task.implementation.split('\n').map(line => `    ${line}`).join('\n')}\n`;
    }
    
    if (!isSubtask && task.subtasks && task.subtasks.length > 0) {
      output += `  ${chalk.dim('Subtasks:')}\n`;
      task.subtasks.forEach((subtask, index) => {
        const subtaskStatus = statusColors[subtask.status] ? statusColors[subtask.status](subtask.status) : subtask.status;
        output += `    ${chalk.bold(`[${task.id}.${index + 1}]`)} ${subtask.title} (${subtaskStatus})\n`;
      });
    }
  }
  
  return output;
}

/**
 * Check if a task's dependencies are satisfied
 * @param {Object} task - Task object
 * @param {Array} allTasks - Array of all tasks
 * @returns {Boolean} Whether dependencies are satisfied
 */
function areDependenciesSatisfied(task, allTasks) {
  if (!task.dependencies || task.dependencies.length === 0) {
    return true;
  }
  
  return task.dependencies.every(depId => {
    const dependency = allTasks.find(t => t.id === depId);
    return dependency && dependency.status === 'done';
  });
}

/**
 * Get the next task to work on
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Next task to work on
 */
function getNextTask(tasks) {
  // Filter tasks that are pending or in-progress and have all dependencies satisfied
  const availableTasks = tasks.filter(task => 
    (task.status === 'pending' || task.status === 'in-progress') && 
    areDependenciesSatisfied(task, tasks)
  );
  
  if (availableTasks.length === 0) {
    return null;
  }
  
  // Sort by priority, dependency count, and ID
  const priorityValues = { 'high': 3, 'medium': 2, 'low': 1 };
  
  return availableTasks.sort((a, b) => {
    // First by priority (high to low)
    const aPriority = priorityValues[a.priority] || priorityValues.medium;
    const bPriority = priorityValues[b.priority] || priorityValues.medium;
    
    if (bPriority !== aPriority) {
      return bPriority - aPriority;
    }
    
    // Then by dependency count (fewer first)
    const aDeps = a.dependencies ? a.dependencies.length : 0;
    const bDeps = b.dependencies ? b.dependencies.length : 0;
    
    if (aDeps !== bDeps) {
      return aDeps - bDeps;
    }
    
    // Finally by ID (lower first)
    return a.id - b.id;
  })[0];
}

/**
 * Invoke Cursor agent for AI-powered operations
 * @param {String} prompt - Prompt for the Cursor agent
 * @returns {Promise<String>} Response from Cursor agent
 */
async function invokeCursorAgent(prompt) {
  try {
    // We'll use a placeholder for actually calling the Cursor agent
    // In a real implementation, this would interface with Cursor's API
    // or command palette directly
    
    console.log('Asking Cursor agent:', prompt);
    
    // In a real implementation, we would invoke the Cursor agent here
    // For now, we'll return a placeholder message
    return `[This is where the Cursor agent would respond to: "${prompt}"]`;
  } catch (error) {
    throw new Error(`Failed to invoke Cursor agent: ${error.message}`);
  }
}

module.exports = {
  getTasksFilePath,
  getTasksDir,
  getComplexityReportPath,
  loadTasks,
  saveTasks,
  getTaskById,
  formatTask,
  areDependenciesSatisfied,
  getNextTask,
  invokeCursorAgent,
  DEFAULT_TASKS_FILE,
  DEFAULT_TASKS_DIR,
  DEFAULT_COMPLEXITY_REPORT,
  DEFAULT_SUBTASKS,
  COMPLEXITY_THRESHOLD,
  MCP_TOOLS
};