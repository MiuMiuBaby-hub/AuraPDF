# GitHub Setup Skill

## 簡介

自動化 GitHub 專案設定流程，包含分支重新命名、CI/CD 設定、GitHub Actions 與 Firebase Hosting 整合。

確保每個新專案都遵循一致的 GitHub 設定標準，從分支命名到自動部署的完整配置。

## 觸發條件

當使用者提到以下關鍵字時觸發此 Skill：

### 分支相關
- "重新命名分支"、"rename branch"、"master 改 main"
- "分支設定"、"branch setup"
- "修復分支名稱"、"fix branch name"

### CI/CD 相關
- "設定 CI/CD"、"setup CI/CD"、"GitHub Actions"
- "自動部署"、"auto deploy"、"設定部署"
- "Firebase 部署"、"Firebase deploy"

### GitHub 設定相關
- "GitHub 設定"、"GitHub setup"
- "設定 GitHub Secrets"、"配置 Secrets"
- "初始化 GitHub 專案"

## 使用場景

### 場景 1：新專案初始化
- 剛建立的專案需要設定 GitHub
- 需要從 master 改為 main 分支
- 需要設定 CI/CD 自動部署

### 場景 2：舊專案遷移
- 舊專案使用 master 分支
- 需要與其他專案統一使用 main
- 需要添加自動部署功能

### 場景 3：Firebase Hosting 整合
- 專案需要部署到 Firebase Hosting
- 需要 GitHub Actions 自動化
- 需要設定 GitHub Secrets

## 執行流程

詳見 [WORKFLOW.md](./WORKFLOW.md) 的完整流程：

1. **Phase 1: 前置檢查** - 確認 Git 狀態、遠端設定
2. **Phase 2: 分支處理** - 提交變更、重新命名分支
3. **Phase 3: 推送設定** - 推送新分支、設定預設分支
4. **Phase 4: Secrets 設定** - 指引設定 GitHub Secrets
5. **Phase 5: 驗證** - 確認 CI/CD 運作正常

## 相關檔案

- [WORKFLOW.md](./WORKFLOW.md) - 完整流程 SOP
- [README.md](./README.md) - 使用說明與快速開始

## 依賴的其他 Skill

無

## 版本歷史

- **v1.0.0** (2026-01-25) - 初始版本，基於 AuraPDF GitHub 設定經驗
