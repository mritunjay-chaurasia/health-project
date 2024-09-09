const express = require('express');
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser');
const router = require('./src/router/router');
const routes = require('./src/router');
const mongodb = require("./src/config/db.config");
require('dotenv').config({ path: path.resolve(__dirname, 'src/.env') })
const PORT = process.env.PORT || 1002;
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, '../public/uploads')));
app.use(bodyParser.json());

// This will check which api  is called on which date
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} Request to ${req.url}`);
    next();
});


app.use('/api', routes);
app.use("/api", router);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost: ${PORT}`);
});