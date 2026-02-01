# 数トレゲーム - 計算タイムアタック

10問の計算問題をできるだけ速く解くタイムアタックゲーム。世界ランキング機能付き！

## 機能

- 10問の計算問題（足し算・引き算・掛け算）
- リアルタイムタイマー
- 世界ランキング（トップ5表示）
- ローカル・Render両対応

## プロジェクト構成

```
p53-fs-math-score/
├── backend/
│   └── main.py           # FastAPIサーバー
├── frontend/
│   ├── index.html        # メインHTML
│   ├── style.css         # スタイルシート
│   └── script.js         # ゲームロジック
├── requirements.txt       # Python依存関係
├── .gitignore           # Git除外ファイル
└── README.md            # このファイル
```

## ローカルでの実行方法

### 1. バックエンド起動

```bash
# プロジェクトルートで実行
cd backend

# 仮想環境作成（任意）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r ../requirements.txt

# サーバー起動
python main.py
```

またはuvicornを直接使用：

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. フロントエンド表示

ブラウザで `frontend/index.html` を開くか、HTTPサーバーを起動：

```bash
cd frontend
python -m http.server 8080
```

その後 `http://localhost:8080` にアクセス。

## Renderへのデプロイ方法

### 1. GitHubにプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <あなたのGitHubリポジトリURL>
git push -u origin main
```

### 2. Render設定

**Web Service設定：**

- **Name**: `math-training-game`（任意）
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Static Site設定（フロントエンド）:**

- **Name**: `math-training-game-frontend`（任意）
- **Root Directory**: `frontend`
- **Publish Directory**: `.`

### 3. API URLの更新

デプロイ後、`frontend/script.js` のAPI_URLを更新：

```javascript
// const API_URL = "http://127.0.0.1:8000"; // ローカル確認用
const API_URL = "https://YOUR-BACKEND-URL.onrender.com"; // Renderデプロイ時にコメントアウトを解除
```

`YOUR-BACKEND-URL.onrender.com` を実際のRenderバックエンドURLに置き換えてください。

## APIエンドポイント

- `GET /` - API情報
- `GET /ranking` - トップ5ランキング取得
- `POST /submit` - スコア送信

## ゲームルール

1. スタートボタンでゲーム開始
2. 10問の計算問題を解く
3. タイムが計測される
4. 終了後、名前を入力してスコア保存
5. ランキングで順位確認

## 技術仕様

- **バックエンド**: FastAPI (Python)
- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **スタイル**: CSS Grid, Flexbox, CSS Variables
- **通信**: Fetch API
- **対応ブラウザ**: Chrome, Firefox, Safari, Edge（最新版）
