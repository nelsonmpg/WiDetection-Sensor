/* global module, __dirname, process */

require('colors'); //bold, italic, underline, inverse, yellow, cyan, white, magenta, green, red, grey, blue, rainbow
var express = require('express');
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var r = require('rethinkdb');
var cp = require('child_process');
var ini = require('ini');
var connectdb = require("./ConnectDb");
var dbUsers = require('./db.js');
var osquerys = require("./linuxquery");

/**
 * Construtor do servidor HTTP
 * @param {type} configdb Consiguracao da base de dados
 * @returns {ServerHTTP}
 */
var ServerHTTP = function (configdb) {
  this.app = express();
  this.server = http.Server(this.app);
  this.port = 8080;
  this.dbConfig = configdb;
  // variavel de comunicacao com a base de dados
  this.dbData = {
    host: this.dbConfig.host,
    port: this.dbConfig.port,
    authKey: this.dbConfig.authKey
  };
};

/**
 * Inicia o servodor
 * @returns {undefined}
 */
ServerHTTP.prototype.start = function () {
  var self = this;
  self.server.listen(self.port);

  var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date');
    next();
  };

// Configura o servidor
  this.app.use(bodyParser.json({limit: '10mb'}));
  this.app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
  this.app.use(allowCrossDomain);

  // fornece ao cliente a pagina index.html
  this.app.use(express.static(__dirname + './../public'));

// Envia as configuracoes da base de dados para o script de coneccao com a base de dados
  connectdb.dbData = this.dbData;

// Envia as configuracoes da base de dados para o script de acesso aos dados dos useres
  dbUsers.dbData = this.dbData;

// Login do utilizador
  this.app.post("/login", dbUsers.loginUser);

// devolve a lista de sites existentes no servidor do login
  this.app.get("/getsitelist", dbUsers.getsitelist);

  // verifica se o caminho para uma diretoria existe
  this.app.get("/validpathsystem/:path", osquerys.validpathsystem);

// Consulta o SO para listar as interfaces wlan
  this.app.get("/dispOswlan", osquerys.getdispwlan);

// Consulta o SO para saber se existe a interface monitor criada
  this.app.get("/dispOsmon", osquerys.getdispmon);

// Devolve as configuracoes do ficheiro Ini
  this.app.get("/paramsinifile", osquerys.getinifileparams);

// Guarda as configuracoess no ficheiro Ini
  this.app.post("/savesettings", osquerys.savesettings);

// Constroi a interface monitor
  this.app.post("/createmonitor", osquerys.createmonitor);

// Inicia a interface monitor
  this.app.post("/startmonitor", osquerys.startmonitor);

// Para a interface monitor
  this.app.post("/stopmonitor", osquerys.stoptmonitor);

// Consulta o SO para saber se a interface monitor se encontra em funcionamento
  this.app.get("/checkmonitorstart", osquerys.checkmonitorstart);

// Reinicia o SO
  this.app.get("/restartsystem", osquerys.restartsystem);

// Desliga o SO
  this.app.get("/poweroffsystem", osquerys.poweroffsystem);

// Verifica se no ficheiro de configuracao foi selecionada a opcao de auto start
  this.checkServerSocketAutoStart();

  console.log("  __          ___ ______ _           _".green.bold);
  console.log("  \\ \\        / (_)  ____(_)         | |".green.bold);
  console.log("   \\ \\  /\\  / / _| |__   _ _ __   __| | ___ _ __".green.bold);
  console.log("    \\ \\/  \\/ / | |  __| | | '_ \\ / _` |/ _ \\ '__|".green.bold);
  console.log("     \\  /\\  /  | | |    | | | | | (_| |  __/ |".green.bold);
  console.log("      \\/  \\/   |_|_|    |_|_| |_|\\__,_|\\___|_|".green.bold);
  console.log('\nServer HTTP Wait %d'.green.bold, self.port);
};

/**
 * Verifica se no ficheiro de configuracao foi selecionada a opcao de auto start
 * @returns {undefined}
 */
ServerHTTP.prototype.checkServerSocketAutoStart = function () {
  var fileconfig = './ConfigSKT.ini';
  // verifica se o ficheiro de configuracao existe
  var configexist = checkconfigexist(fileconfig);

  // se o ficheiro existe 
  if (configexist) {
    var config = ini.parse(fs.readFileSync(fileconfig, 'utf-8'));
    if (config.global.autostart) {
      console.log("cfg - " + config.global.autostart);
      // vrifica a lista das interfaces wlan
      cp.exec("sudo ifconfig -a | grep 'wlan' | tr -s ' ' | cut -d' ' -f1,5", function (error, stdout, stderr) {
        console.log(stdout);
        var lanw = stdout.toString().split(" ")[0];
        // verifica se a interface monitor esta criada
        cp.exec("sudo ifconfig -a | grep 'mon' | tr -s ' ' | cut -d' ' -f1", function (error, stdout, stderr) {
          console.log(stdout);
          if (stdout.toString().trim() == "") {
            cp.exec("sudo airmon-ng start '" + lanw + "' | grep 'monitor' | tr -s ' '| cut -d' ' -f5", function (error, stdout, stderr) {
              console.log(stdout);
              if (error !== null) {
                console.log('exec error: ' + error);
              }
            });
          }
          // inicia o script de insercao na base de dados
          cp.fork('./lib/mainSKT.js');
          console.log("Start Monitor");
        });
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });
    }
  }
};

/**
 * Monitoriza o processo e para receber as informacoes para a criacao do servidor HTTP
 * @param {type} param1
 * @param {type} param2
 */
process.on("message", function (data) {
  var srv = new ServerHTTP(data.serverdata);
  srv.start();
});
module.exports = ServerHTTP;

/**
 * Verifica se o ficheiro existe
 * @param {type} file
 * @returns {Boolean}
 */
var checkconfigexist = function (file) {
  var config;
  try {
    // try to get the override configuration file if it exists
    fs.readFileSync(file);
    config = true;
  } catch (e) {
    // otherwise, node.js barfed and we have to clean it up
    // use the default file
    config = false;
  }
  return config;
};