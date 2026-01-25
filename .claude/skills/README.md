# SmartGantt - Claude Code Skills

> 為 SmartGantt 專案打造的可重複使用自動化 Skills

## 📚 Skills 總覽

SmartGantt 專案包含以下 Claude Code Skills，用於自動化常見的開發工作流程：

| Skill | 描述 | 版本 | 文件 |
|-------|------|------|------|
| **organize-docs** | 組織專案文件和腳本到結構化目錄 | v1.0 | [README](./organize-docs/README.md) |
| **release-workflow** | 完整的版本發布流程自動化（6 階段） | v1.0 | [README](./release-workflow/README.md) |

---

## 🎯 Quick Start

### Skill 1: organize-docs

**何時使用**：當你需要整理散亂的文件和腳本時

**觸發方式**：
```
「幫我組織專案文件結構」
「整理 docs 和 scripts 目錄」
```

**功能**：
- 建立標準化目錄結構（`docs/`, `scripts/` 及子目錄）
- 使用 `git mv` 移動文件（保留歷史）
- 自動更新文件路徑參照
- 建立導航索引文件
- 文件組織記錄

**產出**：
```
docs/
├── README.md              # 文件導航
├── guides/                # 使用指南
├── specs/                 # 規格文件
└── testing/               # 測試資源
    └── samples/

scripts/
├── README.md              # 腳本說明
├── setup/                 # 初始化腳本
├── migrations/            # 資料庫遷移
├── seed/                  # 測試數據
└── utilities/             # 工具腳本
```

**參考文件**：
- [完整使用指南](./organize-docs/README.md)
- [實際案例](./organize-docs/EXAMPLES.md)
- [技術規格](./organize-docs/SKILL.md)

---

### Skill 2: release-workflow

**何時使用**：當你完成功能開發，準備發布新版本時

**觸發方式**：
```
「功能開發完成，準備發布 v0.5.0」
「執行版本發布流程」
```

**功能**：
- 6 階段標準化發布流程（開發 → 文件 → 測試 → 管理 → 發布 → 追蹤）
- 自動建立 TodoWrite 任務清單追蹤進度
- 完整的文件範本（Commit, CHANGELOG, Git Tag）
- 15 項核心檢查清單確保品質
- 版本一致性驗證

**6 階段流程**：
1. **Phase 1**: 程式碼開發 - 實作功能並 Git 提交
2. **Phase 2**: 文件撰寫 - 4 份規格文件（IMPL, MIGRATION, TESTING, SUMMARY）
3. **Phase 3**: 測試與驗收 - Migration 執行、功能測試
4. **Phase 4**: 專案管理文件 - TODO_AND_ROADMAP, PROGRESS_REPORT
5. **Phase 5**: 版本發布 - CHANGELOG, package.json, README, PROJECT_STATUS
6. **Phase 6**: Git 操作 - Git Tag 建立與推送

**產出文件**：
- 規格文件：`IMPL_*.md`, `MIGRATION_*.md`, `TEST_*.md`, `SUMMARY_*.md`
- 專案管理：`TODO_AND_ROADMAP.md`, `PROGRESS_REPORT_*.md`
- 版本記錄：更新 `CHANGELOG.md`, `package.json`, `README.md`, `PROJECT_STATUS.md`
- Git Tag：`v[X.Y.Z]` 帶完整 Tag Message

**參考文件**：
- [快速開始指南](./release-workflow/README.md)
- [6 階段 SOP](./release-workflow/WORKFLOW.md)
- [範本集合](./release-workflow/TEMPLATES.md)
- [檢查清單](./release-workflow/CHECKLIST.md)

---

## 🔧 Skills 開發指南

### Skill 檔案結構

每個 Skill 應包含以下檔案：

```
.claude/skills/[skill-name]/
├── SKILL.md          # 必須：Skill 定義（名稱、描述、觸發條件、allowed-tools）
├── README.md         # 必須：使用說明和快速開始
├── [其他文件].md     # 選用：依 Skill 複雜度增加
```

### SKILL.md 格式規範

```markdown
---
name: skill-name
description: Brief description of what this skill does
allowed-tools: Read, Write, Bash(ls:*), etc.
---

# Skill Name

## When to Use
[觸發條件說明]

## How It Works
[執行流程說明]

## Examples
[使用範例]
```

### 命名規範

- **Skill 目錄名稱**：小寫、連字號分隔（例如：`organize-docs`）
- **SKILL.md 中的 name**：與目錄名稱一致
- **description**：簡短、清楚描述用途（一句話）

### allowed-tools 說明

