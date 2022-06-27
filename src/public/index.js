const socket = io();
const addProduct = document.querySelector('#addProductForm');
const newMessage = document.querySelector('#newMessageForm');

addProduct.addEventListener('submit', e => {
    e.preventDefault();
    const product = {
        title: addProduct[0].value,
        price: addProduct[1].value,
        thumbnail: addProduct[2].value
    };

    socket.emit('addProduct', product);
    addProduct.reset();
});

socket.on('tablaProductos', productos => {
    hbsTable(productos)
        .then(html => {
            document.querySelector('#tabla').innerHTML = html;
        });
});

const hbsTable = (productos) => {
    return fetch('hbs/table.handlebars')
        .then(res => res.text())
        .then(table => {
            let exists = true;
            const hbs = Handlebars.compile(table);
            if (productos.length === 0) {
                exists = false;
            };

            const html = hbs({productos, exists});
            return html;
        });
};

newMessage.addEventListener('submit', e => {
    e.preventDefault();

    if (((!newMessage[0].value) && (!newMessage[1].value)) || ((!newMessage[0].value) || (!newMessage[1].value))) {
        alert("Necesitás completar los campos para poder usar el chat");
    } else {
        const msj = {
            mail: newMessage[0].value,
            date: new Date().toLocaleString('es-AR'),
            message: newMessage[1].value,
        };
        socket.emit('addMsj', msj);
        newMessage.reset();
    }
});

socket.on('chat', msj => {
    hbsChat(msj)
        .then(html => {
            document.querySelector('#chat').innerHTML = html;
        });
});

const hbsChat = (msj) => {
    return fetch('hbs/chat.handlebars')
        .then(res => res.text())
        .then(chat => {
            const hbs = Handlebars.compile(chat);
            const html = hbs({msj});
            return html;
        });
};


