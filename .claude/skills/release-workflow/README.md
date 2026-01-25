# Release Workflow Skill - 使用指南

> 完整的版本發布流程自動化 Skill，從開發到發布的全週期追蹤

## 📚 簡介

**Release Workflow Skill** 是為 TriageHR 專案設計的版本發布標準作業程序（SOP），確保每次版本發布都遵循相同的高品質標準。

### 為什麼需要這個 Skill？

在完成 TriageHR v0.4.0（候選人筆記與標籤功能）的發布過程中，我們發現需要完成以下步驟：
1. 程式碼實作與 Git 提交
2. 撰寫 4 份規格文件（IMPL, MIGRATION, TESTING, SUMMARY）
3. 執行 Migration 與測試
4. 更新 2 份專案管理文件（TODO_AND_ROADMAP, PROGRESS_REPORT）
5. 更新 4 份版本文件（CHANGELOG, package.json, README, PROJECT_STATUS）
6. 建立 Git Tag 並推送

**問題**：每次發布都要重複這些步驟，容易遺漏或格式不一致。

**解決方案**：將整個流程制度化為可重複使用的 Skill。

---

## 🎯 核心價值

1. **標準化流程**：確保每次發布遵循相同步驟
2. **完整文件**：自動提醒撰寫所有必要文件
3. **品質保證**：內建測試與驗證檢查清單
4. **可追蹤性**：TodoWrite 任務追蹤，進度一目了然
5. **版本一致性**：確保所有文件的版本號同步

---

## 📁 Skill 檔案結構

```
.claude/skills/release-workflow/
├── SKILL.md          # Skill 定義與觸發條件
├── WORKFLOW.md       # 完整 6 階段 SOP
├── TEMPLATES.md      # 所有範本（Commit, CHANGELOG, Tag 等）
├── CHECKLIST.md      # 快速驗證清單
└── README.md         # 本檔案：使用指南
```

### 各檔案用途

| 檔案 | 用途 | 何時參考 |
|-----|------|---------|
| **SKILL.md** | Skill 定義、觸發條件、使用場景 | 了解 Skill 何時觸發 |
| **WORKFLOW.md** | 6 階段完整流程 SOP | 執行發布時的主要參考 |
| **TEMPLATES.md** | Commit Message、CHANGELOG、Tag 等範本 | 需要撰寫文件或提交時 |
| **CHECKLIST.md** | 15 項核心檢查清單 | 發布前驗證用 |
| **README.md** | 使用指南、快速開始 | 首次使用或需要範例時 |

---

## 🚀 快速開始

### 場景 1：功能開發完成，準備發布新版本

**情境**：你剛完成「候選人匯出 Excel」功能，準備發布 v0.5.0。

**步驟**：

1. **觸發 Skill**：對 Claude Code 說
   ```
   「功能開發完成，準備發布 v0.5.0」
   ```

2. **Claude 會自動**：
   - 建立 7 階段 TodoWrite 任務清單
   - 引導你完成每個 Phase

3. **跟隨 WORKFLOW.md 執行**：
   - Phase 1: 確認程式碼已提交
   - Phase 2: 撰寫 4 份規格文件
   - Phase 3: 執行 Migration 與測試
   - Phase 4: 更新專案管理文件
   - Phase 5: 更新版本文件
   - Phase 6: 建立 Git Tag 並推送

4. **使用 TEMPLATES.md**：
   - 複製 Commit Message 範本
   - 複製 CHANGELOG 版本區塊範本
   - 複製 Git Tag Message 範本

5. **發布前驗證**：
   - 開啟 CHECKLIST.md
   - 逐項確認 15 項核心檢查清單

---

### 場景 2：Bug 修復，發布 Patch 版本

**情境**：修正了候選人標籤重複新增的 Bug，準備發布 v0.4.1。

**步驟**：

1. **觸發 Skill**：
   ```
   「Bug 修復完成，準備發布 v0.4.1」
   ```

