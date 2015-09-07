/* global Backbone, app */

window.HeaderView = Backbone.View.extend({
  logotipo: "",
  initialize: function (opt) {
    this.logotipo = opt.logo;
  },
  events: {
    "click #logout-btn": "logout",
    "click .sidebar-toggle": "toogleSidebar",
    "click #openopt": "openSidebarOption",
    "click #newuser-btn": "newUser",
    "click a.logo": function (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  },
  init: function () {
    $(".nameuser").text(window.profile.get("name"));
    $(".imageuser").attr("src", window.profile.get("logo"));
    $.AdminLTE.controlSidebar.activate();
    $.AdminLTE.pushMenu.activate($(".sidebar-toggle"));
  },
  toogleSidebar: function (e) {
    e.preventDefault();
  },
  openSidebarOption: function (e) {
    e.preventDefault();
  },
  newUser: function (e) {
    e.preventDefault();
    app.navigate("NovoUtilizador", {
      trigger: true
    });
  },
  logout: function () {
    window.logged = false;
    window.localStorage.setItem("Logged", false);
    window.sessionStorage.clear();
    if (!localStorage.getItem('savecredential')) {
      localStorage.setItem('keyo', null);
    }
    app.navigate("", {
      trigger: true
    });
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});

