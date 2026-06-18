# Skill: AutoCAD 动态绘图 (autocad-dynamic-draw)

## 1. 概述
此技能使 Claude Code 能够通过 COM 接口接管本机已打开的 AutoCAD 应用程序，并按照用户指定的图形规格与演示顺序，**逐图元、分步骤**在 AutoCAD 模型空间中完成绘制。每一步绘图操作后均插入可配置的停顿延时，让操作人员能实时观察整个绘图过程，适用于设计评审、培训演示、工艺说明、操作跟图等企业正式场景。

## 2. 适用条件 (触发规则)
当用户输入中包含以下**任一**关键词或短语时，自动激活本技能：
- "AutoCAD 动态绘制"
- "逐步画图"
- "演示画图过程"
- "在 AutoCAD 中一笔一笔画"
- "让 Claude Code 在 AutoCAD 里画"
- 或用户显式调用："使用 autocad-dynamic-draw 技能"

## 3. 环境准入检查 (必须全部通过才可执行)
执行任何绘图操作前，Claude Code **必须逐项验证**以下条件，并将检查结果明确告知用户：

| 检查项 | 判定标准 | 未通过时的动作 |
|--------|----------|----------------|
| 操作系统 | Windows 10/11 | 提示：AutoCAD COM 接口仅支持 Windows，当前无法执行。 |
| Python 版本 | Python 3.8 及以上 | 提示安装或切换 Python 版本。 |
| `pyautocad` 库 | 可成功 `import pyautocad` | 自动执行 `pip install pyautocad` 并记录到日志。 |
| AutoCAD 运行状态 | `pyautocad.Autocad()` 连接成功且存在 `ActiveDocument` | 提示用户打开 AutoCAD 并新建或打开一个图纸后重试。 |
| COM 支持 | 连接不报"COM"相关异常 | 指导用户在 AutoCAD 命令行输入 `(vl-load-com)` 并回车，然后重试。 |

全部通过后输出："✅ 环境检查通过，准备开始动态绘图。"

## 4. 配置参数 (可在用户指令中覆盖)
用户在请求中可以显式指定以下任一参数，未指定时使用默认值：

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `step_delay` | float | 0.8 | 每个绘图步骤后的暂停时间（秒），可设为 0~5。 |
| `log_path` | string | `./autocad_draw_log.txt` | 操作日志输出路径，相对或绝对路径。 |
| `backup_before_draw` | boolean | true | 是否在绘图前备份当前 DWG 文件。 |
| `layer_name` | string | `CLAUDE_DRAW` | 专门用于本次绘图的图层名（如不存在则创建）。 |
| `line_weight` | float | 0.25 | 默认线宽（毫米）。 |
| `color_by_layer` | boolean | true | 是否强制颜色设为 ByLayer。 |
| `text_style` | string | `Standard` | 标注文字样式（需要时）。 |

**参数设置示例**：
> 用 AutoCAD 动态绘制一个法兰，延时设为 1.2 秒，图层用 "DEMO_LAYER"，不备份。

## 5. 标准执行流程 (SOP)

### 5.1 需求解析
从用户输入中提取以下信息，若无法提取则主动询问用户确认：
- **图形类型**：如矩形、圆、多边形、法兰、轴、螺栓、基板等。
- **几何参数**：所有尺寸、半径、角度、数量、间距、阵列方式等。
- **位置基准**：插入点、对齐方式、坐标原点等（未指定时默认原点 `(0,0)`）。
- **图元绘制顺序**：若用户未指定，按工程设计规范自动排列：`基准中心线 → 主体轮廓 → 内部特征（如孔、槽）→ 工艺特征（如倒角、圆角）→ 剖面线/标注（可选）`。
- **特殊线型/颜色要求**：如中心线红色点画线、轮廓白色实线等。

### 5.2 脚本生成
Claude Code 必须生成一个**独立可执行**的 Python 脚本文件，命名规则：
```
autocad_draw_<YYYYMMDD_HHMMSS>.py
```

该脚本必须包含以下结构：

1. **文件头注释**：包含生成时间、用户原始需求摘要、参数配置。
2. **依赖检查**：尝试导入 `pyautocad`, `time`, `sys`, `logging`，失败则提示并退出。
3. **日志配置**：使用 `logging` 模块，同时输出到控制台和 `log_path` 文件，格式为：`[时间戳] - [级别] - 步骤描述`
4. **连接重试机制**：
```python
for attempt in range(1, 4):
    try:
        acad = Autocad(create_if_not_exists=True)
        doc = acad.doc
        break
    except Exception as e:
        if attempt == 3: raise
        time.sleep(2)
```
5. **备份操作**（若 backup_before_draw 为 True）：
```python
backup_path = f"backup_{timestamp}.dwg"
doc.SaveAs(backup_path)
logger.info(f"备份已保存至: {backup_path}")
```
6. **图层准备**：检查或创建目标图层，并设置为当前图层。
7. **逐步绘图核心**：
   - 每一个几何图元（一条线、一个圆、一段弧等）为一个步骤。
   - 每个步骤前后写入日志（logger.info），包含图元类型和关键坐标。
   - 每个步骤调用 AutoCAD COM 接口（如 AddLine, AddCircle, AddArc 等）。
   - 每个步骤执行后调用 `time.sleep(step_delay)`。
