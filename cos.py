import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load dataset
df = pd.read_csv("movies_cleaned.csv")  # change filename if needed

# Fill NaN values with empty string
df = df.fillna("")

# Combine relevant columns into one string
features = [
    "keywords",
    "genres",
    "overview",
    "tagline",
    "director",
    "production_companies",
    "credits_cast"
]

def combine_features(row):
    return " ".join([str(row[feature]) for feature in features])

df["combined"] = df.apply(combine_features, axis=1)

# Convert text to TF-IDF vectors
vectorizer = TfidfVectorizer(stop_words="english")
tfidf_matrix = vectorizer.fit_transform(df["combined"])

# Compute cosine similarity matrix
cosine_sim = cosine_similarity(tfidf_matrix)

# Convert to DataFrame for saving
cosine_df = pd.DataFrame(cosine_sim)

# Save to CSV
cosine_df.to_csv("cosine_similarity.csv", index=False)

print("✅ Cosine similarity matrix saved to cosine_similarity.csv")