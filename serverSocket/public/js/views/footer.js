window.FooterView = Backbone.View.extend({
  events: {
  },
  initialize: function () {
  },
  init: function () {
    modem("GET",
            "/getGitLastUpdate",
            function (data) {
              $("#lastTime").html(new Date(data).toLocaleString());
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
