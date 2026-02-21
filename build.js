import fs from 'node:fs';
import path from 'node:path';


const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});


const configPath = path.join(process.cwd(), 'ai-config.js');
let configContent = fs.readFileSync(configPath, 'utf-8');


configContent = configContent.replace(
  "'your-openai-api-key-here'",
  `'${envVars.OPENAI_API_KEY}'`
);

// Write to dist folder
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

// Copy all files to dist
const files = fs.readdirSync(process.cwd());
files.forEach(file => {
  const stat = fs.statSync(file);
  if (stat.isFile() && !file.startsWith('.') && file !== 'build.js' && file !== 'package.json') {
    if (file === 'ai-config.js') {
      fs.writeFileSync(path.join(distPath, file), configContent);
    } else {
      fs.copyFileSync(file, path.join(distPath, file));
    }
  } else if (stat.isDirectory() && !['node_modules', 'dist', '.git', '.vscode'].includes(file)) {
    const destDir = path.join(distPath, file);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const subFiles = fs.readdirSync(file);
    subFiles.forEach(subFile => {
      fs.copyFileSync(path.join(file, subFile), path.join(destDir, subFile));
    });
  }
});

console.log('✓ Build complete! Extension ready in ./dist folder');
console.log('Load the ./dist folder in Chrome to test your extension');
