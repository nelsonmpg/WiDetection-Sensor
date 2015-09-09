/* global process, module, assert, result */

require('colors');
var cp = require('child_process');
var net = require('net');
var r = require('rethinkdb');
var fs = require('fs');
var jsdiff = require('diff');
var chokidar = require('chokidar');
var lineReader = require('line-reader');
var shellInterval = require("shell-interval");
var localTable = [];
var fileRead = '/scanNetworks-01.csv';
var folderroot = "";

/**
 * Configuracao do script que detecta alteracoes no ficheiro retendido 
 * @type @exp;chokidar@call;watch
 */
var watcher;

// script de copneccao com a base de daods
var connectdb = require("./ConnectDb");

// scripts para enviar os dados para a base de dados
var dispmoveis = require("./DispMoveis");
var antdisp = require("./AntDisp");
var dispap = require("./DispAp");
var antap = require("./AntAp");
var activeant = require("./ActiveAnt");

/**
 * Construtor do Servidor
 * @param {type} port
 * @param {type} configdb
 * @param {type} sensorcfg
 * @returns {ServerSocket}
 */
var ServerSocket = function (port, configdb, sensorcfg) {
  this.port = port;
  this.net = require('net');
  this.serverSck = net.createServer(this.net);
  this.clienteSend = sensorcfg.name;
  this.lati = sensorcfg.lati;
  this.long = sensorcfg.long;
  this.local = sensorcfg.loc;
  this.posx = sensorcfg.posx;
  this.posy = sensorcfg.posy;
  this.plant = sensorcfg.plant;
  this.scanStart = false;
  this.dbConfig = configdb;
  
  fileRead = folderroot + fileRead;
  console.log(fileRead);
  watcher = chokidar.watch(fileRead, {
  ignored: /[\/\\]\./,
  persistent: true
}); //filefolder

// consiguracao dod acesso a base de dados
  this.dbData = {
    host: this.dbConfig.host,
    port: this.dbConfig.port,
    authKey: this.dbConfig.authKey
  };

// envia as defenicoes de acesso a base de dados para os varios scripts
  connectdb.dbData = this.dbData;
  antdisp.dbData = this.dbData;
  antap.dbData = this.dbData;
  dispmoveis.dbData = this.dbData;
  dispap.dbData = this.dbData;
  activeant.dbData = this.dbData;
  
  // envia as definicoes da base de dados
  antdisp.dbConfig = this.dbConfig;
  antap.dbConfig = this.dbConfig;
  dispmoveis.dbConfig = this.dbConfig;
  dispap.dbConfig = this.dbConfig;
  activeant.dbConfig = this.dbConfig;

  var self = this;

// Configuracao do intervalo que executa o script para sabera memoria, 
// o cpu e o disco utilizado pelo SO do sensor
  shellInterval({
    options: {
      command: "./serverStatus.sh",
      time: 5
    },
    onExec: function (err, stdout, stderr) {
      if (err) {
        throw err;
      }
      var outres = stdout.split("\n");
      var memarr = outres[0].split(" ");
      var discarr = outres[2].split(" ");
      var mem = {
        total: memarr[0],
        used: memarr[1],
        free: memarr[2]
      };
      var disc = {
        size: discarr[0],
        used: discarr[1],
        avail: discarr[2],
        use: discarr[3]
      };
      var cpu = outres[1];

      activeant.updateActiveAnt(self.clienteSend, mem, cpu, disc);
      console.log('--------------------------------------------------------');
    },
    onFinish: function () {
      console.log("The shell command was called five times. Exiting...");
    }
  });
};

/**
 * Inicia o servidor 
 * @returns {undefined}
 */
ServerSocket.prototype.start = function () {
  var self = this;
  
  console.log("Start socket watcher.");
  // insere ou atualiza o sensor
  activeant.insertActiveAnt(self.clienteSend, self.lati, self.long, self.local, self.posx, self.posy);
  
  // insere ou atualiza a planta 
  activeant.insertPlant(self.clienteSend, self.plant);

// script que deteta alteracoes efectuadas no ficheiro especifico
  watcher.on('change', function (path) {
    lineReader.eachLine(fileRead, function (line) {
      if (line[2] == ":" && line.length > 4) {
        var result = line.split(", ");
        var oldLine = localTable[result[0]];
        if (oldLine) {
          var a = result.slice();
          
          // verifica se duas strings sao iguais
          var diff = jsdiff.diffTrimmedLines(oldLine, line);
          diff.forEach(function (part) {
            if (part.added) {
              localTable[a[0]] = line;
              self.sendToDataBase(a);
            }
          });
        } else {
          var b = result.slice();
          localTable[b[0]] = line;
          self.sendToDataBase(b);
        }
      }
    }).then(function () {
      console.log("I'm done!!");
    });
  });
  this.serverSck.listen();
};

/**
 * Anvia os dados para a base de dados
 * @param {type} result
 * @returns {undefined}
 */
ServerSocket.prototype.sendToDataBase = function (result) {
  var self = this;
  
  // verificacao do tamanho do macaddress recebido
  if (result[0].trim().length == 17) { 
    if (result.length < 8) {
      var valsHost = result.slice();
      var valuesHst = result.slice();

      dispmoveis.insertDispMovel(valsHost, self.clienteSend);
      antdisp.insertAntDisp(valuesHst, self.clienteSend);

    } else if (result.length == 13 || result.length == 14 || result.length == 15) {
      // if de verificacao do tamanho do array < 8

      var valsAp = result.slice();
      var valuesAp = result.slice();

      dispap.insertDispAp(valsAp, self.clienteSend);
      antap.insertAntAp(valuesAp, self.clienteSend);

    } // else da verificacao do tamanho do arraymais de 8
  } // fim verificacao do tamanho do macaddress
};

/**
 * Recebe os argumentos pela comunicacao do processo
 * @param {type} param1
 * @param {type} param2
 */
process.on("message", function (data) {
  folderroot = data.filefolder;
  cp.spawn("./runAirmon", [folderroot, "&"]);
  var serverskt = new ServerSocket(data.port, data.configdb, data.sensorcfg);
  serverskt.start();
});
//excepcoes para os erros encontrados
//process.on('uncaughtException', function (err) {
//    console.log('Excepcao capturada: ' + err);
//});
module.exports = ServerSocket;