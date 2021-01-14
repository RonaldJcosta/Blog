const express =  require('express')
const router = express.Router()
const mongoose = require('mongoose')

require('../Models/Categoria')
require('../Models/Postagem')

const Postagem = mongoose.model('postangens')
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

router.post('/categorias/deletar/:id', (req, res) => {
    Categoria.findOneAndDelete({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Post apagado com sucesso!');

        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar o post');

        res.redirect('/admin/categorias')
    })
})    

router.get('/postagens', (req, res) => {

    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) =>{
        res.render('admin/postagens', {postagens: postagens})
    }).catch(error => {
        req.flash("eerror_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })

    
})

router.get('/postagens/add', (req, res) => {

    Categoria.find().lean().then(categorias => {
        res.render('admin/addPostagem', {categorias: categorias})
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário.")
        res.redirect("/admin")
    })
    
})

router.post('/postagem/nova', (req, res) => {
    let erros = []

    if(req.body.categoria == '0'){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addPostagem", {erros: erros})
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a postagem")
            res.redirect("/admin/postagens")
        })

    }
})

router.get("/postagens/edit/:id", (req, res) => {

    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {

            res.render("admin/editpostagens", {categorias: categorias, postagem:postagem})

        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagem/edit", (req, res) => {
    
    Postagem.findOne({ _id:req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "As informações foram atualizadas com sucesso")
            res.redirect("/admin/postagens")
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro ao salvar as informações")
            res.redirect("/admin/postagens")
        })

    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao atualizar as informações")
        res.redirect("/admin/postagens")
    })

})

router.get("/postagens/deletar/:id", (req, res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a postagem!")
        res.redirect("/admin/postagens")
    })
})

module.exports = router