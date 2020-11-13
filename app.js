const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const admin = require('./Routes/admin');
const path = require('path');
const mongoose =  require('mongoose');
const session = require('express-session')
const flash = require('connect-flash')


const app = express()

//configurações
    //session
        app.use(session({
            secret: "cursonode",
            resave: true,
            saveUninitialized: true
        }))

        app.use(flash())
    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")

            next()
        })
    //Body-parser
        app.use(bodyParser.urlencoded({ extended: true}))
        app.use(bodyParser.json())
    //Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    //mongoose
        mongoose.connect('mongodb://localhost/blog', {
            useNewUrlParser: true,
            useUnifiedTopology:true,
            useFindAndModify: false,
            useCreateIndex: true
        })
//public
    app.use(express.static('public'));

//Rotas 
app.use('/admin', admin)

const PORT = 3333;
app.listen(PORT, ()=>{
    console.log("Server is running");
})