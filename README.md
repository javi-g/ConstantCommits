# Constant Commits

*Read this in other languages: [Español](README.es.md)*

 
## Prerequisites

- Node.js installed
- Git installed and configured
- Git repository initialized and configured with remote

## Installation

1. **Option A: Global installation (recommended)**
```bash
# Clone the repository
git clone https://github.com/javi-g/ConstantCommits.git constant-commits
cd constant-commits

# Install dependencies and link globally
npm install
npm link
```

2. **Option B: Local installation**
```bash
# Clone the repository
git clone https://github.com/javi-g/ConstantCommits.git constant-commits
cd constant-commits

# Install dependencies
npm install
```

## Project Setup

```bash
# 1. Go to project folder
cd my-project

# 2. Initialize git (if not initialized)
git init

# 3. Configure remote repository
git remote add origin YOUR_GIT_URL

# 4. Initial commit
git add .
git commit -m "Initial commit"
git push -u origin master
```

## Usage

### Start monitoring

If installed globally:
```bash
# Monitor current folder
constant-commits start

# Monitor specific folder
constant-commits start "path/to/your/folder"
```

If installed locally:
```bash
node monitor.js start
```

### Available Commands
- `Ctrl+C`: Stop monitoring
- Windows: `Alt+C`: Create manual commit with custom message
- Mac: `Option+C`: Create manual commit with custom message

### Manual Commits
1. Press `Alt+C` (Windows) or `Option+C` (Mac) at any time
2. Enter your commit message when prompted
3. The commit will be created and pushed automatically
4. Automatic monitoring will continue normally

### Stop monitoring
Press `Ctrl+C` in the terminal where the monitor is running.

## Features

- Real-time file change monitoring
- Automatic commits every minute (only when changes occur)
- Complete change capture using `git add .` before each commit
- Support for manual commits with custom message
- Automatic push after each commit
- Automatically ignores:
  - node_modules folders
  - .git folders
  - Hidden files
- Console visual interface showing:
  - Files detected by the monitor
  - Commit timestamps
  - Push status
- Manual commits and push with a custom message with a keyboard shortcut

## Behavior

- Performs `git add .` before each commit to ensure all changes are captured
- Only commits when changes are detected
- Groups changes occurring in the same minute
- Does not interfere with manual commits
- Compatible with any Git server (GitHub, GitLab, Gitea, etc.)
- Respects existing Git configuration

## Usage Recommendations

1. Activate only during active development sessions
2. Verify Git configuration before starting
3. Keep the terminal visible to monitor activity
4. Use Ctrl+C to stop cleanly

## Troubleshooting
I can't get it to work globally on my Mac, but it works fine locally.

If you encounter errors:
1. Verify that Git is installed and configured
2. Confirm that you have access to the remote repository
3. Check that Git credentials are configured
4. Make sure the repository is properly initialized

## Contact

Javi Guembe - [@javiG_en](https://twitter.com/javig_en)

Project Link: https://github.com/javi-g/ConstantCommits

## Attribution

Whatever you want :-) .
