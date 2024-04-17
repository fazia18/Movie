import React, { useState, useEffect } from "react";
import InfiniteScroll from 'react-infinite-scroll-component';
import Card from "./Card";

const Main = () => {
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [genres, setGenres] = useState([]);
    const [search, setSearch] = useState("");
    const [notFound, setNotFound] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [currentYear, SetCurrentYear] = useState(2012);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchGenres();
        fetchMovies();
    }, []);

    useEffect(() => {
        if (selectedGenre !== null) {
            fetchMovies(selectedGenre);
        }
    }, [selectedGenre]);

    const fetchGenres = async () => {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=2dca580c2a14b55200e784d157207b4d&language=en-US`);
            const data = await response.json();
            setGenres(data.genres);
        } catch (error) {
            return;
        }
    };

    const fetchMovies = async (genreId) => {

        try {
            setLoading(true);
            const fetchMoviesByYear = async (year) => {
                try {
                    const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=2dca580c2a14b55200e784d157207b4d&sort_by=popularity.desc&primary_release_year=${year}&page=1&vote_count.gte=100${selectedGenre ? `&with_genres=${genreId}` : ''}`;
                    const response = await fetch(apiUrl);
                    const data = await response.json();
                    setLoading(false);
                    return data.results;
                } catch (error) {
                    return;
                }
            };

            const fetchMoviesFromYears = async () => {
                try {
                    const currentYear = new Date().getFullYear();
                    const years = Array.from({ length: currentYear - 2011 }, (_, index) => 2012 + index);

                    const moviesByYear = await Promise.all(years.map(fetchMoviesByYear));
                    const allMovies = moviesByYear.flat();
                    return allMovies;
                } catch (error) {
                    return;
                }
            };

            const movies = await fetchMoviesFromYears();
            setMovies(movies);
            setLoading(false);

        } catch (error) {
            return error;
        }
    };

    const fetchMoreMovies = async () => {
        try {
            setLoading(true);
            const fetchMoviesByYear = async (year) => {
                try {
                    const apiUrl = `https://api.themoviedb.org/3/discover/movie?primary_release_year=${year}&with_genres=${selectedGenre}&sort_by=popularity.desc&api_key=2dca580c2a14b55200e784d157207b4d&language=en-US`;
                    const response = await fetch(apiUrl);
                    const data = await response.json();
                    return data.results;
                } catch (error) {
                    return [];
                }
            };

            const currentYear = new Date().getFullYear();
            const moviesByYear = await fetchMoviesByYear(currentYear - page);

            if (moviesByYear.length === 0) {
                setHasMore(false);
            } else {
                setMovies(prevMovies => [...prevMovies, ...moviesByYear]);
                setPage(prevPage => prevPage + 1);
            }
        } catch (error) {
            return error;
        }
    };

    const searchMovie = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=2dca580c2a14b55200e784d157207b4d&query=${search}`);
            const data = await response.json();
            setSearch("");
            setPage(1);
            setHasMore(true);
            setNotFound(false);
            if (data.results.length === 0) {
                setNotFound(true);
            } else {
                setMovies(data.results);
            }
            setSelectedGenre(null);
        } catch (error) {
            return;
        } finally {
            setLoading(false);
        }
    };

    const handleGenreClick = async (genreId) => {
        setSelectedGenre(genreId);
        setMovies([]);
        setNotFound(false);
        try {
            const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=2dca580c2a14b55200e784d157207b4d&with_genres=${genreId}`);
            const data = await response.json();
            if (data.results.length === 0) {
                setNotFound(true);
            } else {
                setMovies(data.results);
            }
        } catch (error) {
            return;
        }
    };



    const fetchCredits = async (movieId) => {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=2dca580c2a14b55200e784d157207b4d&language=en-US`);
            const data = await response.json();
            const director = data.crew.find(member => member.job === 'Director');
            const cast = data.cast.slice(0, 5).map(member => member.name);
            return { director: director ? director.name : '', cast };
        } catch (error) {
            return { director: '', cast: [] };
        }
    };

    return (
        <>
            <div className="header">
                <h1 className="movieheader">Moviefix</h1>
                <nav>
                    <ul>
                        {genres.map((genre) => (
                            <li key={genre.id}>
                                <button
                                    className={`btn ${selectedGenre === genre.id ? 'selected' : ''}`}
                                    onClick={() => handleGenreClick(genre.id)}
                                >
                                    {genre.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="search-btn">
                    <input
                        type="text"
                        placeholder="Enter Movie Name"
                        className="inputText"
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />
                    <button onClick={searchMovie}>
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>
            <div className="container">
                {notFound ? (
                    <h2>No movies found</h2>
                ) : (
                    <InfiniteScroll
                        dataLength={movies.length}
                        next={fetchMoreMovies}
                        hasMore={hasMore}
                        loader={<h4>Loading...</h4>}
                        scrollableTarget="container"
                    >
                        <div className="card-grid">
                            {movies.map((movie, index) => (
                                <div className="card" key={movie.id}>
                                    <Card
                                        info={movie}
                                        fetchCredits={fetchCredits}
                                    />
                                </div>
                            ))}
                        </div>
                    </InfiniteScroll>
                )}
            </div>
        </>
    );

};

export default Main;
