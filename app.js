//** IMPORT DEPENDENCIES 
const express = require('express');
const accountApp = express();

const port=8081;

const config = require("../efs/core/config/config.json");
const domains = config.domains;
const efsPaths=config.efsPaths;

const os = process.platform;
const efsPath = efsPaths[os];

//** Middleware Settings */
const middleware=require('./middleware')(accountApp);

const accountManagementRoutes=require(efsPath+'/accountManager/routes')(accountApp);

accountApp.listen(port,console.log("listening port "+port));