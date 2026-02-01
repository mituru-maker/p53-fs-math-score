from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import time

app = FastAPI()

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 全てのオリジンを許可
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ランキングデータ（メモリ上に保存）
rankings = []

class Score(BaseModel):
    name: str
    time: float

@app.get("/")
async def root():
    return {"message": "Math Training Game API"}

@app.get("/ranking")
async def get_ranking():
    # タイムが速い順（小さい値）にソートしてトップ5を返す
    sorted_rankings = sorted(rankings, key=lambda x: x["time"])[:5]
    return {"rankings": sorted_rankings}

@app.post("/submit")
async def submit_score(score: Score):
    # 新しいスコアを追加
    rankings.append({"name": score.name, "time": score.time})
    
    # 上位5位以内に入ったかチェック
    sorted_rankings = sorted(rankings, key=lambda x: x["time"])[:5]
    is_top5 = any(r["name"] == score.name and r["time"] == score.time for r in sorted_rankings)
    
    return {
        "message": "Score submitted successfully!",
        "is_top5": is_top5,
        "current_rankings": sorted_rankings
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
