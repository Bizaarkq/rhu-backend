const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
const mongo_url = process.env.MONGO_URL;
const mongo_user = process.env.MONGO_USERNAME;
const mongo_pass = process.env.MONGO_PASSWORD;
const routes = require('../app/routes');

class Server{
    constructor(){
        this.app = app;
        this.port = process.env.PORT || 3000;
        this.dbConnection();
        this.middlewares();
        this.routes();
    }

    listen(){
        this.app.listen(this.port, () => {
            console.log(`Server in ${this.port}`);
        });
    }

    middlewares(){
        const corsOptions = {
            origin: '*',
            optionsSuccessStatus: 200,
            methods: 'GET,PUT,POST'
        }

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cors(corsOptions));
        this.app.use(compression());
    }

    dbConnection(){
        mongoose.connect(`mongodb+srv://${mongo_user}:${mongo_pass}${mongo_url}`);
        let db = mongoose.connection;

        if (!db) {
            console.log("Error connecting db");
        } else {
            console.log("conexión exitosa a la DB");
        }
    }

    routes(){
        this.app.use('/', routes);
    }
}

module.exports = Server;