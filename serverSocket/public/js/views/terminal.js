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
        console.log("----------------------------");
        console.log(data);
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
    terminalsetprompt: function (data) {
        this.terminal.set_prompt(data);
    },
    render: function () {
        $(this.el).html(this.template());
        return this;
    }
});
