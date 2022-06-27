const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const {options} = require("./config/mariaDB");
const knex = require("knex")(options);
const claseContenedor = require('./lib/classContenedor');
const claseProductos = new claseContenedor(knex);
const claseMensajes = require('./lib/classMensajes');
const claseChat = new claseMensajes(knex);
const PORT = 8080;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.sendFile(__dirname, "index.html");
});

// Rutas para probar métodos de la clase en postman
app.get('/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const producto = await claseProductos.getById(id);
        if (producto.length != 0) {
            res.json(producto)
        } else {
            res.json(`No se encontró producto con id ${id}`)
        }
    } catch (error) {
        res.json("Ocurrió un error", error)
    } 
})

app.put('/:id', async (req, res) => {
    const {id} = req.params;
    let product = await claseProductos.getById(id);
    const {title, price, thumbnail} = req.body;

    if(product.length != 0) {
        product = {
            id: id,
            title: title || product[0].title,
            price: price || product[0].price,
            thumbnail: thumbnail || product[0].thumbnail
        };
    
        await claseProductos.modify(product);
    
        try {
            res.status(200).json({
                "Estado": `Producto con id ${id} fue modificado correctamente`,
                "Producto": product
            });
        } catch (error) {
            res.status(500).json("Ocurrió un error", error);
        } 
    } else {
        res.status(404).json(`El producto con id ${id} no fue encontrado`);
    };
});

app.delete("/:id", async (req, res) => {
    const {id} = req.params;
    let product = await claseProductos.getById(id);

    if(product.length != 0) {
        await claseProductos.deleteById(id);
        try {
            res.status(200).json(`El Producto con id ${id} fue eliminado correctamente`);
        } catch (error) {
            res.status(500).json("Ocurrió un error", error);
        } 
    } else {
        res.status(404).json(`El producto con id ${id} no fue encontrado`);
    };
});

app.delete("/", async (req, res) => {
    await claseProductos.deleteAll();
    try {
        res.status(200).json("Todos los productos fueron eliminados correctamente");
    } catch (error) {
        res.status(500).json("Ocurrió un error", error);
    }
})


io.on('connection', async channel => {
    const getProducts = await claseProductos.getAll();
    const getMessages = await claseChat.getAll();

    channel.emit('tablaProductos', getProducts);
    channel.emit('chat', getMessages);

    channel.on('addProduct', async product => {
        await claseProductos.save(product);
        io.sockets.emit('tablaProductos', await claseProductos.getAll());
    });

    channel.on('addMsj', async msj => {
        await claseChat.save(msj);
        io.sockets.emit('chat', await claseChat.getAll());
    })

    
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});