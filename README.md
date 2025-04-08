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

## Getting Started

Initialize a new task management system in your project:

```bash
# Initialize with an empty task list
cursor-task init

# Or initialize from a PRD file
cursor-task init -p path/to/prd.txt
```

## Usage

### List Tasks

```bash
# List all tasks
cursor-task list

# List tasks with a specific status
cursor-task list --status=pending
cursor-task list --status=in-progress
cursor-task list --status=done

# List tasks with subtasks
cursor-task list --with-subtasks

# List tasks with a specific status and include subtasks
cursor-task list --status=pending --with-subtasks
```

### Show Next Task

```bash
# Show the next task to work on based on dependencies and status
cursor-task next
```

### Show Specific Task

```bash
# Show details of a specific task
cursor-task show 1

# View a specific subtask (e.g., subtask 2 of task 1)
cursor-task show 1.2
```

### Update Tasks

```bash
# Update tasks from a specific ID and provide context
cursor-task update --from=1 --prompt="I decided to use Redux for state management"
```

### Generate Task Files

```bash
# Generate individual task files from tasks.json
cursor-task generate
```

### Set Task Status

```bash
# Set status of a single task
cursor-task set-status --id=1 --status=in-progress

# Set status for multiple tasks
cursor-task set-status --id=1,2,3 --status=done

# Set status for subtasks
cursor-task set-status --id=1.1,1.2 --status=done
```

### Expand Tasks

```bash
# Expand a specific task with subtasks
cursor-task expand --id=1 --num=5

# Expand with additional context
cursor-task expand --id=1 --prompt="This UI component needs to handle various states"

# Expand all pending tasks
cursor-task expand --all

# Force regeneration of subtasks for tasks that already have them
cursor-task expand --all --force
```

### Clear Subtasks

```bash
# Clear subtasks from a specific task
cursor-task clear-subtasks --id=1

# Clear subtasks from multiple tasks
cursor-task clear-subtasks --id=1,2,3

# Clear subtasks from all tasks
cursor-task clear-subtasks --all
```

### Analyze Task Complexity

```bash
# Analyze complexity of all tasks
cursor-task analyze-complexity

# Save report to a custom location
cursor-task analyze-complexity --output=my-report.json

# Set a custom complexity threshold (1-10)
cursor-task analyze-complexity --threshold=6

# Use an alternative tasks file
cursor-task analyze-complexity --file=custom-tasks.json
```

### View Complexity Report

```bash
# Display the task complexity analysis report
cursor-task complexity-report

# View a report at a custom location
cursor-task complexity-report --file=my-report.json
```

### Add a New Task

```bash
# Add a new task
cursor-task add-task --prompt="Description of the new task"

# Add a task with dependencies
cursor-task add-task --prompt="Description" --dependencies=1,2,3

# Add a task with priority
cursor-task add-task --prompt="Description" --priority=high
```

## How It Works

Cursor Task Master uses the Cursor IDE's built-in AI agent to power its functionality. When you run commands that require AI assistance, like task generation, complexity analysis, or task expansion, the system interfaces with the Cursor agent to provide intelligent responses.

The system maintains a `tasks.json` file in your project directory to track task metadata, and generates individual Markdown files for each task in a `tasks` directory for easy reference.

## Best Practices

1. **Start with a detailed PRD**: The more detailed your PRD, the better the generated tasks will be.
2. **Review generated tasks**: After parsing the PRD, review the tasks to ensure they make sense and have appropriate dependencies.
3. **Analyze task complexity**: Use the complexity analysis feature to identify which tasks should be broken down further.
4. **Follow the dependency chain**: Always respect task dependencies to ensure a smooth development flow.
5. **Update as you go**: If your implementation diverges from the plan, use the update command to keep future tasks aligned with your current approach.
6. **Break down complex tasks**: Use the expand command to break down complex tasks into manageable subtasks.

## Example Cursor AI Interactions

```
I've just initialized a new project with Cursor Task Master.
I have a PRD at scripts/prd.txt. Can you help me parse it and set up the initial tasks?
```

```
I'd like to implement task 4. Can you help me understand what needs to be done and how to approach it?
```

```
I've finished implementing the authentication system described in task 2.
All tests are passing. Please mark it as complete and tell me what I should work on next.
```

## License

MIT