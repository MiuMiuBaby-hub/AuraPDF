# GitHub Setup Skill

> 自動化 GitHub 專案設定流程，包含分支管理與 CI/CD 配置

## 快速開始

### 觸發方式

在對話中使用以下關鍵字：

```
「幫我設定 GitHub」
「master 改 main」
「設定 CI/CD 自動部署」
「設定 Firebase 部署」
```

### 主要功能

1. **分支重新命名** - 將 `master` 改為 `main`
2. **CI/CD 設定** - GitHub Actions 自動化部署
3. **Firebase 整合** - Firebase Hosting 部署配置
4. **Secrets 設定指引** - 安全地設定部署所需的憑證

---

## 使用流程

### Step 1: 確認狀態

Claude 會自動檢查：
- 目前的分支名稱
- 遠端設定
- 未提交的變更
- 其他專案的分支慣例

### Step 2: 提交變更

如果有未提交的變更，會先幫你提交：
- 自動排除本地設定檔（如 `.claude/settings.local.json`）
- 使用規範的 commit message

### Step 3: 重新命名分支

```bash
git branch -m master main
git push -u origin main
```

### Step 4: GitHub 設定（手動）

需要你在瀏覽器中：
1. 設定 `main` 為預設分支
2. 設定 GitHub Secrets

### Step 5: 驗證

Claude 會協助驗證：
- 分支設定正確
- CI/CD 執行成功
- 部署正常運作

---

## 檔案說明

| 檔案 | 說明 |
|------|------|
| [SKILL.md](./SKILL.md) | Skill 定義與觸發條件 |
| [WORKFLOW.md](./WORKFLOW.md) | 完整流程 SOP 與範本 |
| [README.md](./README.md) | 使用說明（本文件） |

---

## 範例對話

### 範例 1：新專案設定

```
User: 幫我設定 GitHub，我想用 Firebase Hosting 自動部署

Claude: 讓我先檢查目前的狀態...
[檢查分支、遠端設定]

Claude: 發現你目前使用 master 分支，但你的其他專案都使用 main。
建議將 master 改名為 main，這樣 CI/CD 就能正常運作。

[執行分支重新命名和推送]

Claude: 完成！接下來需要你在 GitHub 上：
1. 設定 main 為預設分支
2. 設定 FIREBASE_PROJECT_ID 和 FIREBASE_SERVICE_ACCOUNT secrets
```

### 範例 2：只設定 CI/CD

```
User: 設定 GitHub Actions 自動部署到 Firebase

Claude: 讓我建立 GitHub Actions workflow...
[建立 .github/workflows/firebase-deploy.yml]
[建立 app/firebase.json]

Claude: 已建立 CI/CD 設定檔。請設定以下 GitHub Secrets：
- FIREBASE_PROJECT_ID
- FIREBASE_SERVICE_ACCOUNT
```

---

## 需要的 GitHub Secrets

| Secret 名稱 | 說明 | 如何取得 |
|------------|------|---------|
| `FIREBASE_PROJECT_ID` | Firebase 專案 ID | Firebase Console > 專案設定 |
| `FIREBASE_SERVICE_ACCOUNT` | 服務帳號 JSON | Firebase Console > 服務帳戶 > 產生新的私密金鑰 |

---

## 相關資源

- [GitHub Actions 文件](https://docs.github.com/en/actions)
- [Firebase Hosting 文件](https://firebase.google.com/docs/hosting)
- [Firebase GitHub Action](https://github.com/FirebaseExtended/action-hosting-deploy)

---

## 版本歷史

### v1.0.0 (2026-01-25)
- 初始版本
- 基於 AuraPDF 專案的 GitHub 設定經驗
- 包含分支管理、CI/CD 設定、Firebase 整合

---

*維護者：Claude Opus 4.5*
*最後更新：2026-01-25*
