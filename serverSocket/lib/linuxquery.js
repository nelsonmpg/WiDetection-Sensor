/* global module */

require('colors');
var cp = require('child_process');
var fs = require('fs');
var ini = require('ini');
var Worker = require('workerjs');

module.exports.validpathsystem = function (req, res) {
    var pathfile = req.params.path.replace(/§/g, "/").replace("£", ".");
    fs.exists(pathfile, function (exists) {
        res.send(exists);
    });
};

/**
 *  Consulta o SO para listar as interfaces wlan
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getdispwlan = function (req, res) {
    cp.exec("sudo ifconfig -a | grep 'wlan' | tr -s ' ' | cut -d' ' -f1,5", function (error, stdout, stderr) {
        res.json(stdout);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
};

/**
 * Consulta o SO para saber se existe a interface monitor criada
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getdispmon = function (req, res) {
    cp.exec("sudo ifconfig -a | grep 'mon' | tr -s ' ' | cut -d' ' -f1", function (error, stdout, stderr) {
        res.json(stdout);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
};

/**
 * Consulta o SO para saber se a interface monitor se encontra em funcionamento
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.checkmonitorstart = function (req, res) {
    cp.exec("ps aux | grep 'air' | grep -v 'color' | grep -v 'grep'", function (error, stdout, stderr) {
        res.json(stdout);
    });
};

/**
 * Constroi a interface monitor
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.createmonitor = function (req, res) {
    console.log("Create Monitor");
    // para executar este comando e necessario adicionar previlegios de root ao utilizador
    cp.exec("sudo airmon-ng start '" + req.body.wifi + "' | grep 'monitor' | tr -s ' '| cut -d' ' -f9", function (error, stdout, stderr) {
        res.json(stdout);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
};

/**
 * Devolve as configuracoes do ficheiro Ini
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getinifileparams = function (req, res) {
    var fileconfig = './ConfigSKT.ini';
    var configexist = checkconfigexist(fileconfig);
    var datavals = [];
    if (configexist) {
        var config = ini.parse(fs.readFileSync(fileconfig, 'utf-8'));
        datavals = {
            globalconfig: config.global.config,
            filemonitor: config.global.filemonitor,
            sshport: config.global.sshaccess,
            databasesitename: config.database.sitename,
            databasehost: config.database.host,
            databaseport: config.database.port,
            databasepass: config.database.projectname,
            autostart: config.global.autostart,
            localsensormorada: config.localsensor.morada,
            localsensornomeSensor: config.localsensor.nomeSensor,
            localsensorlatitude: config.localsensor.latitude,
            localsensorlongitude: config.localsensor.longitude,
            localsensorposx: config.localsensor.posx,
            localsensorposy: config.localsensor.posy,
            localsensorplant: config.localsensor.plant
        };
    } else {
        datavals = {"globalconfig": 0};
    }
    res.json(datavals);
};

/**
 * Guarda as configuracoess no ficheiro Ini
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.savesettings = function (req, res) {
    var fini = "; isto e um comentario\n[global]" +
            "\nconfig = true" +
            "\nfilemonitor = " + req.body.data.filemonitor +
            "\nautostart = " + req.body.data.autostart +
            "\nsshaccess = " + req.body.data.sshport +
            "\n\n; definicao da base de dados\n[database]" +
            "\nsitename= " + req.body.data.sitename +
            "\nhost = " + req.body.data.host +
            "\nport = " + req.body.data.port +
            "\nprojectname = " + req.body.data.password +
            "\n\n; local do sensor\n[localsensor]" +
            "\ncheckposition = false" +
            "\nmorada = " + req.body.data.morada +
            "\nnomeSensor = " + req.body.data.nomeSensor +
            "\nlatitude = " + req.body.data.latitude +
            "\nlongitude = " + req.body.data.longitude +
            "\nposx = " + req.body.data.posx +
            "\nposy = " + req.body.data.posy +
            "\nplant = " + req.body.data.plant;

    fs.writeFile("./ConfigSKT.ini", fini, function (err) {
        if (err) {
            res.json(err);
        }
        res.json("save");
    });
};

/**
 * Inicia a interface monitor
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.startmonitor = function (req, res) {
    cp.fork('./lib/mainSKT.js');
    res.json("Start Monitor");
    console.log("Start Monitor");
};

/**
 * Para a interface monitor
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.stoptmonitor = function (req, res) {
    console.log("Stop monitor");
    cp.exec("sudo ./stopAir.sh", function (error, stdout, stderr) {
        res.json(stdout);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
};

/**
 * Reinicia o SO
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.restartsystem = function (req, res) {
    res.json("reboot");
    console.log("System Reboot");
    cp.exec("sudo reboot", function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
};

/**
 * Desliga o SO
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.poweroffsystem = function (req, res) {
    res.json("PowerOff");
    console.log("System Poweroff");
    cp.exec("sudo poweroff", function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
};

module.exports.getLastGitUpdate = function (req, res) {
    cp.exec("git log -1 --format=%cd", function (error, stdout, stderr) {
        res.json(stdout);
    });
};

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