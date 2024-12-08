#!/usr/bin/env node

const chokidar = require('chokidar');
const chalk = require('chalk');
const path = require('path');
const { program } = require('commander');
const simpleGit = require('simple-git');
const readline = require('readline');

let changesQueue = new Set();
let isMonitoring = false;
let git;

// Create readline interface without prompt
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''  // No prompt
});

// Detect platform
const isMac = process.platform === 'darwin';

async function makeCommit(git, changes) {
    try {
        const timestamp = new Date().toISOString();
        console.log(chalk.green(`\n Making commit at ${timestamp}`));
        console.log(chalk.yellow('Changed files:'));
        
        // First do a git add . to catch any changes made outside the watcher
        await git.add('.');
        
        // Also add specific files to ensure they're included and logged
        for (const file of changes) {
            console.log(chalk.blue(`  - ${file}`));
            await git.add(file);
        }

        // Create commit with timestamp and list of files
        const commitMessage = `Auto-commit: ${timestamp}\n\nChanged files:\n${Array.from(changes).join('\n')}`;
        await git.commit(commitMessage);
        
        // Get current branch
        const branchSummary = await git.branch();
        const currentBranch = branchSummary.current;
        
        // Push changes to remote
        console.log(chalk.yellow(`Pushing changes to remote (branch: ${currentBranch})...`));
        await git.push('origin', currentBranch);
        
        console.log(chalk.green(' Commit created and pushed successfully\n'));
    } catch (error) {
        console.error(chalk.red('Error making commit or push:'), error.message);
    }
}

async function makeManualCommit() {
    try {
        // First do a git add .
        console.log(chalk.yellow('\nAdding all changes...'));
        await git.add('.');
        
        // Create a promise to handle the commit message input
        const getCommitMessage = () => new Promise((resolve) => {
            let message = '';
            console.log(chalk.cyan('Enter your commit message (press Enter when done): '));
            
            // Save current stdin settings
            const oldRawMode = process.stdin.isRaw;
            const oldPause = process.stdin.isPaused();
            
            // Configure stdin for our needs
            process.stdin.setRawMode(false);
            if (oldPause) process.stdin.resume();
            
            // Disable stdout temporarily to prevent echo
            const oldWrite = process.stdout.write;
            process.stdout.write = function() {};
            
            process.stdin.once('data', data => {
                // Restore stdout
                process.stdout.write = oldWrite;
                
                message = data.toString().trim();
                console.log(); // Add a newline after input
                
                // Restore stdin to previous state
                process.stdin.setRawMode(oldRawMode);
                if (oldPause) process.stdin.pause();
                resolve(message);
            });
        });

        // Get the commit message
        const message = await getCommitMessage();

        if (message) {
            console.log(chalk.green(`\nCreating manual commit "${message}" ...`));
            await git.commit(message);
            
            // Get current branch
            console.log(chalk.yellow('Getting current branch...'));
            const branchSummary = await git.branch();
            const currentBranch = branchSummary.current;
            
            // Push changes
            console.log(chalk.yellow(`Pushing changes to remote (branch: ${currentBranch})...`));
            try {
                await git.push('origin', currentBranch);
                console.log(chalk.green('Manual commit created and pushed successfully\n'));
            } catch (pushError) {
                console.error(chalk.red('Error pushing changes:'), pushError.message);
                console.error(chalk.yellow('The commit was created but could not be pushed. You may need to push manually.'));
            }
            
            // Clear the changes queue since we just committed everything
            changesQueue.clear();
        } else {
            console.log(chalk.red('\nCommit cancelled - empty message\n'));
        }

        // Ensure we restore raw mode for keyboard shortcuts
        process.stdin.setRawMode(true);
        process.stdin.resume();
    } catch (error) {
        console.error(chalk.red('Error making manual commit:'), error.message);
        // Ensure we restore raw mode even if there's an error
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
}

async function startMonitoring(targetPath) {
    if (isMonitoring) {
        console.log(chalk.red('Monitoring is already active!'));
        return;
    }

    console.log(chalk.green(` Starting to monitor: ${targetPath}`));
    console.log(chalk.blue(` Press ${isMac ? 'Option+C' : 'Alt+C'} to make a manual commit`));
    isMonitoring = true;

    // Initialize git
    git = simpleGit(targetPath);

    // Check if git is initialized
    try {
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            console.log(chalk.yellow('Git repository not initialized. Please initialize it first with:'));
            console.log(chalk.blue(`cd "${targetPath}" && git init && git add . && git commit -m "Initial commit"`));
            process.exit(1);
        }
    } catch (error) {
        console.error(chalk.red('Error checking git repository:'), error.message);
        process.exit(1);
    }

    // Initialize watcher
    const watcher = chokidar.watch(targetPath, {
        ignored: [
            /(^|[\/\\])\../, // ignore dotfiles
            '**/node_modules/**',
            '**/.git/**'
        ],
        persistent: true,
        ignoreInitial: true
    });

    // Add changed files to queue
    watcher
        .on('add', path => {
            console.log(chalk.blue(`File ${path} has been added`));
            changesQueue.add(path);
        })
        .on('change', path => {
            console.log(chalk.yellow(`File ${path} has been modified`));
            changesQueue.add(path);
        })
        .on('unlink', path => {
            console.log(chalk.red(`File ${path} has been removed`));
            changesQueue.add(path);
        });

    // Set up commit interval (every minute)
    const commitInterval = setInterval(async () => {
        if (changesQueue.size > 0) {
            await makeCommit(git, Array.from(changesQueue));
            changesQueue.clear();
        }
    }, 60000);


    // Handle process termination and keyboard shortcuts
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('keypress', async (str, key) => {
        if (key.ctrl && key.name === 'c') {
            console.log(chalk.yellow('\nStopping monitor...'));
            watcher.close();
            clearInterval(commitInterval);
            isMonitoring = false;
            process.exit(0);
        }
        
        const isManualCommitShortcut = isMac
            ? (key.sequence === '©')  // Option+C en Mac
            : (key.sequence === '\x1Bc');  // Alt+C en Windows
    
        if (isManualCommitShortcut) {
            await makeManualCommit();
        }
    });
}

// CLI setup
program
    .version('1.0.0')
    .description('Monitor directory changes and create automatic commits');

program
    .command('start [path]')
    .description('Start monitoring a directory')
    .action((path) => {
        const targetPath = path || process.cwd();
        startMonitoring(targetPath);
    });

program.parse(process.argv);
