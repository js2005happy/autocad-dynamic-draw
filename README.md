# AutoCAD Dynamic Draw — Claude Code Skill

[![npm version](https://img.shields.io/npm/v/autocad-dynamic-draw.svg)](https://www.npmjs.com/package/autocad-dynamic-draw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Windows](https://img.shields.io/badge/platform-Windows-blue.svg)]()

**Enterprise-grade AutoCAD dynamic drawing skill for Claude Code & Codex.**  
Step-by-step COM-driven drafting with real-time visualization. Ideal for design reviews, training demos, process documentation, and on-screen walkthroughs.

## Quick Install

```bash
npx skills add js2005happy/autocad-dynamic-draw --skill autocad-dynamic-draw
```

Or via npm:

```bash
npm install -g autocad-dynamic-draw
```

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Windows | 10/11 |
| AutoCAD (full, not LT) | 2000+ |
| Python | 3.8+ |
| pyautocad | latest |
| Claude Code / Codex | latest |

```bash
pip install pyautocad
```

## Usage

1. **Start AutoCAD** and open or create a drawing.
2. In Claude Code, use any trigger phrase:

```
使用 AutoCAD 动态绘制一个 100x100 的正方形，左下角在原点，四角 R10，延时 0.8 秒
```

Or explicitly:

```
/autocad-dynamic-draw 画一个法兰盘，外圆 φ200，内孔 φ80，步长 1 秒
```

## Features

- **Step-by-step visual drafting** — every entity drawn with configurable delay
- **Auto layer management** — `CLAUDE_DRAW` layer by default (customizable)
- **Auto backup** — saves DWG snapshot before each session
- **Structured logging** — timestamped log of every operation
- **Error recovery** — graceful failure handling, preserves AutoCAD state
- **Safety sandbox** — no `eval()`, `exec()`, `os.system()` in generated scripts

## Configurable Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `step_delay` | `0.8` | Pause between draw steps (seconds) |
| `backup_before_draw` | `true` | Backup DWG before drawing |
| `layer_name` | `CLAUDE_DRAW` | Target layer name |
| `line_weight` | `0.25` | Default line weight (mm) |
| `text_style` | `Standard` | Annotation text style |

Override any parameter inline:

> 用 AutoCAD 动态绘制法兰，图层用 "FLANGE_V1"，延时 1.5 秒，不备份

## Supported Entities

- **Primitives**: Line, Circle, Arc, Rectangle, Polygon, Point
- **Text**: Single-line, Multi-line, Dimensions
- **Structures**: Walls, Doors, Windows, Rooms, Columns
- **Mechanical**: Flanges, Shafts, Bolts, Gears, Holes (circular/rectangular patterns)
- **Annotations**: Leaders, Hatches, Centerlines

## Enterprise Customization

- Adjust defaults in `SKILL.md` §4 for company CAD standards
- Add parametric templates (JSON/YAML) for batch jobs
- Air-gapped mode: script generation → human review → execution

## License

MIT © 2026 [js2005happy](https://github.com/js2005happy)
