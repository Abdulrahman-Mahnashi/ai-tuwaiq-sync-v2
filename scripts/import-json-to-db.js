/**
 * Script to import JSON files to Supabase database
 * Usage: node scripts/import-json-to-db.js <path-to-json-files>
 * 
 * Example: node scripts/import-json-to-db.js ./data/json
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = resolve(__dirname, '../.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️  .env file not found. Using environment variables from system.');
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing Supabase credentials!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Parse JSON file and extract projects
 */
async function parseJSONFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Handle different JSON structures
    if (Array.isArray(data)) {
      return data;
    } else if (data.projects && Array.isArray(data.projects)) {
      return data.projects;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (typeof data === 'object') {
      // Single project object
      return [data];
    }
    
    return [];
  } catch (error) {
    console.error(`❌ Error parsing file ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Normalize project data to match database schema
 */
function normalizeProject(project, fileName = '') {
  // Extract bootcamp from filename if not in project data
  let bootcamp = project.bootcamp || project.bootcamp_name || project.program;
  
  // Try to extract from filename (e.g., "web_dev_projects.json" -> "Web Dev")
  if (!bootcamp && fileName) {
    const nameWithoutExt = fileName.replace(/\.json$/i, '');
    bootcamp = nameWithoutExt
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  return {
    title: project.title || project.name || project.project_title || 'Untitled Project',
    description: project.description || project.desc || project.project_description || '',
    bootcamp: bootcamp || null,
    technologies: Array.isArray(project.technologies) 
      ? project.technologies 
      : Array.isArray(project.tech) 
        ? project.tech 
        : Array.isArray(project.tech_stack)
          ? project.tech_stack
          : project.technologies 
            ? [project.technologies] 
            : [],
    team_members: Array.isArray(project.team_members) 
      ? project.team_members 
      : Array.isArray(project.team) 
        ? project.team 
        : Array.isArray(project.members)
          ? project.members
          : project.team_members 
            ? [project.team_members] 
            : [],
    status: project.status || 'completed',
    keywords: extractKeywords(project),
  };
}

/**
 * Extract keywords from project data
 */
function extractKeywords(project) {
  const keywords = new Set();
  
  // Add technologies
  if (project.technologies) {
    project.technologies.forEach(tech => keywords.add(tech.toLowerCase()));
  }
  if (project.tech) {
    project.tech.forEach(tech => keywords.add(tech.toLowerCase()));
  }
  
  // Extract from title and description
  const text = `${project.title || ''} ${project.description || ''}`.toLowerCase();
  const words = text.match(/\b\w{4,}\b/g) || [];
  words.slice(0, 10).forEach(word => keywords.add(word));
  
  return Array.from(keywords);
}

/**
 * Import projects from JSON files
 */
async function importProjects(jsonFilesPath) {
  try {
    const fullPath = resolve(jsonFilesPath);
    console.log(`\n📁 Reading JSON files from: ${fullPath}\n`);
    
    // Check if directory exists
    try {
      const stats = await stat(fullPath);
      if (!stats.isDirectory()) {
        console.error(`❌ Error: ${fullPath} is not a directory!`);
        return;
      }
    } catch (error) {
      console.error(`❌ Error: Directory ${fullPath} does not exist!`);
      console.error(`   Please create the directory and add your JSON files.`);
      return;
    }
    
    // Read all files in directory
    const files = await readdir(fullPath);
    const jsonFiles = files.filter(file => extname(file).toLowerCase() === '.json');
    
    if (jsonFiles.length === 0) {
      console.log('❌ No JSON files found in the directory!');
      console.log(`   Directory: ${fullPath}`);
      console.log(`   Files found: ${files.length}`);
      return;
    }
    
    console.log(`✅ Found ${jsonFiles.length} JSON files\n`);
    
    let totalProjects = 0;
    let successfulImports = 0;
    let failedImports = 0;
    const errors = [];
    
    // Process each JSON file
    for (const file of jsonFiles) {
      const filePath = join(jsonFilesPath, file);
      console.log(`📄 Processing: ${file}...`);
      
      try {
        const projects = await parseJSONFile(filePath);
        
        if (projects.length === 0) {
          console.log(`   ⚠️  No projects found in ${file}`);
          continue;
        }
        
        console.log(`   📦 Found ${projects.length} project(s)`);
        
        // Normalize and insert projects
        for (const project of projects) {
          try {
            const normalizedProject = normalizeProject(project, file);
            
            // Check if project already exists (by title)
            const { data: existing } = await supabase
              .from('projects')
              .select('id')
              .eq('title', normalizedProject.title)
              .limit(1);
            
            if (existing && existing.length > 0) {
              console.log(`   ⏭️  Skipping duplicate: ${normalizedProject.title}`);
              continue;
            }
            
            // Insert project
            const { error } = await supabase
              .from('projects')
              .insert([normalizedProject]);
            
            if (error) {
              throw error;
            }
            
            successfulImports++;
            totalProjects++;
          } catch (error) {
            failedImports++;
            errors.push({ file, project: project.title || 'Unknown', error: error.message });
            console.log(`   ❌ Error importing project: ${error.message}`);
          }
        }
        
        console.log(`   ✅ Completed: ${file}\n`);
      } catch (error) {
        console.log(`   ❌ Error processing file ${file}: ${error.message}\n`);
        failedImports++;
        errors.push({ file, error: error.message });
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully imported: ${successfulImports} projects`);
    console.log(`❌ Failed imports: ${failedImports}`);
    console.log(`📁 Total files processed: ${jsonFiles.length}`);
    console.log(`📦 Total projects found: ${totalProjects}`);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.file}: ${err.error}`);
      });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Main execution
const jsonFilesPath = process.argv[2] || join(__dirname, '../data/json');

if (!jsonFilesPath) {
  console.error('❌ Error: Please provide path to JSON files directory');
  console.error('Usage: node scripts/import-json-to-db.js <path-to-json-files>');
  process.exit(1);
}

importProjects(jsonFilesPath)
  .then(() => {
    console.log('✅ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });

