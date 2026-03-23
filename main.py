from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pandas as pd
import numpy as np
import os

app = FastAPI(title="Movie Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data
base_dir = r"C:\Users\vikra\cinenode"
movies_path = os.path.join(base_dir, "movies_cleaned.csv")
sim_path = os.path.join(base_dir, "cosine_similarity.csv")

try:
    df = pd.read_csv(movies_path)
    cosine_sim = pd.read_csv(sim_path).values  # convert to numpy array
except Exception as e:
    print(f"Error loading files: {e}")
    df = pd.DataFrame()
    cosine_sim = np.array([])


@app.get("/api/search")
def search_movies(query: str = ""):
    if query:
        query = query.lower()
        matches = df[df["title"].str.lower().str.contains(query, na=False)]
        result = matches["title"].head(10).tolist()
        return {"results": result}
    return {"results": []}

@app.get("/api/recommend")
def recommend_movies(title: str):
    if df.empty or cosine_sim.size == 0:
        raise HTTPException(status_code=500, detail="Data not loaded properly")

    movie_title = title.lower()

    # find index
    matches = df[df["title"].str.lower() == movie_title]

    if matches.empty:
        raise HTTPException(status_code=404, detail="Movie not found")

    idx = matches.index[0]

    scores = list(enumerate(cosine_sim[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    recommendations = []
    # get top 10
    for i in scores[1:11]:
        row = df.iloc[i[0]]
        rec = {
            "title": row["title"],
            "poster_path": row["poster_path"] if pd.notna(row["poster_path"]) else None,
            "homepage": row["homepage"] if pd.notna(row["homepage"]) else None,
            "overview": row["overview"] if pd.notna(row["overview"]) else "",
            "vote_average": row["vote_average"] if pd.notna(row["vote_average"]) else 0.0,
        }
        recommendations.append(rec)

    # Also return the searched movie info
    searched_row = df.iloc[idx]
    searched_info = {
        "title": searched_row["title"],
        "poster_path": searched_row["poster_path"] if pd.notna(searched_row["poster_path"]) else None,
        "homepage": searched_row["homepage"] if pd.notna(searched_row["homepage"]) else None,
        "overview": searched_row["overview"] if pd.notna(searched_row["overview"]) else "",
        "vote_average": searched_row["vote_average"] if pd.notna(searched_row["vote_average"]) else 0.0,
    }

    return {"searched": searched_info, "recommendations": recommendations}

@app.get("/api/top-movies")
def get_top_movies():
    if df.empty:
        return {"results": []}
    
    # Try to sort by popularity if available
    try:
        if "popularity" in df.columns:
            # Convert to numeric just in case
            df["popularity"] = pd.to_numeric(df["popularity"], errors="coerce")
            top_df = df.sort_values(by="popularity", ascending=False).head(50)
        else:
            top_df = df.head(50)
    except Exception as e:
        print(f"Sorting error: {e}")
        top_df = df.head(50)
        
    results = []
    for _, row in top_df.iterrows():
        rec = {
            "title": row["title"],
            "poster_path": row["poster_path"] if pd.notna(row["poster_path"]) else None,
            "homepage": row["homepage"] if pd.notna(row["homepage"]) else None,
            "overview": row["overview"] if pd.notna(row["overview"]) else "",
            "vote_average": row["vote_average"] if pd.notna(row["vote_average"]) else 0.0,
        }
        results.append(rec)
        
    return {"results": results}

@app.get("/api/watch-movies")
def get_watch_movies():
    if df.empty:
        return {"results": []}
    
    try:
        watch_df = df[df["homepage"].notna() & (df["homepage"] != "")]
        if "popularity" in watch_df.columns:
            watch_df["popularity"] = pd.to_numeric(watch_df["popularity"], errors="coerce")
            watch_df = watch_df.sort_values(by="popularity", ascending=False).head(50)
        else:
            watch_df = watch_df.head(50)
    except Exception as e:
        print(f"Sorting error: {e}")
        watch_df = df[df["homepage"].notna() & (df["homepage"] != "")].head(50)
        
    results = []
    for _, row in watch_df.iterrows():
        rec = {
            "title": row["title"],
            "poster_path": row["poster_path"] if pd.notna(row["poster_path"]) else None,
            "homepage": row["homepage"] if pd.notna(row["homepage"]) else None,
            "overview": row["overview"] if pd.notna(row["overview"]) else "",
            "vote_average": row["vote_average"] if pd.notna(row["vote_average"]) else 0.0,
        }
        results.append(rec)
        
    return {"results": results}

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_index():
    return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
