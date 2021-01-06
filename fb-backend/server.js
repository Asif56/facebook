const express=require('express')
const mongoose=require('mongoose')
const cors =require('cors')
const Grid =require('gridfs-stream')
const multer =require('multer')
const GridFsStorage=require('multer-gridfs-storage')
const bodyParser=require('body-parser')
const path=require('path')
const Pusher= require('pusher')
const dbModel=require('./mongoPost');

Grid.mongo=mongoose.mongo

//app config
const app=express()
const port =process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1133629",
    key: "839189115ba5ec11ad4d",
    secret: "b7165fa1198213b78621",
    cluster: "ap2",
    useTLS: true
  });

//middleware

app.use(bodyParser.json())
app.use(cors());
//db config

const mongoURI='mongodb+srv://admin:bxHnFXs3ZQfo1NTC@cluster0.cp2uk.mongodb.net/fbdb?retryWrites=true&w=majority'

const conn=mongoose.createConnection(mongoURI,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})
mongoose.connect(mongoURI,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

mongoose.connection.once('open',()=>{
    console.log('DB connected')
    
    const changeStream=mongoose.connection.collection('posts').watch()
    changeStream.on('change',(change)=>{
        console.log(change)
        if(change.operationType==='insert'){
            console.log("Trigring Pusher")
            pusher.trigger('posts','inserted',{
                change:change
            })
        }else{
            console.log("Error triggring pusher")
        }
    })
})

let gfs
conn.once('open',()=>{
    console.log('DB connected')
   gfs= Grid(conn.db ,mongoose.mongo)
   gfs.collection('images')
})

const storage=new GridFsStorage({
     url:mongoURI,
     file:(req,file)=>{
         return new Promise((resolve,reject)=>{{
             const filename=`image-${Date.now()}${path.extname(file.originalname)}`

             const fileInfo={
                 filename:filename,
                 bucketName:'images'
             }
             resolve(fileInfo)
         }});
     }

});

const upload = multer({ storage })


//app routes
app.get('/',(req,res)=>res.status(200).send('hello world') )

app.post('/upload/image',upload.single('file'),(req,res)=>{
    res.status(201).send(req.file)
})

app.post('/upload/post',(req,res)=>{
   const dbPost= req.body
   dbModel.create(dbPost,(err,data)=>{
       if(err){
           res.status(500).send(err)
       }else{
           res.status(201).send(data)
       }
   })
})

app.get('/retrieve/posts',(req,res)=>{
    // const dbPost= req.body
    dbModel.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
           data.sort((b ,a)=>{
               return a.timestamp - b.timestamp;
           });
           res.status(200).send(data)
        }
    })
 })
 
app.get('/retrieve/image/single',(req, res) => {
    gfs.files.findOne({ filename:req.query.name }, (err, filename)=>{
        if(err){
            res.status(500).send(err)
        }else{
            if( !filename || filename.length === 0){
                res.status(404).json({ err:'file not found' })
            }else{

               const readstream= gfs.createReadStream(filename.filename)
               readstream.pipe(res);
            }
        }
    })
})



app.listen(port,()=>console.log('listening on localhost'))

// bxHnFXs3ZQfo1NTC