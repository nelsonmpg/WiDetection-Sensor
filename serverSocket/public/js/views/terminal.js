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
        self.terminal = $('#cmdterminalID').terminal(function (command) {
            self.socketTerm.setcommand(command);
            self.socketTerm.setcommand('echo "`whoami`@`hostname`: [`pwd`] $ "');
        }, {
            history: true,
            greetings: 'Welcome to the web shell WiDetection',
            prompt: 'WiDetection $ ',
            exit: false
        });
        self.socketTerm.setcommand("cd /home/linaro/");
        self.socketTerm.setcommand('echo "`whoami`@`hostname`: [`pwd`] $ "');
        self.terminal.active();
        $('#cmdterminalID').focus();
    },
    terminalstdout: function (data) {
        if (data.toLowerCase().indexOf("linaro@") >= 0 || data.toLowerCase().indexOf("root@") >= 0) {
            this.terminal.set_prompt(data);
        } else {
            this.terminal.echo(String(data));
        }

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