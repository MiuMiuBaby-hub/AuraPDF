# 版本發布標準流程 (SOP)

> 基於 TriageHR v0.4.0 發布經驗整理
> 版本：1.0.0
> 更新日期：2026-01-01

---

## 📋 流程總覽

版本發布流程分為 6 個階段，每個階段都有明確的產出與檢查點：

| Phase | 階段名稱 | 關鍵產出 | 預估時間 |
|-------|---------|----------|---------|
| 1 | 程式碼開發 | 功能程式碼 + Commit | 依功能複雜度 |
| 2 | 文件撰寫 | 4 個規格 MD + Commit | 30-60 分鐘 |
| 3 | 測試與驗收 | 測試報告 + 更新文件 | 30-60 分鐘 |
| 4 | 專案管理文件 | Roadmap + Report + Commit | 30 分鐘 |
| 5 | 版本發布 | 4 個檔案更新 + Tag | 30 分鐘 |
| 6 | 後續追蹤 | 發布確認 | 10 分鐘 |

---

## Phase 1: 程式碼開發 ✅

### 1.1 需求分析與規劃

- [ ] 閱讀需求規格文件（如 `IMPL_*.md`）
- [ ] 使用 `EnterPlanMode` 建立執行計畫
- [ ] 確認實作範圍與技術架構
- [ ] 取得使用者同意開始實作

### 1.2 程式碼實作

**資料庫層**
- [ ] 建立 Migration 腳本（`scripts/migrations/YYYYMMDD_*.sql`）
- [ ] 確保向後相容
- [ ] 添加適當的註解說明

**型別定義**
- [ ] 更新 TypeScript 型別（`types.ts`）
- [ ] 使用 optional 欄位確保相容性
- [ ] 完整的 JSDoc 註解

**服務層**
- [ ] 新增/修改服務函式（`services/*.ts`）
- [ ] 實作錯誤處理
- [ ] 支援 Mock 模式（如適用）

**UI 元件**
- [ ] 實作/修改 React 元件（`components/*.tsx`）
- [ ] 遵循現有設計系統
- [ ] 添加載入狀態與錯誤處理

**品質檢查**
- [ ] TypeScript 編譯無錯誤
- [ ] Vite 建置成功
- [ ] 無 Console 錯誤或警告

### 1.3 Git 提交（功能實作）

```bash
git add [修改的檔案]
git commit -m "功能：[功能簡述]

- [變更項目 1]
- [變更項目 2]
- [變更項目 3]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push
```

**Commit Message 要點：**
- 標題：`功能：` + 簡短描述（50 字元內）
- 內容：列點說明主要變更
- 結尾：Claude Code 簽名

---

## Phase 2: 文件撰寫 📚

### 2.1 建立規格文件（實作期間同步進行）

#### 文件 1：實作規格
**檔名**：`docs/specs/IMPL_[功能名稱].md`

**內容結構：**
- 功能需求與目標
- 技術架構設計
- 資料庫 Schema 變更
- UI/UX 規格
- 實作步驟清單

#### 文件 2：Migration 指引
**檔名**：`docs/specs/MIGRATION_GUIDE_YYYYMMDD.md`

**內容結構：**
- 執行步驟（詳細）
- 驗證清單
- 回滾腳本
- 注意事項與風險

#### 文件 3：測試檢查清單
**檔名**：`docs/specs/TESTING_CHECKLIST_[功能名稱].md`

**內容結構：**
- 完整測試項目（基本、組合、邊界、錯誤、UI/UX、整合）
- 驗收標準
- 測試結果記錄（待填）
- 簽核欄位

#### 文件 4：實作總結
**檔名**：`docs/specs/IMPLEMENTATION_SUMMARY_[功能名稱].md`

**內容結構：**
- 實作概述與範圍
- 變更統計與明細
- 技術實作細節
- 功能特色與亮點
- 未來增強計畫

### 2.2 Git 提交（文件建立）

```bash
git add docs/specs/*.md
git commit -m "文件：建立 [功能名稱] 規格文件

- 實作規格
- Migration 指引
- 測試清單
- 實作總結

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push
```

---

## Phase 3: 測試與驗收 🧪

### 3.1 Migration 執行

- [ ] 登入 Supabase Dashboard（或相應資料庫管理介面）
- [ ] 執行 Migration SQL
- [ ] 驗證資料庫變更（使用 SQL 查詢確認）
- [ ] 測試 RLS 策略（如適用）

### 3.2 功能測試

**基本功能測試**（核心功能）
- [ ] 測試項目 1
- [ ] 測試項目 2
- [ ] 測試項目 3

**組合測試**（多功能互動）
- [ ] 組合場景 1
- [ ] 組合場景 2

**邊界測試**（極端情況）
- [ ] 空白輸入
- [ ] 超長輸入
- [ ] 特殊字元
- [ ] 邊界值

**錯誤處理測試**（異常處理）
- [ ] 網路錯誤
- [ ] API 錯誤
- [ ] 驗證錯誤

**UI/UX 測試**（使用者體驗）
- [ ] 載入狀態
- [ ] 錯誤提示
- [ ] 成功反饋
- [ ] 響應式設計
- [ ] 深色模式（如適用）

