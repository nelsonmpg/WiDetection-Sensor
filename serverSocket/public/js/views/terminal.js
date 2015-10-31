window.TerminalView = Backbone.View.extend({
    events: {
    },
    initialize: function () {
    },
    init: function () {
        var id = 1;
        $('#cmdterminalID').terminal(function (command, term) {
            if (command !== '') {
                modem("POST",
                        "/execCommand",
                        function (data) {
                            console.log(data);
                            if (data != undefined) {
                                term.echo(String(data));
                            }
                        },
                        function (xhr, ajaxOptions, thrownError) {
                            var json = JSON.parse(xhr.responseText);
                            error_launch(json.message);
                        }, {
                    cmd: command
                }
                );
//                var result = window.eval(command);
//                if (result != undefined) {
//                    term.echo(String(result));
//                }
            }
        }, {
            greetings: 'Widetection Terminal\n',
            name: 'WiDetection',
            prompt: 'linaro@cubieboard:~$ ',
            onBlur: function () {
                // prevent loosing focus
                return false;
            }
        });
    },
    render: function () {
        $(this.el).html(this.template());
        return this;
    }
});
