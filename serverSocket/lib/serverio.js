/* global module, process */

_ = require('underscore');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

/**
 * Class do Socket
 * @param {type} options
 * @returns {ServerSktIo}
 */
var ServerSktIo = function (options) {
    this.server = options.server;
    this.users = [];
    this.liveActives;
};

/**
 * Inicia a criacao do socket para cada cliente
 * @returns {ServerSktIo.prototype}
 */
ServerSktIo.prototype.init = function () {
    var self = this;

    // Fired upon a connection
    this.server.io.on("connection", function (socket) {

        var c = socket.request.connection._peername;
        console.log("+++++++++++++++++++++ ADD ++++++++++++++++++++++++++");
        console.log("Connected - " + c.address + " : " + c.port);
        console.log("User - " + socket.id);
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");

        // deteta quando o cliente se desconecta do servidor e e removido da lista do servidor
        socket.on('disconnect', function () {
            console.log("Client Disconnect...");
        });

        var shell = spawn('/bin/bash');
        var stdin = shell.stdin;

        shell.on('exit', function () {
            socket.disconnect();
        });

        shell['stdout'].setEncoding('ascii');
        shell['stdout'].on('data', function (data) {
            socket.emit('stdout', data);
        });

        shell['stderr'].setEncoding('ascii');
        shell['stderr'].on('data', function (data) {
            socket.emit('stderr', data);
        });

        socket.on('stdin', function (command) {
            stdin.write(command + "\n") || socket.emit('disable');
        });

        stdin.on('drain', function () {
            socket.emit('enable');
        });

        stdin.on('error', function (exception) {
            socket.emit('error', String(exception));
        });
    });

};

//excepcoes para os erros encontrados
process.on('uncaughtException', function (err) {
    console.log('Excepcao capturada: ' + err);
});

module.exports = ServerSktIo;