#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, copyFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Setting up Analytics Dashboard...\n');

// Function to execute commands and handle errors
function runCommand(command, description) {
  try {
    console.log(`📦 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ Error during ${description}: ${error.message}`);
    process.exit(1);
  }
}

// Check if .env exists in server directory
function setupEnvironment() {
  const envPath = join(__dirname, 'server', '.env');
  const envExamplePath = join(__dirname, 'server', '.env.example');
  
  if (!existsSync(envPath)) {
    if (existsSync(envExamplePath)) {
      console.log('📝 Creating .env file from .env.example...');
      copyFileSync(envExamplePath, envPath);
      console.log('✅ Environment file created\n');
      console.log('⚠️  Please update the MongoDB connection string in server/.env if needed\n');
    } else {
      console.log('📝 Creating default .env file...');
      const defaultEnv = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/analytics-dashboard
NODE_ENV=development`;
      writeFileSync(envPath, defaultEnv);
      console.log('✅ Default environment file created\n');
    }
  } else {
    console.log('✅ Environment file already exists\n');
  }
}

// Main setup process
async function setup() {
  try {
    // Install dependencies
    runCommand('npm install', 'Installing root dependencies');
    runCommand('cd server && npm install', 'Installing server dependencies');
    runCommand('cd client && npm install', 'Installing client dependencies');
    
    // Setup environment
    setupEnvironment();
    
    console.log('🎉 Setup completed successfully!\n');
    console.log('📋 Next steps:');
    console.log('1. Ensure MongoDB is running on your system');
    console.log('2. Run "npm run dev" to start both frontend and backend');
    console.log('3. Open http://localhost:3000 in your browser');
    console.log('4. Click "Seed Data" to populate with sample trading data\n');
    console.log('🔗 Useful commands:');
    console.log('   npm run dev     - Start both frontend and backend');
    console.log('   npm run server  - Start only backend');
    console.log('   npm run client  - Start only frontend');
    console.log('\n📖 Check README.md for detailed instructions');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup(); 