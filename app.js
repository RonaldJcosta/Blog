const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const admin = require('./Routes/admin');
const path = require('path');
const mongoose =  require('mongoose');
const session = require('express-session')
const flash = require('connect-flash')
require('./Models/Postagem')
require('./Models/Categoria')

const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postangens')

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
app.get('/', (req, res) => {
    Postagem.find().populate("categoria").lean().sort({data: 'desc'}).limit(2).then((postagens) => {
        res.render("index", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect('/404')
    })
    
})

app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) =>{
        if(postagem){
            res.render('postagem/index',{postagem:postagem})
        }else{
            req.flash("error_msg", "Esta postagem não existe ou não foi encontrada!")
            res.redirect("/")
        }
    }).catch(err => {
        req.flash("error_msg", "Houve um erro interno ")
        res.redirect('/')
    })
})

app.get('/categorias', (req, res) => {
    Categoria.find().lean().then(categorias => {
        res.render("categoria/index", {categorias: categorias})
    }).catch(err => {
        req.flash("error_msg", "Houve um error o encontrar as categorias!")
        res.redirect("/")
    })
})

app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {

        if(categoria){
            Postagem.find({categoria:categoria._id}).lean().then(postagens => {

                res.render('categoria/postagens', {postagens: postagens, categoria: categoria})

            }).catch(err => {
                req.flash("error_msg", "Houve um erro ao listar posts")
                res.redirect('/')
            })

        }else {
            req.flash('error_msg', 'Esta categoria não existe ou não foi possível encontrar!')
            res.redirect('/')
        }

    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao tentar encontrar essa categoria " )
        res.redirect('/')
    })
})

app.get('/404', (req, res) => {
    res.send('Error: 404')
})


app.use('/admin', admin)

const PORT = 3333;
app.listen(PORT, ()=>{
    console.log("Server is running");
})