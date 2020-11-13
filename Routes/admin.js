const express =  require('express')
const router = express.Router()
const mongoose = require('mongoose')

require('../Models/Categoria')

const Categoria = mongoose.model('categorias')

router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/posts', (req, res) => {
    res.send('Pagina de posts')
})

router.get('/categorias', (req, res) => {
    Categoria.find().sort({date: 'desc'}).then(categorias => {
        res.render('admin/categorias', {categorias: categorias.map(categorias => categorias.toJSON())})
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
    
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addCategorias')
})

router.post('/categorias/nova', (req, res) => {

    var erros = []

    if(!req.body.nome ) {
        erros.push({texto: "Nome invalido"})
    }

    if(!req.body.slug) {
        erros.push({texto: "Slug invalido"})
    }


    if(erros.length > 0) {
        res.render("admin/addCategorias", { erros: erros })
    } else {

    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    }
    
    new Categoria(novaCategoria).save().then(() => {
        req.flash('success_msg', 'Categoria criada com sucesso!')
        res.redirect("/admin/categorias")
    }).catch(err => {
        req.flash('error_msg', 'Houve um erro ao tentar cadastrar um categoria')
        res.redirect("/admin")
    })
    }

})

router.get('/categorias/edit/:id',(req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then(categoria => {
        res.render('admin/editCategoria', {categoria: categoria})
    }).catch(err => {
        req.flash('error_msg',  'Não foi encontrado essa categoria')
        res.redirect('/admin/categorias')
    })
    
})

router.post('/categorias/edit', (req, res) => {
    Categoria.find({ _id: req.body.id }).then(categoria => {

        categoria.nome = req.body.nome,
        categoria.slug = req.body.slug

        categoria.save().then(() => {

            req.flash('success_msg', 'Editado com sucesso!')
            res.redirect('/admin/categorias')
        }).catch(err => {
            req.flash('error_msg', 'Houve um erro ao editar')
            res.redirect('/admin/categorias')
        })

    }).catch(err => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria')
    })
})

module.exports = router