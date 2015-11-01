window.TerminalView = Backbone.View.extend({
    terminal: undefined,
    socket: null,
    events: {
    },
    initialize: function () {
    },
    init: function (socket) {
        var self = this;
        self.socket = socket;
        self.terminal = $('#cmdterminalID').terminal(function (command, terminal) {
            self.socket.setcommand(command);
        }, {
            greetings: 'Welcome to the web shell'
            , prompt: 'shell $'
            , exit: false
        });
    },
    terminalstdout: function (data) {
        this.terminal.echo(String(data));
    },
    terminalstderr: function (data) {
        this.terminal.error(String(data));
    },
    terminaldisconnect: function () {
        this.terminal.disable();
    },
    terminalenable: function () {
        this.terminal.enable();
    },
    terminaldisable: function () {
        this.terminal.disable();
    },
    render: function () {
        $(this.el).html(this.template());
        return this;
    }
});