2. **簡化流程**（Patch 版本可省略部分文件）：
   - Phase 1: Git 提交（使用「修復」類型 Commit）
   - Phase 2: 撰寫 SUMMARY 文件（IMPL/MIGRATION 可省略）
   - Phase 3: 快速測試
   - Phase 4: 更新 TODO_AND_ROADMAP（簡化版）
   - Phase 5: 更新 CHANGELOG（使用 Fixed 類別）
   - Phase 6: Git Tag

3. **CHANGELOG 範例**：
   ```markdown
   ## [0.4.1] - 2026-01-02

   ### Fixed
   - 修正候選人標籤重複新增問題
   - 修正筆記儲存失敗時的錯誤處理
   ```

---

### 場景 3：重大功能，發布 Minor 版本

**情境**：完成「面試排程整合」功能，準備發布 v0.5.0。

**步驟**：

1. **完整執行 6 階段流程**（不可省略）

2. **特別注意**：
   - IMPL 文件要詳細（新功能架構說明）
   - MIGRATION 文件要包含 Rollback（資料庫變更）
   - TESTING 文件要涵蓋整合測試（與現有功能互動）
   - README 要新增使用指南章節

3. **CHANGELOG 範例**：
   ```markdown
   ## [0.5.0] - 2026-01-15

   ### Added
   - **面試排程整合**：與 Google Calendar 同步面試時間
     - 候選人可用時段管理
     - 自動發送面試邀請 Email
     - 面試提醒通知
   ```

---

## 📋 6 階段流程概覽

### Phase 1: 程式碼開發
- 需求分析
- 程式碼實作（Database, Services, UI）
- Git Commit

### Phase 2: 文件撰寫
- `IMPL_[功能].md` - 實作規格
- `MIGRATION_[功能].md` - Migration 文件
- `TEST_[功能].md` - 測試計畫
- `SUMMARY_[功能].md` - 實作總結

### Phase 3: 測試與驗收
- 執行 Migration
- 功能測試
- 更新規格文件（測試結果）

### Phase 4: 專案管理文件
- `TODO_AND_ROADMAP.md` - 更新待辦與路線圖
- `PROGRESS_REPORT_YYYYMMDD.md` - 建立進度報告

### Phase 5: 版本發布
- `CHANGELOG.md` - 新增版本記錄
- `package.json` - 更新版本號
- `README.md` - 更新功能說明
- `PROJECT_STATUS.md` - 更新專案狀態

### Phase 6: Git 操作
- 建立 Git Tag（`v[X.Y.Z]`）
- 推送至 GitHub
- 驗證發布

詳細步驟請參考 [WORKFLOW.md](./WORKFLOW.md)

---

## 📝 常用範本

### Commit Message 範本

**功能開發**：
```bash
git commit -m "功能：[功能簡述]

- [變更項目 1]
- [變更項目 2]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Bug 修復**：
```bash
git commit -m "修復：[Bug 簡述]

- [修復項目 1]
- [修復項目 2]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

更多範本請參考 [TEMPLATES.md](./TEMPLATES.md)

---

### CHANGELOG 範本

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

### Documentation
- 更新的文件清單

### Migration (如需要)
- **SQL**: 執行步驟
- **Rollback**: 回滾步驟
```

---

### Git Tag Message 範本

```bash
git tag -a v[X.Y.Z] -m "Release v[X.Y.Z]: [版本主題]

主要變更：
- [變更 1]
- [變更 2]

詳細資訊請參考 CHANGELOG.md

