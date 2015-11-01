window.TerminalView = Backbone.View.extend({
    terminal: undefined,
    socketTerm: null,
    events: {
    },
    initialize: function (skt) {
        this.socketTerm = skt.socket;
    },
    init: function () {
        var self = this;
        self.terminal = $('#cmdterminalID').terminal(function (command, terminal) {
            self.socketTerm.setcommand(command);
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
