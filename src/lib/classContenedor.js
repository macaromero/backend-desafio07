class Contenedor {

    constructor(knex) {
        this.knex = knex;
        this.table = 'productos'
    };

    async getById(id) {
        try {
            return await this.knex(this.table).where("id", "=", id);
        } catch (error) {
            console.log("Ocurrió un error al realizar la búsqueda en la base de datos, volvé a intentarlo", error);
        };
    };

    async getAll() {
        const prodExists = await this.knex.schema.hasTable(this.table);
        if (!prodExists) {
            await this.knex.schema.createTable(this.table, table => {
                table.increments('id', {primaryKey: true}),
                table.string('title', 40).notNullable(),
                table.float('price').notNullable(),
                table.string('thumbnail', 7000).notNullable()
            });
        };

        try {
            let prod = await this.knex(this.table).select('*');
            if (prod.length != 0) {
                return prod;
            } else {
                return prod = []
            }
        } catch (error) {
            console.log("Ocurrió un error al realizar la búsqueda en la base de datos, volvé a intentarlo", error);
        };
    };

    async save (producto) {
        try {
            await this.knex(this.table).insert(producto);
        } catch (error) {
            console.log("Ocurrió un error al intentar almacenar el producto en la base de datos, volvé a intentarlo", error);
        };
    };

    async modify(obj) {    
        try {
            await this.knex(this.table).where("id", "=", obj.id).update(obj)
        } catch (error) {
            console.log("Ocurrió un error al intentar modificar el producto en la base de datos, volvé a intentarlo", error);
        };
    };

    async deleteById(id) {
        try {
            await this.knex(this.table).where("id", "=", id).del();
        } catch (error) {
            console.log("Ocurrió un error al intentar eliminar el producto de la base de datos, volvé a intentarlo", error);
        };
    };

    async deleteAll() {
        try {
            await this.knex(this.table).select("*").del();
        } catch (error) {
            console.log("Ocurrió un error al intentar eliminar todos los productos de la base de datos, volvé a intentarlo", error);
        };
    };
};

module.exports = Contenedor;