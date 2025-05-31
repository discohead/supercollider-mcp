#!/bin/bash
# Wrapper script to ensure proper Node.js path

# Source NVM to get the right Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use the correct Node.js version
exec /Users/jaredmcfarland/.nvm/versions/node/v22.16.0/bin/node /Users/jaredmcfarland/Developer/supercollider-mcp/build/index.js