限制 Skill 只能使用特定工具，提高安全性：

```yaml
allowed-tools: Read, Glob, Grep, Bash(mkdir:*), Bash(git mv:*), Edit, Write, TodoWrite
```

常用工具：
- `Read` - 讀取檔案
- `Write` - 寫入檔案
- `Edit` - 編輯檔案
- `Glob` - 檔案搜尋
- `Grep` - 內容搜尋
- `Bash(command:*)` - 受限的 Bash 命令
- `TodoWrite` - 任務清單管理

---

## 📝 Skills 使用最佳實踐

### 1. 明確觸發條件

在對話中使用清楚的關鍵字觸發 Skills：

✅ **好的觸發方式**：
- "幫我組織專案文件" → 觸發 `organize-docs`
- "準備發布 v0.5.0" → 觸發 `release-workflow`

❌ **不明確的觸發方式**：
- "整理一下" → 可能無法觸發
- "做一些工作" → 太模糊

### 2. 利用 TodoWrite 追蹤進度

Skills 會自動使用 TodoWrite 建立任務清單：

```javascript
[
  {content: "建立目錄結構", activeForm: "建立目錄結構中", status: "in_progress"},
  {content: "移動檔案", activeForm: "移動檔案中", status: "pending"},
  // ...
]
```

好處：
- 隨時了解進度
- 防止遺漏步驟
- 清楚的進度回饋

### 3. 參考範本避免格式錯誤

使用 Skill 提供的範本（如 `TEMPLATES.md`）：
- Commit Message 範本
- CHANGELOG 版本區塊範本
- Git Tag Message 範本

### 4. 驗證清單確保完整

使用 Skill 的檢查清單（如 `CHECKLIST.md`）：
- 發布前逐項確認
- 避免遺漏更新
- 確保版本一致性

---

## 🛠️ Skill 依賴關係

### release-workflow → organize-docs

`release-workflow` 的 Phase 2（文件撰寫）和 Phase 4（專案管理文件）階段可能需要使用 `organize-docs` 來整理文件結構。

**使用方式**：
```
# 在 release-workflow 執行中
「Phase 2 完成後，幫我組織 docs 目錄」
```

---

## 📊 Skills 版本歷史

### v1.0.0 (2026-01-01)

**新增 Skills**：
- ✨ `organize-docs` - 文件組織自動化
- ✨ `release-workflow` - 版本發布流程自動化

**設計原則**：
- 基於 SmartGantt 實際開發經驗
- 遵循 Claude Code Skills 規範
- 可重複使用、易於維護
- 完整的文件和範例

---

## 🔗 相關資源

### Claude Code 文件
- [Claude Code 官方文件](https://docs.anthropic.com/claude/docs)
- [Skills 開發指南](https://docs.anthropic.com/claude/docs/skills)

### SmartGantt 專案文件
- [README.md](../../README.md) - 專案主文件
- [PROJECT_STATUS.md](../../docs/specs/PROJECT_STATUS.md) - 專案狀態
- [CHANGELOG.md](../../docs/specs/CHANGELOG.md) - 版本記錄

### 外部規範參考
- [Keep a Changelog](https://keepachangelog.com/) - CHANGELOG 格式
- [Semantic Versioning](https://semver.org/) - 版本號規範
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit 規範

---

## 💡 貢獻與改進

### 如何改進現有 Skill

1. **識別改進點**：使用過程中發現的問題或可優化之處
2. **更新文件**：修改對應的 `.md` 文件
3. **測試驗證**：確保改進後 Skill 仍正常運作
4. **版本記錄**：在 Skill 的 README.md 中記錄版本歷史

### 如何新增 Skill

1. **建立目錄**：`.claude/skills/[new-skill-name]/`
2. **建立必要檔案**：
   - `SKILL.md` - Skill 定義
   - `README.md` - 使用說明
   - 其他支援文件（依需求）
3. **更新此索引**：在本文件中新增 Skill 說明
4. **測試驗證**：確保 Skill 可正確觸發和執行

---

## 📞 支援與回饋

如果在使用 Skills 時遇到問題：

1. **查看 Skill 文件**：每個 Skill 的 README.md 有詳細說明
2. **檢查 SKILL.md**：了解觸發條件和 allowed-tools
3. **參考範例**：EXAMPLES.md 或 TEMPLATES.md 有實際案例
4. **記錄問題**：在專案管理文件中記錄問題與解決方案

---

**維護者**：Claude Sonnet 4.5
**最後更新**：2026-01-02
**Skills 版本**：v1.0.0
**專案**：SmartGantt (TriageHR)
