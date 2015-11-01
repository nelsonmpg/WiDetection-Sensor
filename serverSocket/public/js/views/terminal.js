window.TerminalView = Backbone.View.extend({
    terminal: undefined,
    socketTerm: null,
    pwd: false,
    events: {
    },
    initialize: function (skt) {
        this.socketTerm = skt.socket;
    },
    init: function () {
        var self = this;
        self.terminal = $('#cmdterminalID').terminal(function (command) {
            self.socketTerm.setcommand(command);
            self.socketTerm.getprompt('echo "`whoami`@`hostname`:`pwd`$"');
        }, {
            history: true,
            greetings: 'Welcome to the web shell WiDetection',
            prompt: 'WiDetection $ ',
            exit: false
        });
        self.socketTerm.getprompt();
    },
    terminalstdout: function (data) {
        if (this.pwd) {
            this.terminal.set_prompt(data);
        } else {
            this.terminal.echo(String(data));
        }
        this.pwd = true;
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