發布日期：YYYY-MM-DD"
```

---

## ✅ 核心檢查清單（快速參考）

發布前確認以下 15 項：

**Phase 1-3: 開發與測試**
- [ ] 1.1 需求分析完成
- [ ] 1.2 程式碼實作完成
- [ ] 1.3 Git Commit 已提交
- [ ] 2.1-2.4 規格文件已完成（4 份）
- [ ] 3.1 Migration 已執行
- [ ] 3.2 功能測試通過
- [ ] 3.3 規格文件已更新

**Phase 4-5: 文件更新**
- [ ] 4.1 TODO_AND_ROADMAP 已更新
- [ ] 4.2 PROGRESS_REPORT 已建立
- [ ] 5.1 CHANGELOG 已更新
- [ ] 5.2 package.json 版本已更新
- [ ] 5.3 README 已更新
- [ ] 5.4 PROJECT_STATUS 已更新

**Phase 6: Git 操作**
- [ ] 6.1 Git Tag 已建立並推送
- [ ] 6.2 所有變更已推送至 GitHub

完整清單請參考 [CHECKLIST.md](./CHECKLIST.md)

---

## 🔧 實用技巧

### 技巧 1: 使用 TodoWrite 追蹤進度

在開始發布流程時，立即建立 7 階段任務清單：

```typescript
TodoWrite([
  { content: "完成程式碼實作與 Git 提交", activeForm: "...", status: "completed" },
  { content: "撰寫 4 份規格文件", activeForm: "...", status: "in_progress" },
  // ...其他 5 個任務
])
```

**好處**：
- 隨時知道目前進度
- 防止遺漏步驟
- 給使用者清楚的進度回饋

---

### 技巧 2: 使用範本避免格式錯誤

不要手寫 Commit Message 或 CHANGELOG，直接從 TEMPLATES.md 複製範本：

1. 開啟 [TEMPLATES.md](./TEMPLATES.md)
2. 找到對應範本（如「功能開發 Commit」）
3. 複製範本並填入實際內容
4. 執行 Git 指令

**好處**：
- 格式一致
- 不會漏掉 Claude Code 簽名
- 節省時間

---

### 技巧 3: 分階段提交，降低風險

不要等到所有文件都完成才提交，建議分 3 次提交：

**Commit 1: 程式碼實作**（Phase 1 完成）
```bash
git add services/ components/ scripts/
git commit -m "功能：新增候選人匯出 Excel 功能"
```

**Commit 2: 文件撰寫**（Phase 2-4 完成）
```bash
git add docs/
git commit -m "文件：新增候選人匯出功能規格文件"
```

**Commit 3: 版本發布**（Phase 5 完成）
```bash
git add CHANGELOG.md package.json README.md docs/specs/PROJECT_STATUS.md
git commit -m "版本：發布 v0.5.0"
git tag -a v0.5.0 -m "..."
```

**好處**：
- 每次提交內容單一、清楚
- 如需 Rollback 更容易
- Git 歷史更易讀

---

### 技巧 4: 使用 CHECKLIST.md 驗證

在 Phase 5 完成後、建立 Tag 前，開啟 [CHECKLIST.md](./CHECKLIST.md) 逐項確認：

```bash
# 在終端執行
cat .claude/skills/release-workflow/CHECKLIST.md
```

或在 VSCode 中開啟檢查。

**好處**：
- 避免遺漏更新文件
- 確保版本號一致
- 發現潛在問題

---

### 技巧 5: Patch 版本可簡化流程

如果是 Bug 修復（Patch 版本，如 v0.4.0 → v0.4.1），可省略：
- IMPL 文件（除非是重大重構）
- MIGRATION 文件（Bug 修復通常不改資料庫）
- 詳細的 TEST 文件（可在 SUMMARY 中簡述測試）

**保留**：
- SUMMARY 文件（記錄修復內容）
- CHANGELOG（使用 Fixed 類別）
- package.json, README（版本號更新）

---

## 🔗 依賴的其他 Skill

### organize-docs Skill

在 Phase 2（文件撰寫）和 Phase 4（專案管理文件）時，可搭配使用 `organize-docs` Skill 來組織文件結構。

**觸發方式**：
```
「幫我組織 docs 目錄的文件」
```

**用途**：
- 確保文件放在正確位置
- 檢查文件命名是否符合規範
- 整理文件目錄結構

---

## 📊 版本號規範（Semantic Versioning）

### 格式：`MAJOR.MINOR.PATCH`

- **MAJOR (X.0.0)**: 破壞性變更、不向後相容
  - 範例：重新設計 API、改變資料結構

- **MINOR (0.X.0)**: 新功能、向後相容
  - 範例：新增候選人匯出、新增面試排程

- **PATCH (0.0.X)**: Bug 修復、小改進
  - 範例：修正標籤重複、修正 UI 錯誤

### TriageHR 版本歷程

- `0.1.0` - 初始候選人管理
- `0.2.0` - 新增職缺管理
- `0.3.0` - 新增批量匯入
- `0.4.0` - 新增筆記與標籤 ← 當前版本
- `0.5.0` - （規劃中）候選人匯出
- `1.0.0` - 第一個生產就緒版本

---

## 🎓 學習資源

### 內部文件
- [WORKFLOW.md](./WORKFLOW.md) - 完整 SOP
- [TEMPLATES.md](./TEMPLATES.md) - 所有範本
- [CHECKLIST.md](./CHECKLIST.md) - 驗證清單

### 外部參考
- [Keep a Changelog](https://keepachangelog.com/) - CHANGELOG 格式規範
- [Semantic Versioning](https://semver.org/) - 版本號規範
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit Message 規範

---

## ❓ 常見問題 (FAQ)

### Q1: 每次發布都要寫 4 份規格文件嗎？

**A**: 依版本類型而定：
- **Minor 版本（新功能）**：是，建議完整撰寫
- **Patch 版本（Bug 修復）**：可簡化，只寫 SUMMARY
- **Major 版本（重大變更）**：是，且要更詳細

### Q2: 如果發布後發現遺漏更新某個文件怎麼辦？

**A**:
1. 立即補充更新遺漏的文件
2. 建立新的 Commit：
   ```bash
   git commit -m "文件：補充遺漏的 README 更新"
   ```
3. 推送至 GitHub
4. 不需重新建立 Tag（除非是重大遺漏）

### Q3: Tag 已建立但發現 Commit 有誤，如何修正？

**A**:
```bash
# 1. 刪除本地 Tag
git tag -d v0.4.0

