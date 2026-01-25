# AuraPDF 部署指南

本文件說明如何將 AuraPDF 部署到 Firebase Hosting。

---

## 目錄

- [專案資訊](#專案資訊)
- [部署網址](#部署網址)
- [前置需求](#前置需求)
- [手動部署](#手動部署)
- [自動部署 (CI/CD)](#自動部署-cicd)
- [設定檔案說明](#設定檔案說明)
- [常見問題](#常見問題)

---

## 專案資訊

| 項目 | 值 |
|------|-----|
| Firebase 專案 ID | `aurapdf-6030d` |
| 託管平台 | Firebase Hosting |
| 建構工具 | Vite |
| 輸出目錄 | `app/dist` |

---

## 部署網址

- **主要網址**: https://aurapdf-6030d.web.app
- **備用網址**: https://aurapdf-6030d.firebaseapp.com

---

## 前置需求

### 1. 安裝 Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. 登入 Firebase

```bash
firebase login
```

### 3. 設定專案 (首次設定)

```bash
cd app
firebase use aurapdf-6030d
```

---

## 手動部署

### 快速部署

在 `app` 目錄下執行：

```bash
npm run deploy
```

這會自動執行：
1. TypeScript 編譯檢查
2. Vite 生產建構
3. 部署到 Firebase Hosting

### 分步驟部署

```bash
# 1. 建構
npm run build

# 2. 預覽建構結果 (可選)
npm run preview

# 3. 部署
firebase deploy --only hosting
```

### 預覽通道部署

建立臨時預覽版本（不影響正式環境）：

```bash
npm run deploy:preview
```

---

## 自動部署 (CI/CD)

已設定 GitHub Actions，推送到 `main` 分支時會自動部署。

### GitHub Secrets 設定

在 GitHub repo 的 **Settings > Secrets and variables > Actions** 中需要設定：

| Secret 名稱 | 說明 |
|------------|------|
| `FIREBASE_PROJECT_ID` | Firebase 專案 ID (`aurapdf-6030d`) |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase 服務帳號 JSON 內容 |

### 取得服務帳號金鑰

1. 前往 [Firebase Console](https://console.firebase.google.com)
2. 選擇專案 > 專案設定 > 服務帳戶
3. 點擊「產生新的私密金鑰」
4. 將下載的 JSON 檔案內容貼到 GitHub Secret

> ⚠️ **安全提醒**：永遠不要將服務帳號金鑰提交到版本控制！

### 工作流程觸發條件

- **推送到 `main`**: 部署到正式環境
- **Pull Request 到 `main`**: 建立預覽通道

---

## 設定檔案說明

### `app/firebase.json`

Firebase Hosting 設定檔：

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

**說明**：
- `public`: 部署的目錄
- `rewrites`: SPA 路由支援，所有路徑都指向 index.html
- `headers`: 靜態資源快取設定（JS/CSS 快取一年）

### `.github/workflows/firebase-deploy.yml`

GitHub Actions 自動部署工作流程。

---

## 常見問題

### Q: 部署時出現 "No currently active project" 錯誤

**解決方案**：

```bash
# 方法 1: 設定專案
firebase use aurapdf-6030d

# 方法 2: 指定專案部署
firebase deploy --only hosting --project aurapdf-6030d
```

### Q: 登入的帳號看不到專案

**解決方案**：

```bash
# 重新登入正確的 Google 帳號
firebase login --reauth

# 確認專案列表
firebase projects:list
```

### Q: 建構時出現 TypeScript 錯誤

**解決方案**：

```bash
# 先執行 lint 檢查
npm run lint

# 單獨執行 TypeScript 檢查
npx tsc --noEmit
```

### Q: 如何查看部署歷史

前往 [Firebase Console](https://console.firebase.google.com) > Hosting > 版本紀錄

### Q: 如何回滾到之前的版本

在 Firebase Console 的 Hosting 頁面，找到要回滾的版本，點擊「回滾」按鈕。

---

## 自訂網域 (可選)

如果需要使用自訂網域：

1. 前往 Firebase Console > Hosting
2. 點擊「新增自訂網域」
3. 按照指示設定 DNS 記錄
4. 等待 SSL 憑證自動配置

---

## 相關連結

- [Firebase Console](https://console.firebase.google.com/project/aurapdf-6030d)
- [Firebase Hosting 文件](https://firebase.google.com/docs/hosting)
- [GitHub Actions for Firebase](https://github.com/FirebaseExtended/action-hosting-deploy)

---

*最後更新：2026-01-25*
