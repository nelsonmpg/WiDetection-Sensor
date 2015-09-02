/* global Backbone, app */

window.SideBarView = Backbone.View.extend({
  socketsidebar: null,
  events: {
    "click .select-item-menu": "navsidebar"
  },
  navsidebar: function (e) {
    var self = this;
    $('ul.sidebar-menu li.active').removeClass("active");
    $(e.currentTarget).parent().addClass("active");
    e.preventDefault();
      app.navigate($(e.currentTarget).data("nome"), {
        trigger: true
      });
    
  },
  initialize: function () {
  },  
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
