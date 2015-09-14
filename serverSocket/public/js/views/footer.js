window.FooterView = Backbone.View.extend({
  events: {
  },
  initialize: function () {
  },
  init: function () {
    modem("GET",
            "/getGitLastUpdate",
            function (data) {
              $("#lastTime").html(function () {
                var input = data;
                var d = new Date(Date.parse(input.replace(/-/g, "/")));
                var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                var date = d.getFullYear() + "/" + month[d.getMonth()] + "/" + d.getDay();
                var time = d.toLocaleTimeString().toLowerCase().replace(/([\d]+:[\d]+):[\d]+(\s\w+)/g, "$1$2");
                return (date + " " + time);
              });
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
