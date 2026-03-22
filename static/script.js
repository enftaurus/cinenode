const searchInput = document.getElementById('movie-search');
const autocompleteList = document.getElementById('autocomplete-list');
const searchBtn = document.getElementById('search-btn');
const loader = document.getElementById('loader');
const resultsSection = document.getElementById('results-section');
const errorMessage = document.getElementById('error-message');
const searchedMovieCard = document.getElementById('searched-movie-card');
const recommendationsGrid = document.getElementById('recommendations-grid');
const topMoviesSection = document.getElementById('top-movies-section');
const topMoviesGrid = document.getElementById('top-movies-grid');
const homeBtn = document.getElementById('home-btn');
const watchMoviesGrid = document.getElementById('watch-movies-grid');

let debounceTimer;

document.addEventListener('DOMContentLoaded', () => {
    fetchTopMovies();
    fetchWatchMovies();
});

async function fetchTopMovies() {
    try {
        const response = await fetch('/api/top-movies');
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            topMoviesGrid.innerHTML = '';
            data.results.forEach((movie, index) => {
                appendMovieCard(topMoviesGrid, movie, index);
            });
        }
    } catch (err) {
        console.error("Failed to fetch top movies:", err);
    }
}

async function fetchWatchMovies() {
    try {
        const response = await fetch('/api/watch-movies');
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            watchMoviesGrid.innerHTML = '';
            data.results.forEach((movie, index) => {
                appendMovieCard(watchMoviesGrid, movie, index);
            });
        }
    } catch (err) {
        console.error("Failed to fetch watch movies:", err);
    }
}

searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        autocompleteList.classList.add('hidden');
        return;
    }
    
    debounceTimer = setTimeout(() => {
        fetchAutocomplete(query);
    }, 300);
});

async function fetchAutocomplete(query) {
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        autocompleteList.innerHTML = '';
        if (data.results && data.results.length > 0) {
            data.results.forEach(movie => {
                const li = document.createElement('li');
                li.textContent = movie;
                li.addEventListener('click', () => {
                    searchInput.value = movie;
                    autocompleteList.classList.add('hidden');
                    getRecommendations(movie);
                });
                autocompleteList.appendChild(li);
            });
            autocompleteList.classList.remove('hidden');
        } else {
            autocompleteList.classList.add('hidden');
        }
    } catch (err) {
        console.error("Autocomplete error:", err);
    }
}

// close autocomplete when clicking outside
document.addEventListener('click', (e) => {
    if (e.target !== searchInput && e.target !== autocompleteList) {
        autocompleteList.classList.add('hidden');
    }
});

searchBtn.addEventListener('click', () => {
    const movie = searchInput.value.trim();
    if (movie) {
        getRecommendations(movie);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const movie = searchInput.value.trim();
        if (movie) {
            autocompleteList.classList.add('hidden');
            getRecommendations(movie);
        }
    }
});

function getImageUrl(path) {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Poster+Found';
    // Sometimes paths from CSV might already contain the full URL, just in case
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w500${path}`;
}

function processRating(rating) {
    if (!rating) return 'N/A';
    return Number(rating).toFixed(1) + '/10';
}

function createMovieCard(movie) {
    const posterUrl = getImageUrl(movie.poster_path);
    const rating = processRating(movie.vote_average);
    
    const watchLinkHtml = movie.homepage 
        ? `<a href="${movie.homepage}" target="_blank" class="watch-btn"><i class="fa-solid fa-play"></i> Watch Now</a>` 
        : '';

    return `
        <img src="${posterUrl}" alt="${movie.title} Poster" class="movie-poster" onerror="this.src='https://via.placeholder.com/500x750?text=Image+Error'">
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-meta">
                <span><i class="fa-solid fa-star"></i> ${rating}</span>
            </div>
            <p class="movie-overview">${movie.overview}</p>
            ${watchLinkHtml}
        </div>
    `;
}

function appendMovieCard(grid, movie, index, isFeatured = false) {
    const card = document.createElement('div');
    if (isFeatured) {
        card.className = `movie-card featured`;
    } else {
        card.className = `movie-card`;
        card.style.animation = `fadeInUp 0.5s ease-out ${Math.min(index * 0.05, 1)}s both`;
    }
    
    card.innerHTML = createMovieCard(movie);
    
    // Add interactivity
    card.style.cursor = 'pointer';
    card.title = `Click to find recommendations for ${movie.title}`;
    
    card.onclick = (e) => {
        // Prevent trigger if they click the watch link
        if (!e.target.closest('.watch-btn')) {
            searchInput.value = movie.title;
            getRecommendations(movie.title);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    // For featured card, append it directly without grid
    if (isFeatured) {
        grid.innerHTML = '';
        grid.appendChild(card);
    } else {
        grid.appendChild(card);
    }
}

async function getRecommendations(title) {
    if (topMoviesSection) topMoviesSection.classList.add('hidden');
    loader.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    errorMessage.classList.add('hidden');
    
    try {
        const response = await fetch(`/api/recommend?title=${encodeURIComponent(title)}`);
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Error finding recommendations");
        }
        
        const data = await response.json();
        
        // Render searched movie
        appendMovieCard(searchedMovieCard, data.searched, 0, true);
        
        // Render recommendations
        recommendationsGrid.innerHTML = '';
        data.recommendations.forEach((movie, index) => {
            appendMovieCard(recommendationsGrid, movie, index);
        });
        
        resultsSection.classList.remove('hidden');
        
        // Scroll to results smoothly
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
    } catch (err) {
        console.error("Failed to get recs:", err);
        errorMessage.textContent = err.message;
        errorMessage.classList.remove('hidden');
    } finally {
        loader.classList.add('hidden');
    }
}

if (homeBtn) {
    homeBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        errorMessage.classList.add('hidden');
        searchInput.value = '';
        if (topMoviesSection) {
            topMoviesSection.classList.remove('hidden');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
