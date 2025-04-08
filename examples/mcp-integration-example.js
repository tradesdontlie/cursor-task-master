/**
 * Example of using Cursor Task Master with MCP integration
 * 
 * This example shows how to register the cursor-task-master tools with MCP
 * and how to use them without requiring manual confirmation for each command.
 */

// Mock MCP instance for demonstration purposes
const mockMCP = {
  registeredTools: {},
  
  registerTool(tool) {
    console.log(`Registering tool: ${tool.name}`);
    this.registeredTools[tool.name] = tool;
  },
  
  async executeTool(toolName, params) {
    const tool = this.registeredTools[toolName];
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }
    
    console.log(`Executing tool: ${toolName}`);
    console.log(`With parameters:`, params);
    
    try {
      const result = await tool.handler(params);
      console.log(`Tool execution result:`, result);
      return result;
    } catch (error) {
      console.error(`Tool execution failed:`, error);
      throw error;
    }
  }
};

// Import the cursor-task-master modules
const { mcpIntegration } = require('../index');

// Register the tools with our mock MCP
mcpIntegration.registerMCPTools(mockMCP);

// Example usage - wrapping in an async function to use await
async function runExamples() {
  console.log('\n--- Example 1: List all tasks ---');
  await mockMCP.executeTool('cursor_task_listTasks', {});
  
  console.log('\n--- Example 2: Show next task ---');
  await mockMCP.executeTool('cursor_task_showNextTask', {});
  
  console.log('\n--- Example 3: Get a specific task ---');
  try {
    // This would typically come from your tasks.json
    await mockMCP.executeTool('cursor_task_showTask', { id: '1' });
  } catch (error) {
    console.log('Task not found - this is expected if you haven\'t initialized your tasks yet');
  }
  
  console.log('\n--- Example 4: Update task status ---');
  try {
    await mockMCP.executeTool('cursor_task_setTaskStatus', { 
      ids: [1], 
      status: 'in-progress' 
    });
  } catch (error) {
    console.log('Failed to update task - this is expected if you haven\'t initialized your tasks yet');
  }
}

// Run the examples
runExamples().catch(error => {
  console.error('Example execution failed:', error);
});

/**
 * In a real Cursor environment with MCP, you would use these tools like this:
 * 
 * 1. First, register the tools when your extension loads:
 *    const { mcpIntegration } = require('cursor-task-master');
 *    mcpIntegration.registerMCPTools(cursorMCP);
 * 
 * 2. Then use them in your code without requiring confirmation:
 *    const tasks = await cursorMCP.executeTool('cursor_task_loadTasks', {});
 *    const nextTask = await cursorMCP.executeTool('cursor_task_getNextTask', { tasks: tasks.tasks });
 *    await cursorMCP.executeTool('cursor_task_setTaskStatus', { ids: [nextTask.id], status: 'in-progress' });
 */