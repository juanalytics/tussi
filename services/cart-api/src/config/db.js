const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            retryReads: true,
            serverSelectionTimeoutMS: 5000,
            autoIndex: true,
            maxPoolSize: 10,
            minPoolSize: 5,
            auth: {
                username: process.env.MONGO_USER,
                password: process.env.MONGO_PASSWORD
            },
            authSource: "admin"
        };

        if (!process.env.MONGO_USER || !process.env.MONGO_PASSWORD) {
            throw new Error('Las variables de entorno MONGO_USER y MONGO_PASSWORD son requeridas');
        }

        const conn = await mongoose.connect(
            process.env.MONGO_URI,
            options
        );
        
        mongoose.connection.on('connected', () => {
            console.log(`MongoDB conectado: ${conn.connection.host}`);
        });

        mongoose.connection.on('error', (err) => {
            console.error('Error de conexión a MongoDB:', err);
            process.exit(1);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Desconectado de MongoDB');
        });

        return conn;
    } catch (error) {
        console.error(`Error de conexión a MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;