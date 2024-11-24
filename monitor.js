#!/usr/bin/env node

const chokidar = require('chokidar');
const chalk = require('chalk');
const path = require('path');
const { program } = require('commander');
const simpleGit = require('simple-git');

let changesQueue = new Set();
let isMonitoring = false;

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

async function startMonitoring(targetPath) {
    if (isMonitoring) {
        console.log(chalk.red('Monitoring is already active!'));
        return;
    }

    console.log(chalk.green(` Starting to monitor: ${targetPath}`));
    isMonitoring = true;

    // Initialize git
    const git = simpleGit(targetPath);

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

    // Handle process termination
    process.on('SIGINT', () => {
        console.log(chalk.yellow('\n Stopping monitoring...'));
        watcher.close();
        clearInterval(commitInterval);
        isMonitoring = false;
        process.exit(0);
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