8. **异常处理**：
   - 所有绘图操作包裹在 `try...except` 中。
   - 异常发生后记录错误信息，尝试保存当前文档，然后优雅退出，不关闭 AutoCAD。
9. **完成收尾**：
   - 执行 `doc.Save()` 保存最终图纸。
   - 输出总结日志（总图元数、总耗时、备份路径等）。

**代码安全约束**：脚本中严禁出现 `eval()`, `exec()`, `os.system()`, `subprocess` 调用（除日志外），所有坐标必须来自用户输入或确定性算法。

### 5.3 安全审查
脚本生成后，Claude Code 需对脚本执行静态审查，确认：
- 无恶意系统调用。
- 所有文件操作路径均在项目目录或用户指定安全位置。
- 不会修改图纸中非指定图层的对象。
- 日志中已记录数据来源。

### 5.4 执行与监控
1. 保存脚本文件。
2. 在终端中执行 `python autocad_draw_<timestamp>.py`。
3. 实时捕获标准输出和错误输出并展示给用户。
4. 若脚本返回非零退出码，立即报告错误阶段及日志位置，保留 AutoCAD 现场。

### 5.5 结果确认
执行成功结束后，Claude Code 应向用户报告：
- 绘制图元总数。
- 总耗时。
- 备份文件路径（如有）。
- 日志文件路径。
- 询问："是否需要在 AutoCAD 中继续添加标注或进行其他修改？"

## 6. 详细错误处理预案
| 异常现象 | 可能原因 | 恢复动作 |
|----------|----------|----------|
| pyautocad 连接超时 | AutoCAD 未运行或 COM 未加载 | 提示用户启动 AutoCAD，并执行 `(vl-load-com)` |
| COMError: (0x80020009) | 绘图操作参数无效 | 检查坐标范围、数值类型，修正后重试 |
| 权限不足 | 日志文件或备份路径不可写 | 更换路径为用户目录或 temp |
| AutoCAD 崩溃 | 图形过于复杂或软件不稳定 | 日志已记录最后成功步骤，重启 AutoCAD 后可从该步骤继续 |
| 用户中断 (Ctrl+C) | 人为取消 | 脚本捕获信号，尝试保存当前文档后退出 |

## 7. 详细示例

### 示例 1：基础矩形带圆角
用户指令：

> 用 AutoCAD 动态绘制一个 100x50 的矩形，左下角在原点，四个角 R5，延时 1 秒。

Claude Code 执行过程：环境检查通过 → 生成脚本 → 顺序绘制底边→右边→顶边→左边→各角圆角弧。每个图元后停顿 1 秒。总图元 8 个，耗时 9.2 秒。

### 示例 2：法兰盘主视图
用户指令：

> 用 AutoCAD 动态绘制一个法兰盘主视图：外圆 φ200，内孔 φ80，节圆 φ150 上均布 6 个 φ12 的通孔，不备份，延时 0.6 秒。

Claude Code 执行过程：环境检查通过 → 绘制中心线→外圆→内圆→节圆（虚线）→按角度逐个绘制小圆。总图元 10 个，耗时约 7 秒。

## 8. 使用方式
1. 将本文件保存为 `.claude/skills/autocad-dynamic-draw.md`（项目级）或 `~/.claude/skills/autocad-dynamic-draw.md`（全局）。
2. 确保你的 AutoCAD 已打开且有一个活动图纸。
3. 在 Claude Code 会话中输入包含触发关键词的命令，或直接说：

> 使用 autocad-dynamic-draw 技能，画一个……

## 9. 企业定制建议
- 根据公司 CAD 标准修改 `layer_name`、线宽、颜色等默认值。
- 可以在第 5.1 节中增加参数化模板路径，支持从 JSON 或 YAML 文件读取批量绘图任务。
- 安全要求更高的环境，可将脚本生成与执行分离，生成脚本后由人工审批再执行。

## 10. 附录：依赖安装命令
```bash
pip install pyautocad
```
（Claude Code 在环境检查阶段会自动执行此命令，若权限不足会提示手动安装）

---
版本: 1.0 (企业版)
最后更新: 2026-06-19
适用平台: Windows + AutoCAD 完整版（非 LT） + Claude Code
