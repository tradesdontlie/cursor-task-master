/**
 * Cursor Task Master
 * An AI-powered task management system for Cursor IDE
 */

const taskManager = require('./lib/taskManager');
const utils = require('./lib/utils');

module.exports = {
  ...taskManager,
  utils
};