# Release Workflow Skill

## 簡介

自動化版本發布流程，涵蓋程式碼實作、測試、文件更新、Git 操作的完整 SOP。

確保每次版本發布都遵循相同的高品質標準，從開發到發布的完整週期追蹤。

## 觸發條件

當使用者提到以下關鍵字時觸發此 Skill：

### 版本發布相關
- "發布版本"、"版本發布"、"release"、"準備發布"
- "完成開發，準備發布"、"功能開發完成"
- "測試完成，可以發布了"

### 版本文件更新
- "更新 CHANGELOG"、"更新版本號"
- "建立 Tag"、"建立 Git Tag"
- "package.json 版本"、"更新 README 版本"

### 發布流程執行
- "執行發布流程"、"跑發布 SOP"
- "按照發布流程"、"照著發布步驟"

## 使用場景

### 場景 1：功能開發完成，準備發布新版本
- 程式碼實作完成
- 測試通過
- 需要更新文件並發布

### 場景 2：Bug 修復完成，需要發布 Patch 版本
- Bug 修復完成
- 測試通過
- 快速發布修正版本

### 場景 3：重大功能完成，需要發布 Major/Minor 版本
- 重大功能或破壞性變更
- 完整測試
- 需要詳細的發布說明

## 執行流程

詳見 [WORKFLOW.md](./WORKFLOW.md) 的完整 6 個 Phase：

1. **Phase 1: 程式碼開發** - 需求分析、實作、Git 提交
2. **Phase 2: 文件撰寫** - 規格文件、測試清單、實作總結
3. **Phase 3: 測試與驗收** - Migration、功能測試、文件更新
4. **Phase 4: 專案管理文件** - To-Do Roadmap、進度報告
5. **Phase 5: 版本發布** - CHANGELOG、package.json、README、Git Tag
6. **Phase 6: 後續追蹤** - 驗證發布、更新專案管理

## 相關檔案

- [WORKFLOW.md](./WORKFLOW.md) - 完整 6 階段流程 SOP
- [TEMPLATES.md](./TEMPLATES.md) - Commit Message、CHANGELOG 範本
- [CHECKLIST.md](./CHECKLIST.md) - 檢查清單總覽
- [README.md](./README.md) - 使用說明與快速開始

## 依賴的其他 Skill

- `organize-docs` - 文件組織（Phase 2, 4 會用到）

## 版本歷史

- **v1.0.0** (2026-01-01) - 初始版本，基於 TriageHR v0.4.0 發布經驗
