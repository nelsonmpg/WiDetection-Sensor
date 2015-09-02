window.ContentNavView = Backbone.View.extend({
  events: {
  },
  initialize: function () {
    //this.render();
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  },
  setView: function(viewName) {
    $(".atualView").text(viewName);    
    $(".mapSite li.active.nome-separador").removeClass("active");
    $(".mapSite").append("<li class='active nome-separador'>"+viewName+"</li>");
  }  
});
