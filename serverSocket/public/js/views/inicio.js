window.InicioView = Backbone.View.extend({
  events: {
  },
  initialize: function () {
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    $.AdminLTE.boxWidget.activate();
    return this;
  }
});
