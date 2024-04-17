import React, { useState, useEffect } from "react";

const Card = (props) => {
    const [genreNames, setGenreNames] = useState([]);
    const [director, setDirector] = useState("");
    const [cast, setCast] = useState([]);
    useEffect(() => {
        let isMounted = true;
        const fetchGenres = async () => {
            try {
                const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=2dca580c2a14b55200e784d157207b4d&language=en-US`);
                const data = await response.json();
                const genres = data.genres;
                const genreNames = props.info.genre_ids.map(id => {
                    const genre = genres.find(genre => genre.id === id);
                    return genre ? genre.name : '';
                });
                if (isMounted) {
                    setGenreNames(genreNames);
                }
            } catch (error) {
                return;
            }
        };

        const fetchCredits = async () => {
            try {
                const { director, cast } = await props.fetchCredits(props.info.id);
                if (isMounted) {
                    setDirector(director);
                    setCast(cast);
                }
            } catch (error) {
                return;
            }
        };

        fetchGenres();
        fetchCredits();
        return () => {
            isMounted = false;
        };
    }, [props.info.id, props.fetchCredits]);

    const img_path = "https://image.tmdb.org/t/p/w500";
    const releaseYear = props.info.release_date ? props.info.release_date.slice(0, 4) : '';

    return (
        <div className="movie">
            <img src={img_path + props.info.poster_path} className="poster" alt="Movie Poster" />
            <div className="movie-details">
                <div className="box">
                    <h4 className="title">{props.info.title}</h4>
                    <p>{releaseYear}</p>

                </div>
                <div className="overview">
                    <h3>{props.info.title}  </h3>
                    <br />
                    <p>Overview</p>
                    {props.info.overview}
                    <br />
                    <br />
                    <p>Director: {director}</p>
                    <br />
                    <p>Genres: {genreNames.join(', ')}</p>
                    <br />
                    <p>Cast: {cast.join(', ')}</p>
                </div>
            </div>
        </div>
    );
};

export default Card;
