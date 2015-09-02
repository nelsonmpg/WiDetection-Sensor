/* global module */

require('colors');
var cp = require('child_process');
var fs = require('fs');
var ini = require('ini');
var crypto = require('crypto');

/**
 * 
 * @returns {undefined}
 */
var Main = function () {
  var args;
  // Verifica se o ficheiro de ligacao com a base de dados para iniciar a comunicacao
  if (this.checkconfigexist('./MainConfig.ini')) {
    this.config2 = ini.parse(fs.readFileSync('./MainConfig.ini', 'utf-8'));
    // carrega as configuracoes do ficheiro ini para as variaveis
    args = {
      host: this.config2.database.host,
      port: this.config2.database.port,
      authKey: crypto.createHash('sha1').update(this.config2.database.projectname).digest('hex')
    };
    // inicia p script e envia as configuracores do ficheiro ini
    var child2 = cp.fork('./lib/serverHTTP');
    child2.send({"serverdata" : args});
    return;
  }
  console.log("MainConfig not exist ! ! !".red);
};

/**
 * Verifica se o ficheiro passdo por paramentro existe
 * @param {type} file
 * @returns {Boolean}
 */
Main.prototype.checkconfigexist = function (file) {
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

// Inicia o script Iniciaol
new Main();

module.exports = Main;