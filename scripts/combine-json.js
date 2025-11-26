/**
 * Combine multiple JSON files into a single file for local usage.
 * Usage:
 *   node scripts/combine-json.js <source-directory> <output-file>
 *
 * Example:
 *   node scripts/combine-json.js ./data/json ./public/data/projects-local.json
 */

import { promises as fs } from "fs";
import { join, extname, resolve } from "path";

const DEFAULT_SOURCE = "./data/json";
const DEFAULT_OUTPUT = "./public/data/projects-local.json";

const sourceDir = resolve(process.argv[2] || DEFAULT_SOURCE);
const outputFile = resolve(process.argv[3] || DEFAULT_OUTPUT);

async function combineJsonFiles() {
  console.log("📁 Source directory:", sourceDir);
  console.log("💾 Output file:", outputFile);

  try {
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    const jsonFiles = entries
      .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".json")
      .map((entry) => entry.name);

    if (jsonFiles.length === 0) {
      console.error("❌ No JSON files found in the source directory.");
      process.exit(1);
    }

    console.log(`✅ Found ${jsonFiles.length} JSON files. Processing...\n`);

    const combined = [];

    for (const fileName of jsonFiles) {
      const filePath = join(sourceDir, fileName);
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(raw);

        let extracted = [];
        if (Array.isArray(data)) {
          extracted = data;
        } else if (Array.isArray(data?.projects)) {
          extracted = data.projects;
        } else if (Array.isArray(data?.data)) {
          extracted = data.data;
        } else if (typeof data === "object") {
          extracted = [data];
        }

        combined.push(
          ...extracted.map((project) => ({
            ...project,
            _sourceFile: fileName,
          }))
        );

        console.log(`📄 ${fileName} → ${extracted.length} project(s)`);
      } catch (error) {
        console.warn(`⚠️  Failed to process ${fileName}: ${error instanceof Error ? error.message : error}`);
      }
    }

    await fs.mkdir(resolve(outputFile, ".."), { recursive: true });
    await fs.writeFile(outputFile, JSON.stringify(combined, null, 2), "utf-8");

    console.log("\n🎉 Done!");
    console.log(`📦 Total projects combined: ${combined.length}`);
    console.log(`💾 Saved to: ${outputFile}`);
  } catch (error) {
    console.error("❌ Fatal error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

combineJsonFiles();


