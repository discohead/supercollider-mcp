# Build Commands - SuperCollider MCP Server

## Primary Build Command

```bash
npm run build
```

### What It Does
1. Executes TypeScript compiler: `tsc`
2. Compiles all `.ts` files in `src/` to `.js` in `build/`
3. Sets executable permissions: `chmod +x ./build/index.js`

### Expected Output
```
$ npm run build

> @makotyo/mcp-supercollider@0.2.0 build
> tsc && chmod +x ./build/index.js
```

## Manual Build Steps

### TypeScript Compilation Only
```bash
npx tsc
```

### Check Types Without Building
```bash
npx tsc --noEmit
```

### Set Executable Permissions
```bash
chmod +x ./build/index.js
```

## Build Configuration

### Source: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## Build Output Structure

```
build/
├── index.js          # Main executable (with shebang)
├── index.d.ts        # TypeScript declarations
├── index.test.js     # Compiled tests
└── index.test.d.ts   # Test declarations
```

## Clean Build

### Remove Build Artifacts
```bash
rm -rf build/
```

### Full Clean Build
```bash
rm -rf build/ && npm run build
```

## Watch Mode (Development)

### Using TypeScript Compiler
```bash
npx tsc --watch
```
*Note: Won't set executable permissions automatically*

### Custom Watch Script
```bash
# Run in separate terminal
while true; do
  npx tsc
  chmod +x ./build/index.js
  sleep 2
done
```

## Build Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Fix: Re-run chmod
   chmod +x ./build/index.js
   ```

2. **TypeScript Errors**
   ```bash
   # Check errors without building
   npx tsc --noEmit
   ```

3. **Module Resolution Issues**
   ```bash
   # Ensure .js extensions in imports
   import { Something } from "./module.js";  # ✓
   import { Something } from "./module";     # ✗
   ```

4. **Shebang Not Preserved**
   - Ensure first line of `src/index.ts` is: `#! /usr/bin/env node`

## Verification

### Check Build Success
```bash
# Should list all files
ls -la build/

# Verify executable
ls -la build/index.js
# Should show: -rwxr-xr-x
```

### Test Execution
```bash
# Direct execution
./build/index.js

# Via node
node build/index.js
```

## CI/CD Build Commands

### For npm publish
```bash
# Clean, build, and verify
rm -rf build/
npm run build
ls -la build/index.js
```

### For Docker
```dockerfile
RUN npm ci --only=production
RUN npm run build
```

## Build Optimization

### Production Build
```bash
# No source maps (not configured in this project)
npx tsc --sourceMap false
```

### Check Bundle Size
```bash
# Check compiled size
du -sh build/
```

## Related Commands

- Test after build: `npm test`
- Run built server: `node build/index.js`
- Package for distribution: `npm pack`