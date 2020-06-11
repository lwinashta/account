//** IMPORT DEPENDENCIES 
const express = require('express');
const accountApp = express();

const port=8081;

//** Middleware Settings */
const middleware=require('./middleware')(accountApp);

accountApp.listen(port,console.log("listening port "+port));