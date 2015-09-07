/* global Backbone, app */

window.LoginView = Backbone.View.extend({
  events: {
    "click #btnLogIn": "login"
  },
  login: function (e) {
    e.preventDefault();
    var self = this;

    var user = $("#login-form input[type='email']").val();
    var password = $("#login-form input[type='password']").val();

    var credential = user + ':' + password;

    if ($("#rememberme").is(':checked')) {
      localStorage.setItem('keyo', btoa(credential));
      localStorage.setItem('savecredential', true);
    } else {
      sessionStorage.setItem('keyo', btoa(credential));
      localStorage.setItem('keyo', null);
      localStorage.setItem('savecredential', false);
    }

    modem('POST', "/login",
            function (data) {
              if (data.length > 0) {
                self.loginuser(data);
              } else {
                $('.my-modal').html($("#login-error").html());
                $(".my-model-hide").css({
                  "dispaly": "block"
                });
                $('.my-modal').show();
                setTimeout(function () {
                  $('.my-modal').hide();
                  $(".my-model-hide").css({
                    "dispaly": "none"
                  });
                  $('.my-modal').html("");
                }, 2000);
              }
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              console.log(json.message);

              app.navigate("", {
                trigger: true
              });
            }, {
      "email": user,
      "pass": stringToMd5(btoa($("#login-form input[type='password']").val()))
    });
  },
  loginuser: function (data) {
    window.profile = new Profile();
    window.profile.fetch(data, function () {
      window.logged = true;
      app.navigate("/Inicio", {
        trigger: true
      });
    }, function () {
      alert('Login failed');
    });
  },
  checkloginstored:function(){
     var credencial = localStorage.getItem('keyo');
        if (credencial != null && credencial != "null") {
            var decoded =  atob(credencial).split(":");
            $("#login-form input[type='email']").val(decoded[0]);
            $("#login-form input[type='password']").val(decoded[1]);
            $("#rememberme").prop('checked', true);
        } else{
            $("#login-form input[type='email']").val("");
            $("#login-form input[type='password']").val(""); 
        }
  },
  initialize: function () {
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