**整合測試**（系統整合）
- [ ] 前後端整合
- [ ] 資料持久化
- [ ] 跨模組互動

### 3.3 更新測試文件

#### 更新 TESTING_CHECKLIST
- [ ] 標記所有測試項目為 `[x]`
- [ ] 填寫測試結果統計（通過率）
- [ ] 記錄測試備註
- [ ] 填寫簽核資訊（測試人員、日期、結果）

#### 更新 MIGRATION_GUIDE
- [ ] 標記驗證清單為 `[x]`
- [ ] 填寫執行資訊（執行人、日期、狀態）

#### 更新 IMPLEMENTATION_SUMMARY
- [ ] 狀態更新為「已完成並測試通過」
- [ ] 記錄測試日期
- [ ] 更新「待執行項目」（標記 Migration 和測試為完成）

---

## Phase 4: 專案管理文件 📊

### 4.1 建立/更新 To-Do Roadmap

**檔名**：`docs/specs/TODO_AND_ROADMAP.md`

**內容結構：**
- 當前狀態總覽
- 當前待辦事項（版本發布）
- 短期計畫（1-2 週）
- 中期計畫（1-2 月）
- 長期願景（3-6 月）
- 版本發布計畫
- 進度追蹤表

### 4.2 建立進度報告

**檔名**：`PROGRESS_REPORT_YYYYMMDD.md`（根目錄）

**內容結構：**
- 執行摘要
- 已完成工作詳情
- 文件狀態更新
- 下一步行動項目
- 專案統計
- 版本發布時間軸

### 4.3 Git 提交（測試與進度文件）

```bash
git add docs/specs/*.md PROGRESS_REPORT_*.md
git commit -m "文件：更新測試結果與進度報告

- 測試清單：100% 通過
- Migration 指引：執行成功
- 實作總結：測試通過
- 新增/更新 To-Do Roadmap
- 新增/更新進度報告

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push
```

---

## Phase 5: 版本發布 🚀

### 5.1 使用 TodoWrite 追蹤任務

建立以下任務清單：
```javascript
[
  {"content": "更新 CHANGELOG.md 新增 vX.Y.Z", "status": "pending", "activeForm": "更新 CHANGELOG.md 新增 vX.Y.Z"},
  {"content": "更新 package.json 版本號", "status": "pending", "activeForm": "更新 package.json 版本號"},
  {"content": "更新 README.md 新增功能說明", "status": "pending", "activeForm": "更新 README.md 新增功能說明"},
  {"content": "更新 PROJECT_STATUS.md", "status": "pending", "activeForm": "更新 PROJECT_STATUS.md"},
  {"content": "提交所有文件更新", "status": "pending", "activeForm": "提交所有文件更新"},
  {"content": "建立 Git Tag vX.Y.Z", "status": "pending", "activeForm": "建立 Git Tag vX.Y.Z"},
  {"content": "推送 Tag 到 GitHub", "status": "pending", "activeForm": "推送 Tag 到 GitHub"}
]
```

### 5.2 更新 CHANGELOG.md

**位置**：在 `[Unreleased]` 區塊之後新增

**內容結構**：
```markdown
## [X.Y.Z] - YYYY-MM-DD - [功能主題]

### ✨ Added（新增功能）
[詳細功能描述]

### 🗄️ Database（資料庫變更）
[Schema 更新、Migration 腳本]

### 🔧 Technical（技術變更）
[型別定義、服務層、UI 元件]

### 📚 Documentation（文件更新）
[新增規格文件、專案管理文件]

### 🧪 Testing（測試）
[測試完成度、測試項目、使用者驗收]

### 📊 Code Statistics（程式碼統計）
[變更摘要、檔案變更明細]

### 🎯 Feature Highlights（功能亮點）
[核心功能、使用者體驗、技術亮點]

### 💡 Known Limitations（已知限制）
[目前限制]

### 🚀 Future Enhancements（未來增強）
[Phase 2 計劃、進階功能]

### 🔗 Related Links（相關連結）
[GitHub Commits、文件、程式碼]
```

詳細範本請見 [TEMPLATES.md](./TEMPLATES.md)

### 5.3 更新 package.json

```json
{
  "version": "X.Y.Z"
}
```

### 5.4 更新 README.md

- [ ] 當前版本：`**當前版本**: vX.Y.Z`
- [ ] 主要功能區塊：新增/更新功能說明
- [ ] 標註版本號：`✨ NEW (vX.Y.Z)` 或 `⭐ ENHANCED (vX.Y.Z)`

### 5.5 更新 PROJECT_STATUS.md

- [ ] 當前版本：`**當前版本**: vX.Y.Z`
- [ ] 更新日期：`**更新日期**: YYYY-MM-DD`
- [ ] 已完成功能：新增功能區塊至「已完成」章節
- [ ] 進行中功能：移除已完成項目，新增未來計畫
- [ ] 檔案結構：更新 package.json 版本號

### 5.6 更新 Unreleased 計畫

**CHANGELOG.md**：
- [ ] 從 Unreleased 移除已實作功能
- [ ] 新增未來計畫項目

