const express = require('express');
const bodyParser = require('body-parser');
const route = require('./route/route.js');
const multer= require('multer')
const { AppConfig } = require('aws-sdk');

const { default: mongoose } = require('mongoose'); 
const app = express();

app.use(bodyParser.json());
app.use(multer().any())
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://bushra:euVDEv190AGHYJDI@cluster0.nwfddcm.mongodb.net/group77Database?retryWrites=true&w=majority",{

    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
