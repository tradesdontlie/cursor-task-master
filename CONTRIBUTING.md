# Contributing to Cursor Task Master

Thank you for your interest in contributing to Cursor Task Master! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/cursor-task-master.git`
3. Navigate to the project directory: `cd cursor-task-master`
4. Install dependencies: `npm install`
5. Make the CLI executable: `chmod +x bin/cursor-task.js`
6. Create a symlink: `npm link`

## Project Structure

- `bin/` - Contains the CLI executable
- `lib/` - Contains the core functionality
  - `taskManager.js` - Main task management logic
  - `utils.js` - Utility functions and helpers
- `examples/` - Example files for reference
- `tasks/` - Generated task files (git ignored)

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Implement your changes
3. Test your changes thoroughly
4. Commit your changes with a clear message
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a pull request

## Coding Standards

- Use clear, descriptive variable and function names
- Add JSDoc comments for all functions
- Write unit tests for new functionality
- Follow the existing code style and patterns

## Testing

Before submitting a pull request, make sure to test your changes thoroughly:

1. Test all affected commands
2. Check for edge cases and error handling
3. Ensure backward compatibility

## Documentation

When adding new features, please update:

1. The relevant code comments and JSDoc
2. The README.md file if necessary
3. Example files if relevant

## Cursor Agent Integration

When working with the `invokeCursorAgent` function:

1. Use clear, specific prompts
2. Handle the response parsing robustly
3. Include fallbacks for cases where the parsing fails
4. Test with different types of agent responses

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update examples if necessary
3. The PR will be reviewed by maintainers
4. Once approved, the PR will be merged

## License

By contributing to Cursor Task Master, you agree that your contributions will be licensed under the project's MIT license.