### 5.7 Git 提交（版本發布）

```bash
# 清理臨時檔案（如有）
rm -f nul
echo "nul" >> .gitignore

# 提交所有版本文件
git add .
git commit -m "文件：發布 vX.Y.Z 版本 - [功能主題]

✨ 版本更新
- 更新 package.json: vX.Y-1.Z → vX.Y.Z
- 更新 README.md: 新增 [功能] 功能說明
- 更新 PROJECT_STATUS.md: 標記 [功能] 為已完成
- 新增 CHANGELOG.md: 完整的 vX.Y.Z 發布說明

📝 功能亮點
- [功能亮點 1]
- [功能亮點 2]
- [功能亮點 3]

📊 測試狀態
- 測試通過率: 100%
- 使用者驗收: 測試OK
- 已知問題: 無

🔗 相關 Commits
- [commit_hash]: [commit 描述]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push
```

### 5.8 建立與推送 Git Tag

```bash
# 建立帶註解的 Tag
git tag -a vX.Y.Z -m "Release vX.Y.Z: [功能主題]

✨ 新增功能
- [功能 1]
- [功能 2]

🗄️ 資料庫變更
- [資料庫變更描述]

🧪 測試
- 測試通過率: 100%
- 使用者驗收: 測試OK

📚 文件
- [文件列表]

完整更新內容請見 CHANGELOG.md"

# 推送 Tag 至 GitHub
git push origin vX.Y.Z
```

### 5.9 GitHub Release（可選）

- [ ] 前往 GitHub Repository
- [ ] 點擊 "Releases" → "Draft a new release"
- [ ] 選擇 Tag：`vX.Y.Z`
- [ ] Release Title：`vX.Y.Z - [功能主題]`
- [ ] Description：使用 CHANGELOG.md 對應版本的內容
- [ ] 點擊 "Publish release"

---

## Phase 6: 後續追蹤 📈

### 6.1 驗證發布結果

- [ ] GitHub Commits 正確推送
- [ ] Git Tag 顯示在 GitHub
- [ ] 所有文件版本號一致
- [ ] CHANGELOG.md 格式正確
- [ ] 無遺漏的檔案變更

### 6.2 更新專案管理工具

- [ ] 清空 TodoWrite 清單（如使用）
- [ ] 更新專案看板（如使用）
- [ ] 通知團隊成員（如需要）

### 6.3 建立下一版本規劃

- [ ] 更新 TODO_AND_ROADMAP.md 的下一版本計畫
- [ ] 移動未完成項目到新版本
- [ ] 規劃下一階段開發重點

---

## 📋 快速檢查清單（15 項核心檢查）

使用此清單快速驗證版本發布是否完整：

### 程式碼 (3 項)
- [ ] 1. TypeScript 編譯無錯誤
- [ ] 2. Vite 建置成功
- [ ] 3. 所有程式碼已 commit 並 push

### 測試 (3 項)
- [ ] 4. Migration 執行成功
- [ ] 5. 功能測試 100% 通過
- [ ] 6. 使用者驗收完成

### 文件 (4 項)
- [ ] 7. 4 個規格文件齊全（IMPL, MIGRATION, TESTING, SUMMARY）
- [ ] 8. To-Do Roadmap 已更新
- [ ] 9. 進度報告已建立
- [ ] 10. 所有測試文件已更新狀態

### 版本 (5 項)
- [ ] 11. CHANGELOG.md 已新增版本區塊
- [ ] 12. package.json 版本號已更新
- [ ] 13. README.md 版本號與功能已更新
- [ ] 14. PROJECT_STATUS.md 已更新
- [ ] 15. Git Tag 已建立並推送

---

## 🔧 常見問題與解決方案

### Q1: Migration 執行失敗怎麼辦？
**A:**
1. 檢查 SQL 語法錯誤
2. 確認資料庫連線
3. 檢查權限設定
4. 使用回滾腳本還原

### Q2: Git Tag 推送失敗？
**A:**
1. 確認 Tag 名稱不重複
2. 檢查 Git 權限
3. 使用 `git push --tags` 推送所有 Tag

### Q3: 版本號如何決定？
**A:** 遵循 Semantic Versioning (SemVer):
- **Major (X.0.0)**: 破壞性變更
- **Minor (0.X.0)**: 新功能（向後相容）
- **Patch (0.0.X)**: Bug 修復

### Q4: 忘記某個步驟怎麼辦？
**A:**
1. 參考 CHECKLIST.md 逐項檢查
2. 檢查 Git 歷史，補上遺漏的 Commit
3. 使用 `git commit --amend` 修正最後一次 Commit（如未 push）

---

## 📚 延伸閱讀

- [TEMPLATES.md](./TEMPLATES.md) - 所有範本集合
- [CHECKLIST.md](./CHECKLIST.md) - 詳細檢查清單
- [README.md](./README.md) - 使用說明與範例
- [Keep a Changelog](https://keepachangelog.com/) - CHANGELOG 格式規範
- [Semantic Versioning](https://semver.org/) - 版本號規範

---

**版本**：1.0.0
**維護者**：Claude Code
**最後更新**：2026-01-01
