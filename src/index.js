/**
 * autocad-dynamic-draw — Skill Package Index
 *
 * This package provides the autocad-dynamic-draw Claude Code skill.
 * The SKILL.md file in the package root contains the full skill definition
 * that Claude Code reads at runtime.
 *
 * Install: npm install -g autocad-dynamic-draw
 * Usage:   /autocad-dynamic-draw 画一个...
 */

const path = require("path");

function getSkillPath() {
  return path.join(__dirname, "..", "SKILL.md");
}

module.exports = { getSkillPath };
