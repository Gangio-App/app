/**
 * Script to fix collection name inconsistencies across the codebase
 * This replaces 'server_members' with 'serverMembers' in all TypeScript files
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Map of old collection names to new ones
const collectionRenames = {
  'server_members': 'serverMembers',
};

// File extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Function to get all files in a directory recursively
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}

// Function to fix collection names in a file
async function fixCollectionNames(filePath) {
  // Only process files with specified extensions
  if (!extensions.some(ext => filePath.endsWith(ext))) {
    return false;
  }

  try {
    // Read file contents
    const content = await readFile(filePath, 'utf8');
    let newContent = content;
    let changed = false;

    // Replace collection names
    for (const [oldName, newName] of Object.entries(collectionRenames)) {
      // Only replace collection names in database operations
      const regex = new RegExp(`(db\\.collection\\(['"]?)${oldName}(['"]?\\))`, 'g');
      if (regex.test(newContent)) {
        newContent = newContent.replace(regex, `$1${newName}$2`);
        changed = true;
      }
    }

    // Save changes if the file was modified
    if (changed) {
      await writeFile(filePath, newContent, 'utf8');
      console.log(`✅ Fixed collection names in: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('Starting collection name fix script...');
    console.log('Looking for files to process...');

    // Get all files in the project
    const files = await getFiles('.');
    console.log(`Found ${files.length} total files to check`);

    // Process each file
    let fixedCount = 0;
    for (const file of files) {
      if (await fixCollectionNames(file)) {
        fixedCount++;
      }
    }

    console.log(`\nCollection name fix complete!`);
    console.log(`Fixed collection names in ${fixedCount} files`);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main(); 