# 2. 刪除遠端 Tag（如已推送）
git push origin :refs/tags/v0.4.0

# 3. 修正 Commit（使用 amend 或新 Commit）
git commit --amend  # 或建立新 Commit

# 4. 重新建立 Tag
git tag -a v0.4.0 -m "..."

# 5. 重新推送
git push origin main
git push origin v0.4.0
```

### Q4: 可以跳過某個 Phase 嗎？

**A**:
- **不建議跳過**，每個 Phase 都有其目的
- **例外情況**：
  - Patch 版本可簡化 Phase 2（文件）
  - 如無資料庫變更，MIGRATION 文件可省略
  - 如無新功能，README 使用指南可不更新

### Q5: TodoWrite 任務清單一定要用嗎？

**A**:
- **強烈建議使用**，可避免遺漏步驟
- Claude Code 會自動追蹤進度
- 給使用者清楚的進度回饋
- 如果不使用，請自行確認 CHECKLIST.md

---

## 📞 需要協助？

1. **查看 WORKFLOW.md**：詳細步驟說明
2. **查看 TEMPLATES.md**：範本格式參考
3. **查看 CHECKLIST.md**：快速驗證清單
4. **查看 TriageHR 專案文件**：
   - `docs/specs/PROJECT_STATUS.md`
   - `docs/specs/TODO_AND_ROADMAP.md`
   - `docs/specs/CHANGELOG.md`

---

## 📜 版本歷史

- **v1.0.0** (2026-01-01) - 初始版本，基於 TriageHR v0.4.0 發布經驗

---

## 📄 授權

本 Skill 為 TriageHR 專案的一部分，遵循專案的 MIT License。

---

**🎉 現在你已經準備好使用 Release Workflow Skill 了！**

開始你的下一次版本發布吧：

```
「我完成了 [功能名稱] 開發，準備發布 v[X.Y.Z]」
```

Claude Code 會引導你完成整個流程！
