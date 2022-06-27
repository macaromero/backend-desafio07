class Mensajes {

    constructor(knex) {
        this.knex = knex;
        this.table = 'mensajes'
    };

    async save (mensaje) {
        try {
            await this.knex(this.table).insert(mensaje); 

        } catch (error) {
            console.log("Ocurrió un error al intentar almacenar el mensaje en la base de datos, volvé a intentarlo", error);
        };
    };

    async getAll() {
        const msjsExists = await this.knex.schema.hasTable(this.table);
        if (!msjsExists) {
            await this.knex.schema.createTable(this.table, table => {
                table.increments('id', {primaryKey: true}),
                table.string('mail', 40).notNullable(),
                table.string('date', 500).notNullable(),
                table.string('message', 500).notNullable()
            });
        };

        try {
            let msjs = await this.knex(this.table).select('*');
            if (msjs.length != 0) {
                return msjs;
            } else {
                return msjs = [];
            };
        } catch (error) {
            console.log("Ocurrió un error al realizar la búsqueda en la base de datos, volvé a intentarlo", error);
        };
    };
};

module.exports = Mensajes;