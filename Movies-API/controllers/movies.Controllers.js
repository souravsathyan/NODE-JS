const Movie = require('./../models/movieModel')
const ApiFeatures = require('../utils/api.featres')



const updateMovie = async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            })
        res.status(200).json({
            status: "success",
            data: {
                movie: updatedMovie
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        })
    }
}

const addMovie = async (req, res) => {
    try {
        const movie = await Movie.create(req.body)
        res.status(200).json({
            status: "success",
            data: {
                movie: movie
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        })
    }
}

const getMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id)
        res.status(200).json({
            status: "success",
            data: {
                movie: movie === null ? 'No movie found ' : movie
            }
        })
    } catch (error) {
        res.status(404).json({
            status: "fail",
            message: error.message
        })
    }
}

const getHighestRated = async (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratings'
    next()
}

const getAllMovies = async (req, res) => {
    try {
        const features = new ApiFeatures(Movie.find(), req.query).filter().sort().limitFields().pagination()
        let movies = await features.query
        
        
        res.status(200).json({
            status: "success",
            length: movies.length,
            data: {
                movies
            }
        })
    } catch (error) {
        res.status(404).json({
            status: "fail",
            message: error.message
        })
    }
}

const deleteMovie = async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: "success",
            data: {
                message: 'movie deleted successfully'
            }
        })
    } catch (error) {
        res.status(404).json({
            status: "fail",
            data: error.message
        })
    }
}

const getMovieStats=async (req,res)=>{
    try{
        const stats = await Movie.aggregate([
            {$match:{releaseYear:{$gte:2000}}},
            {$group:{
                _id:null,
                avgRating:{$avg:'$ratings'},
                avgPrice:{$avg:'$price'},
                minPrice:{$min:'$price'},
                maxPrice:{$max:'$price'}
            }}
        ])
        res.status(200).json({
            status: "success",
            data: {
                stats: stats
            }
        })
    }catch(err){
        res.status(404).json({
            status: "fail",
            data: error.message
        })
    }
}

const getMovieByGenre = async (req,res)=>{
    try {
        const genre = req.params.genre
        const movies =await Movie.aggregate([
            {$unwind:'$genres'},
            {$group:{
                _id:'$genres',
                movieCount:{$sum:1},
                movies:{$push:'$name'},
            }},
            {$addFields:{genre:"$_id"}},
            {$project:{_id:0}},
            {$sort:{movieCount:-1}},
            {$match:{genre:genre}}
        ])
        res.status(200).json({
            status: "success",
            data: {
                movies: movies
            }
        })
    } catch (error) {
        res.status(404).json({
            status: "fail",
            data: error.message
        })
    }
}



module.exports = {
    getAllMovies,
    getMovie,
    updateMovie,
    addMovie,
    deleteMovie,
    getHighestRated,
    getMovieStats,
    getMovieByGenre
}