#!/usr/bin/env node
/**
 * autocad-dynamic-draw — CLI launcher
 * Usage: npx autocad-dynamic-draw [options]
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const SKILL_DIR = path.join(__dirname, "..");

function printBanner() {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   AutoCAD Dynamic Draw v1.0.0           ║
  ║   Enterprise COM-driven CAD drafting    ║
  ╚══════════════════════════════════════════╝
  `);
}

function checkEnv() {
  console.log("[check] Running environment checks...\n");

  // Check Windows
  if (process.platform !== "win32") {
    console.log(
      "✗ This skill requires Windows + AutoCAD. Current platform: " +
        process.platform,
    );
    process.exit(1);
  }
  console.log("✓ Windows detected");

  // Check Python
  try {
    const pyVer = execSync("python --version", { encoding: "utf8" }).trim();
    console.log(`✓ ${pyVer}`);
  } catch {
    console.log(
      "✗ Python not found. Install Python 3.8+ from https://python.org",
    );
    process.exit(1);
  }

  // Run the Python test script
  const testScript = path.join(SKILL_DIR, "scripts", "test_connection.py");
  if (fs.existsSync(testScript)) {
    try {
      execSync(`python "${testScript}"`, { encoding: "utf8", stdio: "inherit" });
    } catch {
      console.log("\n✗ Environment check failed. See errors above.");
      process.exit(1);
    }
  }
}

function showHelp() {
  console.log(`
Usage:
  autocad-dynamic-draw              Run environment check
  autocad-dynamic-draw --help       Show this help
  autocad-dynamic-draw --skill      Print skill path for manual import

Trigger phrases for Claude Code:
  - "AutoCAD 动态绘制"
  - "逐步画图"
  - "演示画图过程"
  - "在 AutoCAD 中一笔一笔画"
  - "让 Claude Code 在 AutoCAD 里画"
  - "/autocad-dynamic-draw"

Documentation: https://github.com/js2005happy/autocad-dynamic-draw
`);
}

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  printBanner();
  showHelp();
} else if (args.includes("--skill")) {
  const skillPath = path.join(SKILL_DIR, "SKILL.md");
  console.log(skillPath);
} else {
  printBanner();
  checkEnv();
  console.log("\n✅ Environment ready. Trigger the skill in Claude Code to begin drawing.\n");
}
