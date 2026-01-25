# Release Workflow Checklists

> 快速驗證清單，確保版本發布的每個環節都完成

## 📋 目錄

1. [核心 15 項檢查清單](#核心-15-項檢查清單)
2. [分階段檢查清單](#分階段檢查清單)
3. [快速驗證清單](#快速驗證清單)
4. [常見問題排查](#常見問題排查)

---

## 核心 15 項檢查清單

> 適用於所有版本發布，依序完成即可確保品質

### Phase 1: 程式碼開發 ✅

- [ ] **1.1** 需求分析完成，明確功能範圍
- [ ] **1.2** 程式碼實作完成（Database, Services, UI）
- [ ] **1.3** Git Commit 已提交，使用標準格式

### Phase 2: 文件撰寫 ✅

- [ ] **2.1** `IMPL_[功能].md` 已完成（規格文件）
- [ ] **2.2** `MIGRATION_[功能].md` 已完成（如需 Migration）
- [ ] **2.3** `TEST_[功能].md` 已完成（測試計畫）
- [ ] **2.4** `SUMMARY_[功能].md` 已完成（實作總結）

### Phase 3: 測試與驗收 ✅

- [ ] **3.1** Migration 已執行並驗證成功
- [ ] **3.2** 功能測試通過（依 TEST 文件執行）
- [ ] **3.3** 規格文件已更新（加入測試結果）

### Phase 4: 專案管理文件 ✅

- [ ] **4.1** `TODO_AND_ROADMAP.md` 已更新
- [ ] **4.2** `PROGRESS_REPORT_YYYYMMDD.md` 已建立

### Phase 5: 版本發布 ✅

- [ ] **5.1** `CHANGELOG.md` 已更新（新增版本區塊）
- [ ] **5.2** `package.json` 版本號已更新
- [ ] **5.3** `README.md` 版本與功能說明已更新
- [ ] **5.4** `PROJECT_STATUS.md` 已更新至新版本

### Phase 6: Git 操作 ✅

- [ ] **6.1** Git Tag 已建立並推送（`v[X.Y.Z]`）
- [ ] **6.2** 所有變更已推送至 GitHub

---

## 分階段檢查清單

### Phase 1: 程式碼開發

#### 需求分析
- [ ] 功能需求明確定義
- [ ] 技術方案已確認（資料庫設計、UI 設計）
- [ ] 影響範圍已評估（現有功能、資料庫、API）

#### 程式碼實作
- [ ] **資料庫層**：Migration SQL 已撰寫
- [ ] **型別定義**：TypeScript 型別已更新
- [ ] **服務層**：API 函式已實作並支援 Mock 模式
- [ ] **UI 元件**：React 元件已實作並測試
- [ ] **錯誤處理**：異常情況已妥善處理

#### Git 提交
- [ ] Commit message 使用標準格式（參考 TEMPLATES.md）
- [ ] Commit 包含 Claude Code 簽名
- [ ] 提交前已移除測試檔案（如 `nul`）

---

### Phase 2: 文件撰寫

#### IMPL 文件（實作規格）
- [ ] 背景與目標明確
- [ ] 資料庫設計完整（Schema, RLS, Indexes）
- [ ] 服務層設計清楚（函式簽章、邏輯流程）
- [ ] UI 設計描述詳細（元件結構、互動流程）
- [ ] 邊界條件已列出

#### MIGRATION 文件
- [ ] Migration SQL 完整（含 Rollback）
- [ ] 執行步驟清楚
- [ ] 影響範圍說明（資料、效能）
- [ ] 驗證方法明確

#### TEST 文件
- [ ] 測試計畫涵蓋所有功能點
- [ ] 包含正常流程與異常流程
- [ ] 驗收標準明確
- [ ] 測試資料準備步驟清楚

#### SUMMARY 文件
- [ ] 實作總結簡潔
- [ ] 技術亮點列出
- [ ] 已知問題與限制說明
- [ ] 未來改進方向明確

---

### Phase 3: 測試與驗收

#### Migration 執行
- [ ] 在 Supabase Dashboard 執行 Migration SQL
- [ ] 驗證資料表結構正確（使用 `verify_setup.sql` 或手動檢查）
- [ ] 確認現有資料未受影響
- [ ] 測試 Rollback 流程（選用）

#### 功能測試
- [ ] **基本功能**：新增、編輯、刪除、查詢
- [ ] **邊界測試**：空值、極端值、特殊字元
- [ ] **整合測試**：與現有功能互動正常
- [ ] **UI/UX**：視覺一致、互動流暢
- [ ] **效能測試**：響應時間 < 500ms（一般操作）

#### 文件更新
- [ ] 測試結果記錄至 TEST 文件
- [ ] 發現的問題記錄至 SUMMARY 文件
- [ ] 如有設計變更，回頭更新 IMPL 文件

---

### Phase 4: 專案管理文件

#### TODO_AND_ROADMAP.md
- [ ] 已完成項目移至「已完成」區塊
- [ ] 標註完成版本號（如 `✅ v0.4.0`）
- [ ] 更新「進行中」與「待辦」清單
- [ ] 新增未來規劃（如 Phase 2 功能）

#### PROGRESS_REPORT_YYYYMMDD.md
- [ ] 使用當日日期命名（如 `PROGRESS_REPORT_20260101.md`）
- [ ] 包含完整的工作摘要
- [ ] 列出所有變更檔案
- [ ] 記錄遇到的問題與解決方案
- [ ] 包含測試結果
- [ ] 提供下一步計畫

---

### Phase 5: 版本發布

#### CHANGELOG.md
- [ ] 新增版本區塊（`## [X.Y.Z] - YYYY-MM-DD`）
- [ ] 依類別分組（Added, Changed, Fixed, Technical Details, Documentation, Migration）
- [ ] 使用者視角描述（非技術術語）
- [ ] Technical Details 記錄技術變更
- [ ] Migration 步驟清楚（如需要）

#### package.json
- [ ] `version` 欄位已更新（遵循 SemVer）
- [ ] 版本號與 CHANGELOG 一致

#### README.md
- [ ] **當前版本** 標籤已更新（第 4 行）
- [ ] **主要功能** 區塊已更新（新增功能標記 ✨ NEW）
- [ ] **使用指南** 區塊已新增相關章節（如需要）
- [ ] 範例與截圖保持最新（如需要）

#### PROJECT_STATUS.md
- [ ] **專案資訊** 區塊的版本已更新
- [ ] **版本歷史** 區塊新增新版本記錄
- [ ] **待開發功能** 移除已完成項目
- [ ] **已完成功能** 新增當前版本功能
- [ ] 技術堆疊與架構保持最新

---

### Phase 6: Git 操作

#### Git Tag
- [ ] 使用 annotated tag：`git tag -a v[X.Y.Z]`
- [ ] Tag message 使用標準格式（參考 TEMPLATES.md）
- [ ] Tag message 包含主要變更摘要
- [ ] 推送 Tag：`git push origin v[X.Y.Z]`

#### Git Commit（版本發布）
- [ ] 所有文件變更已加入暫存：`git add .`
- [ ] 提交前移除測試檔案：`del nul` (Windows) 或 `rm -f nul` (Unix)
- [ ] Commit message 使用「版本」格式（參考 TEMPLATES.md）
- [ ] 推送至 GitHub：`git push origin main`

#### GitHub 驗證
- [ ] GitHub 上確認所有 Commits 已推送
- [ ] GitHub Releases 頁面確認 Tag 顯示
- [ ] README.md 在 GitHub 上正確顯示

---

## 快速驗證清單

> 用於快速自我檢查，確保沒有遺漏

### 文件完整性檢查

```bash
# 1. 檢查規格文件是否存在
docs/specs/IMPL_[功能].md          ✅
docs/specs/MIGRATION_[功能].md     ✅ (如需)
docs/testing/TEST_[功能].md        ✅
docs/specs/SUMMARY_[功能].md       ✅

# 2. 檢查專案管理文件
docs/specs/TODO_AND_ROADMAP.md             ✅
docs/specs/PROGRESS_REPORT_YYYYMMDD.md     ✅

# 3. 檢查版本文件
docs/specs/CHANGELOG.md            ✅ (新增版本區塊)
package.json                       ✅ (版本號更新)
README.md                          ✅ (版本號 + 功能說明)
docs/specs/PROJECT_STATUS.md       ✅ (版本歷史更新)
```

### Migration 驗證清單

```sql
-- 在 Supabase SQL Editor 執行以下查詢驗證

-- 1. 檢查資料表結構
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'candidates'
ORDER BY ordinal_position;

-- 2. 檢查 RLS 策略
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'candidates';

-- 3. 檢查索引
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'candidates';

-- 4. 測試資料查詢
SELECT id, notes, tags FROM candidates LIMIT 5;
```

### Git 驗證清單

```bash
# 1. 檢查本地狀態
git status                  # 應顯示 "nothing to commit, working tree clean"

# 2. 檢查最新 Commit
git log -1                  # 應顯示版本發布 Commit

# 3. 檢查 Tag
git tag -l                  # 應包含 v[X.Y.Z]
git show v[X.Y.Z]          # 顯示 Tag 訊息

# 4. 檢查遠端同步
git log origin/main..HEAD  # 應無輸出（表示已推送）
```

---

## 常見問題排查

### 問題 1: Git Tag 推送失敗

**症狀**：
```bash
error: failed to push some refs to 'origin'
```

**檢查步驟**：
- [ ] Tag 是否已在本地建立：`git tag -l`
- [ ] 是否使用正確的推送指令：`git push origin v[X.Y.Z]`
- [ ] 遠端是否已存在同名 Tag：`git ls-remote --tags origin`

**解決方案**：
```bash
# 如需刪除遠端 Tag 重新推送
git push origin :refs/tags/v[X.Y.Z]  # 刪除遠端 Tag
git push origin v[X.Y.Z]              # 重新推送
```

---

### 問題 2: Migration 執行失敗

**症狀**：
```
ERROR: column "notes" of relation "candidates" already exists
```

**檢查步驟**：
- [ ] 確認欄位是否已存在：查詢 `information_schema.columns`
- [ ] 檢查是否已執行過 Migration
- [ ] 檢查 SQL 語法是否正確

**解決方案**：
```sql
-- 方案 1: 使用 IF NOT EXISTS（修改 Migration SQL）
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 方案 2: 先檢查再執行
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'notes'
  ) THEN
    ALTER TABLE candidates ADD COLUMN notes TEXT DEFAULT '';
  END IF;
END $$;
```

---

### 問題 3: package.json 與 CHANGELOG 版本不一致

**症狀**：
- `package.json` 顯示 `0.4.0`
- `CHANGELOG.md` 顯示 `0.3.1`

**檢查步驟**：
- [ ] 檢查 `package.json` 的 `version` 欄位
- [ ] 檢查 `CHANGELOG.md` 最新版本區塊
- [ ] 檢查 `README.md` 的「當前版本」標籤

**解決方案**：
1. 確定正確的版本號（通常以需求文件或功能範圍決定）
2. 統一更新所有文件
3. 重新提交：
```bash
git add package.json CHANGELOG.md README.md
git commit -m "修復：統一版本號至 v0.4.0"
```

---

### 問題 4: README.md 未更新功能說明

**症狀**：
- 新功能已開發完成
- README.md 中無相關使用說明

**檢查步驟**：
- [ ] 確認功能是否為使用者可見功能（如是內部重構則無需更新）
- [ ] 檢查 `## 主要功能` 區塊是否新增項目
- [ ] 檢查 `## 使用指南` 區塊是否新增章節

**解決方案**：
1. 在 `## 主要功能` 新增功能項目（標記 ✨ NEW (vX.Y.Z)）
2. 在 `## 使用指南` 新增使用步驟（如需要）
3. 更新第 4 行的「當前版本」標籤

---

### 問題 5: TodoWrite 任務未更新狀態

**症狀**：
- 實際已完成某階段
- TodoWrite 仍顯示 `pending` 或 `in_progress`

**檢查步驟**：
- [ ] 確認是否有使用 TodoWrite 工具
- [ ] 檢查任務狀態是否即時更新

**解決方案**：
- 每完成一個 Phase 立即更新 TodoWrite
- 使用標準的 7 階段任務清單（參考 TEMPLATES.md）
- 確保一次只有一個任務為 `in_progress`

---

### 問題 6: Commit Message 格式不符

**症狀**：
- 缺少 Claude Code 簽名
- 格式不一致

**標準格式**：
```bash
git commit -m "[類型]：[簡短摘要]

- [變更項目 1]
- [變更項目 2]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**解決方案**：
```bash
# 修改最後一次提交（尚未推送時）
git commit --amend

# 如已推送，建立新的修正提交
git commit -m "文件：修正 Commit Message 格式"
```

---

### 問題 7: 測試未涵蓋邊界情況

**症狀**：
- 正常流程測試通過
- 發現未測試的邊界條件

**檢查步驟**：
- [ ] 空值測試（empty string, null, undefined）
- [ ] 極端值測試（超長文字、大量標籤）
- [ ] 特殊字元測試（emoji, HTML, SQL injection）
- [ ] 併發測試（多使用者同時編輯）

**解決方案**：
1. 補充測試案例至 TEST 文件
2. 執行補充測試
3. 記錄結果至 SUMMARY 文件
4. 如發現問題，修復後重新測試

---

## 版本發布前最終確認

### 🔍 最終檢查（發布前 5 分鐘）

- [ ] **所有 15 項核心檢查清單已完成**
- [ ] **本地測試通過**（功能正常、無 Console 錯誤）
- [ ] **文件版本號一致**（package.json, CHANGELOG, README, PROJECT_STATUS）
- [ ] **Git 狀態乾淨**（`git status` 無未提交變更）
- [ ] **GitHub 同步完成**（Commits 和 Tag 都已推送）

### ✅ 發布完成確認

- [ ] GitHub Releases 頁面顯示新 Tag
- [ ] README.md 在 GitHub 上正確顯示新版本
- [ ] CHANGELOG.md 在 GitHub 上顯示新版本記錄
- [ ] 如有部署，確認部署成功（如 Vercel, Netlify）

---

**版本**: 1.0.0
**最後更新**: 2026-01-01
**相關文件**: [WORKFLOW.md](./WORKFLOW.md), [TEMPLATES.md](./TEMPLATES.md)
