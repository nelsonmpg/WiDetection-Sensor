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
var manyLines = [];
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

// script que deteta alteracoes efectuadas no ficheiro especifico
  watcher.on('change', function (path) {
    manyLines = [];
    lineReader.eachLine(fileRead, function (line2) {
      manyLines.push(line2);
    }).then(function () {
      self.readAllLines(manyLines);
      console.log("I'm done!!");
    });
  });
};


ServerSocket.prototype.readAllLines = function (alllines) {
  var self = this;
  for (var i in alllines) {
    var line = alllines[i].slice();
    if (line[2] == ":" && line.length > 4) {
      var result = line.split(", ");
      if (numberIsMacAddress(result[0])) {
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
    }
  }
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

  this.serverSck.listen();
};

/**
 * Anvia os dados para a base de dados
 * @param {type} result
 * @returns {undefined}
 */
ServerSocket.prototype.sendToDataBase = function (result2) {
  var self = this;
  var result = result2.slice();

  // verificacao do tamanho do macaddress recebido
//  if (result[0].trim().length == 17) {
  if (result.length < 8) {

    var pwr = (typeof result[3] == "undefined") ? "" : result[3].trim();
    if ((pwr * 1) != -1 && !isNaN(pwr) && (pwr * 1) < 10 && (pwr * 1) > -140) {
      var valuesHst = result.slice();

      var mac = valuesHst[0];
      var bssid = (typeof valuesHst[5] == "undefined") ? "(notassociated)" : valuesHst[5].replace(/(,| |\r\n|\n|\r)/g, "");
      var probes = (typeof valuesHst[6] == "undefined") ? [] : valuesHst[6].replace(/(\r\n|\n|\r)/gm, "").split(",");

      dispmoveis.insertDispMovel(self.clienteSend, mac, pwr, bssid, probes);
      antdisp.insertAntDisp(self.clienteSend, mac, pwr, bssid);

    }
  } else if (result.length == 13 || result.length == 14 || result.length == 15) {
    // if de verificacao do tamanho do array < 8

    var pwr = (result.length == 14) ? ((typeof result[7] == "undefined") ? "-1" : result[7]) : ((typeof result[8] == "undefined") ? "-1" : result[8]);
    if ((pwr * 1) != -1 && !isNaN(pwr) && (pwr * 1) < 10 && (pwr * 1) > -140) {

      var chnl = valuesAp[3].trim();
      var spd = result[4].trim();
      if (!isNaN(spd) && !isNaN(chnl)) {
        var valuesAp = result.slice();
        var valsAp = result.slice();

        var mac = valuesAp[0];
        var priv = valuesAp[5].trim();
        var cphr = (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[0] == "undefined") ? "" : valuesAp[6].split(",")[0].trim()) : valuesAp[6].trim();
        var ath = (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[1] == "undefined") ? "" : valuesAp[6].split(",")[1].trim()) : valuesAp[7].trim();
        var essid = (valuesAp.length == 14) ? ((typeof valuesAp[12] == "undefined") ? "" : valuesAp[12].trim()) : ((typeof valuesAp[13] == "undefined") ? "" : valuesAp[13].trim());

        dispap.insertDispAp(valsAp, self.clienteSend, mac, pwr, chnl, priv, cphr, ath, essid, spd);
        antap.insertAntAp(valuesAp, self.clienteSend, mac, pwr, chnl, priv, cphr, ath, essid);

      }
    }
  } // else da verificacao do tamanho do arraymais de 8
//  } // fim verificacao do tamanho do macaddress
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
process.on('uncaughtException', function (err) {
  console.log('Excepcao capturada: ' + err);
});

var numberIsMacAddress = function (char) {
  var result = false;
  if (char.replace(/\s/g, "").length >= 17) {
    var urlPattern = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
    if (char.match(urlPattern)) {
      result = true;
    }
  }
  return result;
};

module.exports = ServerSocket;