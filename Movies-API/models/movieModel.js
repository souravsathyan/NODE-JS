const mongoose = require('mongoose')
const fs = require('fs')

const movieSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required'],
        unique:true,
        trim:true
    },
    description:{
        type:String,
        required:[true,'Name is required'],
        trim:true
    },
    duration:{
        type:Number,
        required:[true,'Duration is required']
    },
    ratings:{
        type:String,
    },
    totalRatings:{
        type:Number,
    },
    releaseYear:{
        type:Number,
        required:[true,'release year is required']
    },
    releaseDate:{
        type:Date
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    genres:{
        type:[String],
        required:[true,'Genres is required']
    },
    directors:{
        type:[String],
        required:[true,'Director is required field']
    },
    coverImage:{
        type:String,
        required:[true,"Cover image is required field"]
    },
    actors:{
        type:[String],
        required:[true,'Actors field is required field']
    },
    price:{
        type:Number,
        require:[true,'Price is required field']
    },
    createdBy:String
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

movieSchema.pre('save',function(next){
    this.createdBy = 'SOURAV'
    next()
})

movieSchema.post('save',function(doc,next){
    const content = `A new movie document with name ${doc.name} has been created by`
    fs.writeFileSync('./Log/log.txt',content,{flag:'a'},(err)=>{
        console.log(err.message);
    })
})

movieSchema.virtual('durationInHours').get(function(){
    return this.duration/60
})

movieSchema.pre(/^find/, function(next){
    this.find({releaseDate : {$lte:Date.now()}})
    this.startTime = Date.now()
    next()
})

movieSchema.post(/^find/, function(docs,next){
    this.find({releaseDate : {$lte:Date.now()}})
    this.endTime = Date.now()
    const content = `Query took ${this.endTime-this.startTime}mm to fetch data`
    fs.writeFileSync('./Log/log.txt',content,{flag:'a'},(err)=>{
        console.log(err.message);
    })
    next()
})

const Movie = mongoose.model('Movie', movieSchema)

module.exports=Movie