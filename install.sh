#!/bin/bash

# Cursor Task Master Installation Script

echo "Installing Cursor Task Master..."

# Install dependencies
npm install

# Make CLI executable
chmod +x bin/cursor-task.js

# Create npm link
npm link

echo "Installation complete!"
echo "You can now use the 'cursor-task' command in your terminal."
echo ""
echo "To get started, run: cursor-task help"