# Cine Node - AI Movie Recommender 🍿

Cine Node is an AI-powered movie recommendation engine built with a blazing fast FastAPI backend and a visually stunning, responsive Glassmorphism frontend (Vanilla HTML/CSS/JS).

## Features
- **AI Recommendations**: Get the top 10 most similar movie recommendations instantly based on a pre-computed Cosine Similarity matrix.
- **Top Trending**: Automatically fetch and display the Top 50 trending movies upon load.
- **Available to Stream**: A dedicated section to browse and discover movies that have direct streaming links.
- **Interactive UI**: Click on any movie card across the entire application to dynamically fetch new recommendations!
- **Zero Frontend Dependencies**: The beautiful UI was built from scratch without the overhead of heavy frontend frameworks.

---

## Setup & Installation

Follow these steps to clone and run the application on your local machine.

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd movie_recommender
```

### 2. Prepare the Datasets
This application requires two CSV files to function:
1. `movies_cleaned.csv`
2. `cosine_similarity.csv`

Open `main.py` and modify the `base_dir` variable to point to the absolute path of the directory where you have stored these dataset files:
```python
# main.py (Line 13)
base_dir = "/path/to/your/dataset/directory"
```

### 3. Set up a Virtual Environment
It is highly recommended to use a virtual environment to manage dependencies locally.
```bash
# Create the virtual environment
python3 -m venv venv

# Activate it (Linux/MacOS)
source venv/bin/activate

# Activate it (Windows)
# venv\Scripts\activate
```

### 4. Install Dependencies
Install the required Python packages (`fastapi`, `uvicorn`, `pandas`, and `numpy`):
```bash
pip install fastapi uvicorn pandas numpy
```

### 5. Run the Server
Launch the application using Uvicorn. The `--reload` flag ensures the server automatically restarts if you make changes to the code.
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 6. Enjoy!
Open your favorite web browser and navigate to:
👉 **[http://localhost:8000](http://localhost:8000)**

---

## File Structure

- `main.py`: The core FastAPI application handling data loading and API endpoints.
- `static/index.html`: The main user interface structure.
- `static/style.css`: The styling engine responsible for the premium glassmorphic aesthetics.
- `static/script.js`: The frontend logic handling search timeouts, DOM updates, and API calls.
