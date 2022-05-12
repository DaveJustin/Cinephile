const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');

require('dotenv').config({ path : './env' });

const errorMiddleware = require('./middlewares/errors');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(cookieParser());
app.use(fileUpload());

// Import routes here
const movies = require('./routes/movie');
const production = require('./routes/production');
const users = require('./routes/user');
const dashboard = require('./routes/dashboard');

app.use('/api/v1', movies);
app.use('/api/v1', production);
app.use('/api/v1', users);
app.use('/api/v1', dashboard);

var route, routes = [];
app._router.stack.forEach(function(middleware){
    if(middleware.route){ // routes registered directly on the app
        routes.push(middleware.route);
    } else if(middleware.name === 'router'){ // router middleware 
        middleware.handle.stack.forEach(function(handler){
            route = handler.route;
            route && routes.push(route);
        });
    }
});

app.use('/routes',(req,res,next) => {
    res.status(200).json({
        message:"OK"
    })
})

if (process.env.NODE_ENV === 'PRODUCTION') {
    app.use(express.static(path.join(__dirname, '../frontend/build')))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'))
    })
}

app.use(errorMiddleware);

module.exports = app