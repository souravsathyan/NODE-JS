const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

const app = require('./app')

// DB
mongoose.connect(process.env.MONGO_URL).then((connect) => {   
    console.log('DB connection successful');
});


app.listen(process.env.PORT || 3000, () => {
    console.log('server has started');
})