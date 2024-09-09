const mongoose = require('mongoose');
require('dotenv').config();

let MONGO_URI = `mongodb://${process.env.MONGO_HOSTNAME}/${process.env.MONGO_DB}`;

console.log("MONGO_URI ::::: ", MONGO_URI);

const connectToDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1); // Exit process if connection fails
    }
};

connectToDatabase();

mongoose.set("toJSON", {
    versionKey: false,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        if (doc.constructor.modelName === "User") {
            delete ret.password;
        }
        return ret;
    },
});
