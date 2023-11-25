const mongoose = require('mongoose')
const dotenv = require('dotenv')
const fs = require('fs')
const Movie = require('./../models/movieModel')
dotenv.config({path:'.config.env'})

mongoose.connect(process.env.MONGO_URL).then((connect) => {   
    console.log('DB connection successful');
});

const movies = JSON.parse(fs.readFileSync('./data/movies.json','utf-8'))

const deleteMovies = async ()=>{
    try {
        await Movie.deleteMany();
        console.log('Data successfully deleted');
    } catch (error) {
        console.log(error.message);
    }
}

const importMovies = async ()=>{
    try {
        await Movie.create(movies);
        console.log('Data successfully imported');
    } catch (error) {
        console.log(error.message);
    }
}

console.log(process.argv);