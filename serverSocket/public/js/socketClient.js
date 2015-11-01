var socketClient = function (options) {
    var self = this;
    self.vent = options.vent;

    self.hostname = window.location.host.split("#")[0];

    self.connect = function () {
        self.socket = io.connect(self.hostname);
        self.setResponseListeners(self.socket);
    };

    self.disconnect = function () {
        if (self.socket) {//socket.io.close();
            self.socket.io.close();
        }
    };

    self.setcommand = function (command) {
        self.socket.emit('stdin', command);
    };
    
    self.setResponseListeners = function (socket) {

        socket.on('stdout', function (data) {
            self.vent.trigger('stdout', data);
        });
        socket.on('stderr', function (data) {
            self.vent.trigger('stderr', data);
        });
        socket.on('disconnect', function () {
            self.vent.trigger('disconnect');
        });
        socket.on('enable', function () {
            self.vent.trigger('enable');
        });
        socket.on('disable', function () {
            self.vent.trigger('disable');
        });
    };
};