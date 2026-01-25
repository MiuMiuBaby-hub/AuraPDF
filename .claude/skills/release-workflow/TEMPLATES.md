# Release Workflow Templates

> 版本發布流程所需的各種範本與格式規範

## 📋 目錄

1. [CHANGELOG.md 範本](#changelogmd-範本)
2. [Commit Message 範本](#commit-message-範本)
3. [Git Tag Message 範本](#git-tag-message-範本)
4. [TodoWrite 任務清單範本](#todowrite-任務清單範本)
5. [文件命名規範](#文件命名規範)

---

## CHANGELOG.md 範本

### 完整版本範例（基於 v0.4.0）

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-01-01

### Added
- **候選人筆記與標籤系統**：HR 可在 AI 分析之外添加主觀評價與自定義分類
  - 在候選人詳情頁新增「筆記與標籤」區塊
  - 支援自由文字筆記（可記錄面試評價、溝通歷史等）
  - 支援多個自定義標籤（如「技術強」、「英文佳」、「已邀約」）
  - 編輯模式：切換編輯/檢視狀態，防止誤操作
  - 資料持久化：儲存至 Supabase，重新整理後資料保留

### Changed
- **資料庫 Schema**：candidates 表新增 `notes` (TEXT) 和 `tags` (TEXT[]) 欄位
- **型別定義**：Candidate 型別新增 notes 和 tags 可選欄位

### Technical Details
- 新增 Migration: `scripts/migrations/20260101_add_notes_and_tags.sql`
- 新增服務函式: `updateCandidateData()` in `services/supabaseService.ts`
- UI 元件擴充: `components/CandidateProfile.tsx` 新增筆記編輯區與標籤管理

### Documentation
- 新增實作規格: `docs/specs/IMPL_CANDIDATE_NOTES_TAGS.md`
- 新增測試指南: `docs/testing/TEST_CANDIDATE_NOTES_TAGS.md`
- 新增實作總結: `docs/specs/SUMMARY_CANDIDATE_NOTES_TAGS.md`
- 更新 README.md 使用指南（候選人管理章節）
- 更新 PROJECT_STATUS.md 記錄 v0.4.0 完成狀態

### Migration
- **SQL**: 執行 `scripts/migrations/20260101_add_notes_and_tags.sql`
- **Rollback**: 提供 rollback 步驟（DROP COLUMN）
- **影響範圍**: candidates 表（不影響現有資料）

---

## [0.3.1] - 2025-XX-XX (範例)

### Fixed
- 修正 Gemini API Key 環境變數讀取錯誤
- 增強 Gemini API 錯誤處理與診斷功能

### Changed
- 改進 API 配額錯誤的使用者提示訊息

---

## [Unreleased]

### Planned
- 候選人筆記歷史記錄功能
- 組織級標籤庫與顏色分類
- 批量標籤操作

```

### 新版本區塊範本

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- **[功能名稱]**：功能簡述
  - 子功能 1
  - 子功能 2

### Changed
- **[變更項目]**：變更說明

### Fixed
- 修正 [Bug 描述]

### Technical Details
- 新增/修改的檔案清單
- Migration 或設定變更

### Documentation
- 更新的文件清單

### Migration (如需要)
- **SQL**: 執行步驟
- **Rollback**: 回滾步驟
- **影響範圍**: 說明
```

---

## Commit Message 範本

### 範本 1: 功能開發

```bash
git commit -m "功能：[功能簡述]

- [變更項目 1]
- [變更項目 2]
- [變更項目 3]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**實際範例**：
```bash
git commit -m "功能：新增候選人筆記與標籤系統

- 資料庫新增 notes 與 tags 欄位
- 實作筆記編輯與標籤管理 UI
- 新增 updateCandidateData 服務函式
- 支援編輯模式切換與資料持久化

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 範本 2: 文件更新

```bash
git commit -m "文件：[更新內容簡述]

更新檔案：
- [檔案 1]
- [檔案 2]

變更說明：
- [變更 1]
- [變更 2]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**實際範例**：
```bash
git commit -m "文件：更新至 v0.4.0 版本並記錄筆記標籤功能

更新檔案：
- README.md（新增候選人筆記與標籤使用說明）
- PROJECT_STATUS.md（更新版本至 0.4.0）
- CHANGELOG.md（記錄 v0.4.0 變更）

變更說明：
- 記錄候選人筆記與標籤系統的完整功能
- 更新專案進度與未來規劃

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 範本 3: 版本發布（用於 Tag）

```bash
git commit -m "版本：發布 v[X.Y.Z]

主要變更：
- [變更 1]
- [變更 2]

完整 Changelog 請參考 CHANGELOG.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**實際範例**：
```bash
git commit -m "版本：發布 v0.4.0

主要變更：
- 新增候選人筆記與標籤系統
- 支援自由文字筆記與多標籤管理
- 完整的編輯模式與資料持久化

完整 Changelog 請參考 CHANGELOG.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Commit Message 格式規範

```
[類型]：[簡短摘要（50字元內）]

[可選的詳細說明段落]
- 使用項目符號列舉變更
- 說明為什麼而非什麼

[可選的 Footer]
- 關聯 Issue: Closes #123
- 破壞性變更: BREAKING CHANGE: 說明

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**類型標籤**：
- `功能` - 新增功能
- `修復` - Bug 修復
- `改進` - 功能改進
- `文件` - 文件更新
- `版本` - 版本發布
- `重構` - 程式碼重構
- `測試` - 測試相關

---

## Git Tag Message 範本

### 標準格式

```bash
git tag -a v[X.Y.Z] -m "Release v[X.Y.Z]: [版本主題]

主要變更：
- [變更 1]
- [變更 2]
- [變更 3]

詳細資訊請參考 CHANGELOG.md

發布日期：YYYY-MM-DD"
```

### 實際範例（v0.4.0）

```bash
git tag -a v0.4.0 -m "Release v0.4.0: 候選人筆記與標籤系統

主要變更：
- 新增候選人筆記與標籤管理功能
- 支援自由文字筆記記錄面試評價
- 支援多標籤分類與管理
- 完整的編輯模式與資料持久化

詳細資訊請參考 CHANGELOG.md

發布日期：2026-01-01"
```

### 不同版本類型的範例

**Major 版本（破壞性變更）**：
```bash
git tag -a v2.0.0 -m "Release v2.0.0: 重大架構升級

主要變更：
- 全新的 AI 引擎架構
- 多語言支援（英文/中文）
- BREAKING CHANGE: API 路徑變更

詳細資訊請參考 CHANGELOG.md 與 MIGRATION_GUIDE.md

發布日期：YYYY-MM-DD"
```

**Minor 版本（新功能）**：
```bash
git tag -a v0.5.0 -m "Release v0.5.0: 面試排程功能

主要變更：
- 新增面試行事曆整合
- 候選人可用時段管理
- Email 自動通知

詳細資訊請參考 CHANGELOG.md

發布日期：YYYY-MM-DD"
```

**Patch 版本（修復）**：
```bash
git tag -a v0.4.1 -m "Release v0.4.1: Bug 修復

主要變更：
- 修正標籤重複新增問題
- 修正筆記儲存失敗錯誤處理
- 改進 UI 回饋訊息

詳細資訊請參考 CHANGELOG.md

發布日期：YYYY-MM-DD"
```

---

## TodoWrite 任務清單範本

### 7 階段標準範本

```typescript
[
  {
    content: "完成程式碼實作與 Git 提交",
    activeForm: "完成程式碼實作與 Git 提交中",
    status: "pending"
  },
  {
    content: "撰寫 4 份規格文件（IMPL, MIGRATION, TESTING, SUMMARY）",
    activeForm: "撰寫規格文件中",
    status: "pending"
  },
  {
    content: "執行 Migration 與功能測試",
    activeForm: "執行測試中",
    status: "pending"
  },
  {
    content: "更新專案管理文件（TODO_AND_ROADMAP, PROGRESS_REPORT）",
    activeForm: "更新專案管理文件中",
    status: "pending"
  },
  {
    content: "更新版本發布文件（CHANGELOG, package.json, README, PROJECT_STATUS）",
    activeForm: "更新版本文件中",
    status: "pending"
  },
  {
    content: "建立 Git Tag 並推送至 GitHub",
    activeForm: "建立 Git Tag 中",
    status: "pending"
  },
  {
    content: "驗證發布並更新專案管理狀態",
    activeForm: "驗證發布中",
    status: "pending"
  }
]
```

### 使用範例

```typescript
// Phase 1 完成時
{
  content: "完成程式碼實作與 Git 提交",
  activeForm: "完成程式碼實作與 Git 提交中",
  status: "completed"  // ✅ 標記為完成
}

// Phase 2 進行中
{
  content: "撰寫 4 份規格文件（IMPL, MIGRATION, TESTING, SUMMARY）",
  activeForm: "撰寫規格文件中",
  status: "in_progress"  // 🔄 標記為進行中
}
```

---

## 文件命名規範

### 1. 規格文件（Specs）

**位置**: `docs/specs/`

| 文件類型 | 命名格式 | 範例 |
|---------|---------|------|
| 實作規格 | `IMPL_[功能名稱].md` | `IMPL_CANDIDATE_NOTES_TAGS.md` |
| Migration 文件 | `MIGRATION_[功能名稱].md` | `MIGRATION_CANDIDATE_NOTES_TAGS.md` |
| 測試文件 | `TESTING_[功能名稱].md` | (已整合至 `docs/testing/`) |
| 實作總結 | `SUMMARY_[功能名稱].md` | `SUMMARY_CANDIDATE_NOTES_TAGS.md` |

### 2. 測試文件（Testing）

**位置**: `docs/testing/`

| 文件類型 | 命名格式 | 範例 |
|---------|---------|------|
| 測試計畫 | `TEST_[功能名稱].md` | `TEST_CANDIDATE_NOTES_TAGS.md` |
| 測試樣本 | `[功能]_sample.[ext]` | `candidate_import_sample.txt` |

### 3. 專案管理文件

**位置**: `docs/specs/`

| 文件類型 | 命名格式 | 範例 |
|---------|---------|------|
| 專案狀態 | `PROJECT_STATUS.md` | `PROJECT_STATUS.md` |
| Changelog | `CHANGELOG.md` | `CHANGELOG.md` |
| To-Do 清單 | `TODO_AND_ROADMAP.md` | `TODO_AND_ROADMAP.md` |
| 進度報告 | `PROGRESS_REPORT_YYYYMMDD.md` | `PROGRESS_REPORT_20260101.md` |

### 4. Migration 腳本

**位置**: `scripts/migrations/`

| 類型 | 命名格式 | 範例 |
|-----|---------|------|
| 標準 Migration | `YYYYMMDD_[變更描述].sql` | `20260101_add_notes_and_tags.sql` |
| 修復腳本 | `fix_[問題描述].sql` | `fix_rls_recursion.sql` |

### 5. 功能名稱規範

**命名原則**：
- 使用大寫蛇形命名法（UPPER_SNAKE_CASE）
- 簡潔但具描述性
- 避免縮寫（除非是通用縮寫如 AI, API）

**範例**：
- ✅ `CANDIDATE_NOTES_TAGS` - 清楚、簡潔
- ✅ `JOB_BATCH_IMPORT` - 描述性強
- ❌ `CAND_NT_TG` - 過度縮寫
- ❌ `candidate-notes-and-tags` - 應使用大寫

---

## 版本號碼規範

遵循 [Semantic Versioning 2.0.0](https://semver.org/)

### 格式：`MAJOR.MINOR.PATCH`

- **MAJOR (X.0.0)**: 破壞性變更、不向後相容
  - 範例：API 路徑變更、資料結構重大改變

- **MINOR (0.X.0)**: 新功能、向後相容
  - 範例：新增候選人筆記功能、新增職缺管理

- **PATCH (0.0.X)**: Bug 修復、小改進
  - 範例：修正 API 錯誤、UI 調整

### 特殊版本標記

- **Alpha**: `0.1.0-alpha` - 內部測試版
- **Beta**: `0.1.0-beta` - 公開測試版
- **RC**: `0.1.0-rc.1` - 發布候選版

### TriageHR 版本歷程範例

- `0.1.0` - 初始候選人管理功能
- `0.2.0` - 新增職缺管理
- `0.3.0` - 新增批量匯入
- `0.4.0` - 新增筆記與標籤
- `1.0.0` - 第一個生產就緒版本（未來）

---

## 使用提示

### Commit Message
- 每次提交都應包含 Claude Code 簽名
- 使用中文描述（專案慣例）
- 簡短摘要 < 50 字元
- 詳細說明使用項目符號

### CHANGELOG
- 每個版本必須有發布日期
- 依類別分組（Added, Changed, Fixed, etc.）
- 使用者視角描述（不是技術細節）
- Technical Details 區塊記錄技術變更

### Git Tag
- 使用 annotated tag（`-a` 參數）
- Tag message 包含主要變更摘要
- 必須參考 CHANGELOG.md
- 包含發布日期

### TodoWrite
- 只使用 7 個核心任務
- 一次只有一個任務為 in_progress
- 完成後立即更新狀態
- 任務描述具體可執行

---

**版本**: 1.0.0
**最後更新**: 2026-01-01
**相關文件**: [WORKFLOW.md](./WORKFLOW.md), [CHECKLIST.md](./CHECKLIST.md)
