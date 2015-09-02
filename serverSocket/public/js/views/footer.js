window.FooterView = Backbone.View.extend({
  events: {
    "click #xpto": "funcaoClick"
  },
  funcaoClick: function () {

  },
  initialize: function () {
    this.render();
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
