# GitHub Setup Workflow

完整的 GitHub 專案設定流程，涵蓋分支管理、CI/CD 配置、Firebase Hosting 整合。

---

## Phase 1: 前置檢查

### 1.1 確認 Git 狀態

```bash
# 檢查目前分支
git branch

# 檢查遠端設定
git remote -v

# 檢查遠端分支
git ls-remote --heads origin

# 檢查未提交的變更
git status
```

### 1.2 檢查其他專案的分支慣例

```bash
# 查看其他專案使用的分支名稱
cd "../OtherProject" && git branch -a
```

**決策點**：
- 如果其他專案使用 `main`，建議統一使用 `main`
- 如果混用，建議逐步遷移到 `main`

---

## Phase 2: 分支處理

### 2.1 提交未完成的變更

在重新命名分支之前，先提交所有變更：

```bash
# 查看變更
git status
git diff --stat

# 選擇性添加檔案（排除本地設定）
git add .gitignore
git add app/package.json
git add .github/
git add docs/

# 提交
git commit -m "feat: Add deployment configuration

- Add Firebase Hosting config
- Add GitHub Actions CI/CD workflow
- Add deployment documentation

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### 2.2 重新命名本地分支

```bash
# master 改名為 main
git branch -m master main

# 驗證
git branch
```

---

## Phase 3: 推送設定

### 3.1 推送新分支到 GitHub

```bash
# 推送 main 分支並設定追蹤
git push -u origin main
```

### 3.2 在 GitHub 設定預設分支

**手動步驟**（需要使用者在瀏覽器操作）：

1. 前往 `https://github.com/[username]/[repo]/settings/branches`
2. 在 "Default branch" 區塊點擊切換按鈕
3. 選擇 `main` 作為預設分支
4. 點擊 "Update" 確認

### 3.3 刪除舊的 master 分支

```bash
# 確認 main 已設為預設分支後
git push origin --delete master

# 驗證遠端只有 main
git branch -r
```

---

## Phase 4: GitHub Secrets 設定

### 4.1 Firebase 專案相關 Secrets

在 GitHub repo 的 **Settings > Secrets and variables > Actions** 設定：

| Secret 名稱 | 說明 | 範例值 |
|------------|------|--------|
| `FIREBASE_PROJECT_ID` | Firebase 專案 ID | `my-app-12345` |
| `FIREBASE_SERVICE_ACCOUNT` | 服務帳號 JSON 內容 | `{"type": "service_account", ...}` |

### 4.2 取得 Firebase 服務帳號金鑰

1. 前往 [Firebase Console](https://console.firebase.google.com)
2. 選擇專案 > 專案設定 > 服務帳戶
3. 點擊「產生新的私密金鑰」
4. 下載 JSON 檔案
5. 複製整個 JSON 內容貼到 `FIREBASE_SERVICE_ACCOUNT` secret

**安全提醒**：
- 永遠不要將服務帳號金鑰提交到版本控制
- 定期輪換金鑰
- 使用最小權限原則

---

## Phase 5: 驗證

### 5.1 驗證分支設定

```bash
# 本地分支
git branch
# 預期輸出: * main

# 遠端分支
git branch -r
# 預期輸出: origin/main (沒有 origin/master)
```

### 5.2 驗證 CI/CD

1. 推送一個小變更觸發 workflow
2. 前往 `https://github.com/[username]/[repo]/actions`
3. 確認 workflow 成功執行
4. 檢查部署結果

### 5.3 驗證部署

1. 訪問部署網址（如 `https://[project-id].web.app`）
2. 確認網站正常運作
3. 檢查 Firebase Console 的 Hosting 頁面

---

## 常見問題處理

### Q1: 無法刪除 master 分支

**錯誤**：`remote: error: refusing to delete the current branch`

**解決**：先在 GitHub 設定頁面將預設分支改為 `main`

### Q2: GitHub Actions 執行失敗

**常見原因**：
1. Secrets 未設定或設定錯誤
2. 服務帳號權限不足
3. 專案 ID 錯誤

**檢查步驟**：
1. 確認 Secrets 名稱拼寫正確
2. 確認 JSON 內容完整（包含開頭結尾的 `{}`）
3. 確認 Firebase 專案已啟用 Hosting

### Q3: 部署成功但網站顯示 404

**可能原因**：
1. `firebase.json` 的 `public` 目錄設定錯誤
2. 建構輸出目錄不正確

**解決**：
檢查 `firebase.json` 中的 `public` 設定是否指向正確的建構輸出目錄

---

## GitHub Actions Workflow 範本

### Firebase Hosting 基本範本

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: app/package-lock.json

      - name: Install dependencies
        run: cd app && npm ci

      - name: Build
        run: cd app && npm run build

      - name: Deploy to Firebase (Production)
        if: github.event_name == 'push'
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
          entryPoint: ./app

      - name: Deploy Preview Channel
        if: github.event_name == 'pull_request'
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
          entryPoint: ./app
```

### Firebase.json 範本

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

---

## 檢查清單

### 分支設定
- [ ] 本地分支已改名為 `main`
- [ ] 新分支已推送到 GitHub
- [ ] GitHub 預設分支已設為 `main`
- [ ] 舊的 `master` 分支已刪除

### CI/CD 設定
- [ ] `.github/workflows/` 目錄已建立
- [ ] workflow YAML 檔案已建立
- [ ] `firebase.json` 已建立
- [ ] `FIREBASE_PROJECT_ID` Secret 已設定
- [ ] `FIREBASE_SERVICE_ACCOUNT` Secret 已設定

### 驗證
- [ ] GitHub Actions 執行成功
- [ ] 網站部署成功可訪問
- [ ] PR 預覽通道正常運作

---

*最後更新：2026-01-25*
