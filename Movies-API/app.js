//IMPORT PACKAGE
const express = require('express');
const moviesRouter = require('./Routes/moviesRoutes');
const CustomError = require('./Utils/CustomError');
const globalErrorHandler = require('./Controllers/errorController')
const authRouter = require('./Routes/authRouter')

let app = express();

app.use(express.json());

app.use(express.static('./public'))

//USING ROUTES


app.use('/api/v1/movies', moviesRouter);
app.use('/api/v1/users', authRouter);

app.all('*', (req, res, next) => {
    const err = new CustomError(`Can't find ${req.originalUrl} on the server!`, 404);
    next(err);
});

app.use(globalErrorHandler);

module.exports = app;

