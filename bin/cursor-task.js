#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const taskManager = require('../lib/taskManager');
const { getTasksFilePath } = require('../lib/utils');

// Set up the CLI program
program
  .name('cursor-task')
  .description('AI-powered task management system for Cursor IDE')
  .version('0.1.0');

// Initialize command - creates initial task structure
program
  .command('init')
  .description('Initialize task management in the current project')
  .option('-p, --prd <path>', 'Path to PRD file to parse for initial tasks')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Initializing task management system...'));
      await taskManager.initializeTaskSystem(options.prd);
      console.log(chalk.green('Task management system initialized successfully!'));
    } catch (error) {
      console.error(chalk.red(`Error initializing task system: ${error.message}`));
      process.exit(1);
    }
  });

// List tasks command
program
  .command('list')
  .description('List all tasks')
  .option('-s, --status <status>', 'Filter tasks by status (pending, in-progress, done)')
  .option('-w, --with-subtasks', 'Include subtasks in the list')
  .action(async (options) => {
    try {
      await taskManager.listTasks(options);
    } catch (error) {
      console.error(chalk.red(`Error listing tasks: ${error.message}`));
      process.exit(1);
    }
  });

// Show next task command
program
  .command('next')
  .description('Show the next task to work on based on dependencies and status')
  .action(async () => {
    try {
      await taskManager.showNextTask();
    } catch (error) {
      console.error(chalk.red(`Error showing next task: ${error.message}`));
      process.exit(1);
    }
  });

// Show specific task command
program
  .command('show')
  .description('Show details of a specific task')
  .argument('<id>', 'Task ID to show')
  .action(async (id) => {
    try {
      await taskManager.showTask(id);
    } catch (error) {
      console.error(chalk.red(`Error showing task: ${error.message}`));
      process.exit(1);
    }
  });

// Update tasks command
program
  .command('update')
  .description('Update tasks based on implementation changes')
  .requiredOption('--from <id>', 'Task ID to update from')
  .requiredOption('--prompt <prompt>', 'Context about the implementation changes')
  .action(async (options) => {
    try {
      await taskManager.updateTasks(options.from, options.prompt);
    } catch (error) {
      console.error(chalk.red(`Error updating tasks: ${error.message}`));
      process.exit(1);
    }
  });

// Generate task files command
program
  .command('generate')
  .description('Generate individual task files from tasks.json')
  .action(async () => {
    try {
      await taskManager.generateTaskFiles();
    } catch (error) {
      console.error(chalk.red(`Error generating task files: ${error.message}`));
      process.exit(1);
    }
  });

// Set task status command
program
  .command('set-status')
  .description('Set status of a task or multiple tasks')
  .requiredOption('--id <ids>', 'Task IDs (comma-separated for multiple)')
  .requiredOption('--status <status>', 'Status to set (pending, in-progress, done)')
  .action(async (options) => {
    try {
      const ids = options.id.split(',');
      await taskManager.setTaskStatus(ids, options.status);
    } catch (error) {
      console.error(chalk.red(`Error setting task status: ${error.message}`));
      process.exit(1);
    }
  });

// Expand tasks command
program
  .command('expand')
  .description('Expand a task with subtasks')
  .option('--id <id>', 'Task ID to expand')
  .option('--num <number>', 'Number of subtasks to generate')
  .option('--prompt <context>', 'Additional context for expansion')
  .option('--all', 'Expand all pending tasks')
  .option('--force', 'Force regeneration of subtasks')
  .action(async (options) => {
    try {
      await taskManager.expandTasks(options);
    } catch (error) {
      console.error(chalk.red(`Error expanding tasks: ${error.message}`));
      process.exit(1);
    }
  });

// Clear subtasks command
program
  .command('clear-subtasks')
  .description('Clear subtasks from tasks')
  .option('--id <ids>', 'Task IDs (comma-separated for multiple)')
  .option('--all', 'Clear subtasks from all tasks')
  .action(async (options) => {
    try {
      if (options.all) {
        await taskManager.clearAllSubtasks();
      } else if (options.id) {
        const ids = options.id.split(',');
        await taskManager.clearSubtasks(ids);
      } else {
        console.error(chalk.red('Either --id or --all option is required'));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`Error clearing subtasks: ${error.message}`));
      process.exit(1);
    }
  });

// Add new task command
program
  .command('add-task')
  .description('Add a new task')
  .requiredOption('--prompt <description>', 'Description of the new task')
  .option('--dependencies <ids>', 'Comma-separated list of task IDs this task depends on')
  .option('--priority <priority>', 'Task priority (low, medium, high)')
  .action(async (options) => {
    try {
      const dependencies = options.dependencies ? options.dependencies.split(',').map(Number) : [];
      await taskManager.addTask(options.prompt, dependencies, options.priority);
    } catch (error) {
      console.error(chalk.red(`Error adding task: ${error.message}`));
      process.exit(1);
    }
  });

// Analyze task complexity command
program
  .command('analyze-complexity')
  .description('Analyze complexity of tasks')
  .option('--output <path>', 'Path to save the complexity report')
  .option('--threshold <number>', 'Complexity threshold (1-10)', '6')
  .option('--file <path>', 'Path to tasks file')
  .action(async (options) => {
    try {
      await taskManager.analyzeComplexity(options);
    } catch (error) {
      console.error(chalk.red(`Error analyzing complexity: ${error.message}`));
      process.exit(1);
    }
  });

// View complexity report command
program
  .command('complexity-report')
  .description('Display the task complexity analysis report')
  .option('--file <path>', 'Path to complexity report file')
  .action(async (options) => {
    try {
      await taskManager.showComplexityReport(options.file);
    } catch (error) {
      console.error(chalk.red(`Error showing complexity report: ${error.message}`));
      process.exit(1);
    }
  });

// Add dependency command
program
  .command('add-dependency')
  .description('Add a dependency to a task')
  .requiredOption('--id <id>', 'Task ID to add dependency to')
  .requiredOption('--depends-on <id>', 'Task ID this task depends on')
  .action(async (options) => {
    try {
      await taskManager.addDependency(options.id, options.dependsOn);
    } catch (error) {
      console.error(chalk.red(`Error adding dependency: ${error.message}`));
      process.exit(1);
    }
  });

// Remove dependency command
program
  .command('remove-dependency')
  .description('Remove a dependency from a task')
  .requiredOption('--id <id>', 'Task ID to remove dependency from')
  .requiredOption('--depends-on <id>', 'Task ID to remove from dependencies')
  .action(async (options) => {
    try {
      await taskManager.removeDependency(options.id, options.dependsOn);
    } catch (error) {
      console.error(chalk.red(`Error removing dependency: ${error.message}`));
      process.exit(1);
    }
  });

// Validate dependencies command
program
  .command('validate-dependencies')
  .description('Validate task dependencies')
  .action(async () => {
    try {
      await taskManager.validateDependencies();
    } catch (error) {
      console.error(chalk.red(`Error validating dependencies: ${error.message}`));
      process.exit(1);
    }
  });

// Fix dependencies command
program
  .command('fix-dependencies')
  .description('Find and fix invalid dependencies')
  .action(async () => {
    try {
      await taskManager.fixDependencies();
    } catch (error) {
      console.error(chalk.red(`Error fixing dependencies: ${error.message}`));
      process.exit(1);
    }
  });

// Parse the command line arguments
program.parse(process.argv);

// If no arguments are provided, display help
if (process.argv.length === 2) {
  program.help();
}