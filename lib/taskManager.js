/**
 * Task Manager for Cursor Task Master
 * Handles all task-related operations including:
 * - Task initialization
 * - Task listing, updating, and status management
 * - Task expansion and dependency management
 * - Task complexity analysis
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');
const { 
  getTasksFilePath, 
  ensureTasksDirectory, 
  formatTask, 
  getTaskById,
  sortTasksByDependencies,
  createTableFromTasks
} = require('./utils');

/**
 * Initialize the task management system
 * @param {string} prdPath - Optional path to PRD file to parse
 */
async function initializeTaskSystem(prdPath) {
  try {
    await ensureTasksDirectory();
    const tasksPath = getTasksFilePath();

    // Create initial tasks structure
    const initialTasks = {
      tasks: [],
      metadata: {
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    // If a PRD is provided, parse it for initial tasks
    if (prdPath && fs.existsSync(prdPath)) {
      console.log(chalk.blue(`Parsing PRD file: ${prdPath}`));
      const prdContent = await fs.readFile(prdPath, 'utf8');
      
      // Simple initial parsing logic - would be expanded with AI integration
      const requirements = prdContent
        .split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map(line => line.trim().substring(2));
      
      // Create a task for each requirement
      requirements.forEach((req, index) => {
        initialTasks.tasks.push({
          id: index + 1,
          title: req,
          description: `Implement: ${req}`,
          status: 'pending',
          priority: 'medium',
          complexity: null,
          dependencies: [],
          subtasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      
      console.log(chalk.green(`Created ${initialTasks.tasks.length} tasks from PRD`));
    } else {
      // Create an empty tasks file if no PRD
      console.log(chalk.yellow('No PRD provided. Creating empty tasks file.'));
    }

    // Write initial tasks file
    await fs.writeJson(tasksPath, initialTasks, { spaces: 2 });
    console.log(chalk.green(`Tasks file created at: ${tasksPath}`));
    
    return initialTasks;
  } catch (error) {
    console.error(chalk.red(`Error initializing task system: ${error.message}`));
    throw error;
  }
}

/**
 * List all tasks with optional filtering
 * @param {Object} options - List options (status filter, include subtasks)
 */
async function listTasks(options = {}) {
  try {
    const tasksPath = getTasksFilePath();
    
    if (!fs.existsSync(tasksPath)) {
      console.error(chalk.red('Tasks file not found. Run "cursor-task init" first.'));
      return;
    }
    
    const tasksData = await fs.readJson(tasksPath);
    let tasks = tasksData.tasks || [];
    
    // Filter by status if specified
    if (options.status) {
      tasks = tasks.filter(task => task.status === options.status);
    }
    
    if (tasks.length === 0) {
      console.log(chalk.yellow('No tasks found matching the criteria.'));
      return;
    }
    
    // Format and display tasks
    console.log(chalk.blue('\nTask List:'));
    
    const formattedTasks = tasks.map(task => {
      const taskInfo = {
        ID: task.id,
        Title: task.title.substring(0, 40) + (task.title.length > 40 ? '...' : ''),
        Status: task.status,
        Priority: task.priority || 'medium',
        Dependencies: task.dependencies.join(', ') || 'None'
      };
      
      // Show subtasks if requested and they exist
      if (options.withSubtasks && task.subtasks && task.subtasks.length > 0) {
        console.log(chalk.green(`\n${task.id}. ${task.title} [${task.status}]`));
        
        task.subtasks.forEach((subtask, index) => {
          const prefix = subtask.status === 'done' ? '✓' : ' ';
          console.log(chalk.dim(`   ${prefix} ${subtask.id}: ${subtask.title} [${subtask.status}]`));
        });
        
        return null; // Return null to exclude from table
      }
      
      return taskInfo;
    }).filter(Boolean); // Filter out nulls
    
    // Only create table if we have tasks to display and we're not showing subtasks
    if (formattedTasks.length > 0 && !options.withSubtasks) {
      const table = createTableFromTasks(formattedTasks);
      console.log(table.toString());
    }
    
    // Display summary
    console.log(chalk.blue(`\nTotal: ${tasks.length} task(s)`));
    
  } catch (error) {
    console.error(chalk.red(`Error listing tasks: ${error.message}`));
    throw error;
  }
}

/**
 * Show the next task to work on based on dependencies and status
 */
async function showNextTask() {
  try {
    const tasksPath = getTasksFilePath();
    
    if (!fs.existsSync(tasksPath)) {
      console.error(chalk.red('Tasks file not found. Run "cursor-task init" first.'));
      return;
    }
    
    const tasksData = await fs.readJson(tasksPath);
    const tasks = tasksData.tasks || [];
    
    // Find pending tasks
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    
    if (pendingTasks.length === 0) {
      console.log(chalk.green('All tasks are complete or in progress! 🎉'));
      return;
    }
    
    // Sort tasks by dependencies to find the next available task
    const sortedTasks = sortTasksByDependencies(pendingTasks, tasks);
    
    // Find the first task with all dependencies met
    let nextTask = null;
    for (const task of sortedTasks) {
      const dependencies = task.dependencies || [];
      const allDependenciesMet = dependencies.every(dependencyId => {
        const dependency = tasks.find(t => t.id === dependencyId);
        return dependency && dependency.status === 'done';
      });
      
      if (allDependenciesMet) {
        nextTask = task;
        break;
      }
    }
    
    if (nextTask) {
      console.log(chalk.green('\nNext task to work on:'));
      console.log(formatTask(nextTask, tasks));
    } else {
      console.log(chalk.yellow('\nNo available tasks found. All pending tasks have unmet dependencies.'));
      
      // Show blocked tasks
      console.log(chalk.yellow('\nBlocked tasks:'));
      sortedTasks.slice(0, 3).forEach(task => {
        console.log(chalk.dim(formatTask(task, tasks)));
        
        // Show missing dependencies
        const missingDeps = task.dependencies.filter(depId => {
          const dependency = tasks.find(t => t.id === depId);
          return dependency && dependency.status !== 'done';
        });
        
        if (missingDeps.length > 0) {
          console.log(chalk.red('  Waiting on:'));
          missingDeps.forEach(depId => {
            const dependency = tasks.find(t => t.id === depId);
            if (dependency) {
              console.log(chalk.red(`  - ${dependency.id}: ${dependency.title} [${dependency.status}]`));
            }
          });
        }
      });
    }
  } catch (error) {
    console.error(chalk.red(`Error showing next task: ${error.message}`));
    throw error;
  }
}

/**
 * Show details of a specific task
 * @param {number|string} taskId - ID of the task to show
 */
async function showTask(taskId) {
  try {
    const tasksPath = getTasksFilePath();
    
    if (!fs.existsSync(tasksPath)) {
      console.error(chalk.red('Tasks file not found. Run "cursor-task init" first.'));
      return;
    }
    
    const tasksData = await fs.readJson(tasksPath);
    const tasks = tasksData.tasks || [];
    
    // Convert string ID to number if needed
    const id = parseInt(taskId, 10);
    
    const task = getTaskById(id, tasks);
    
    if (!task) {
      console.error(chalk.red(`Task with ID ${id} not found.`));
      return;
    }
    
    console.log(formatTask(task, tasks));
    
    // Show subtasks if any
    if (task.subtasks && task.subtasks.length > 0) {
      console.log(chalk.blue('\nSubtasks:'));
      
      task.subtasks.forEach(subtask => {
        const statusColor = subtask.status === 'done' ? chalk.green : 
                           subtask.status === 'in-progress' ? chalk.yellow : chalk.dim;
        console.log(statusColor(`- ${subtask.id}: ${subtask.title} [${subtask.status}]`));
      });
    }
    
  } catch (error) {
    console.error(chalk.red(`Error showing task: ${error.message}`));
    throw error;
  }
}

/**
 * Set the status of a task or multiple tasks
 * @param {Array<number|string>} taskIds - Array of task IDs to update
 * @param {string} status - New status (pending, in-progress, done)
 */
async function setTaskStatus(taskIds, status) {
  try {
    const tasksPath = getTasksFilePath();
    
    if (!fs.existsSync(tasksPath)) {
      console.error(chalk.red('Tasks file not found. Run "cursor-task init" first.'));
      return;
    }
    
    const tasksData = await fs.readJson(tasksPath);
    const tasks = tasksData.tasks || [];
    
    // Validate status
    const validStatuses = ['pending', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
      console.error(chalk.red(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`));
      return;
    }
    
    // Convert string IDs to numbers
    const ids = taskIds.map(id => parseInt(id, 10));
    
    let updated = 0;
    
    // Update each task
    tasks.forEach(task => {
      if (ids.includes(task.id)) {
        task.status = status;
        task.updatedAt = new Date().toISOString();
        updated++;
      }
    });
    
    if (updated === 0) {
      console.error(chalk.red(`No tasks found with IDs: ${ids.join(', ')}`));
      return;
    }
    
    // Update metadata
    tasksData.metadata.lastUpdated = new Date().toISOString();
    
    // Write updated tasks back to file
    await fs.writeJson(tasksPath, tasksData, { spaces: 2 });
    
    console.log(chalk.green(`Updated ${updated} task(s) to status: ${status}`));
    
  } catch (error) {
    console.error(chalk.red(`Error setting task status: ${error.message}`));
    throw error;
  }
}

// Additional functions would be implemented here:
// - updateTasks
// - generateTaskFiles
// - expandTasks
// - clearSubtasks
// - addTask
// - analyzeComplexity
// - showComplexityReport 
// - addDependency
// - removeDependency
// - validateDependencies
// - fixDependencies

module.exports = {
  initializeTaskSystem,
  listTasks,
  showNextTask,
  showTask,
  setTaskStatus
  // Other functions would be exported here
};