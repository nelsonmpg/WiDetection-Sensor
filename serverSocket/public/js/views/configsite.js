/* global Backbone, normalizeString, app */

window.ConfigSiteView = Backbone.View.extend({
  location: "http://maps.google.com/maps/api/geocode/json?address=",
  keyloc: "&sensor=false",
  validinifile: false,
  inputchanged: false,
  continue: false,
  events: {
    'keyup .table input': function () {
      this.checkImputs();
    },
    "click .select-opt-site-name": "selectSiteName",
    "click .select-opt-device": "selectDevice",
    "click #create-monitor": "createmonitor",
    "click .select-source": "selectSource",
    "click #save-settings": "savesettings",
    "click #start_monitor": "startmonitor",
    "click #stop-monitor": "stopmonitor",
    "click #Check-Position": "firstposition",
    "click #refresh-values": "refresh",
    "click .btn-modal": "checksave",
    "click #btn_restartSO": "restartso",
    "click #btn_poweroffSO": "poweroffso",
    "click #add-plant": "addimagenplant",
    'change #selectplant': "imagePlant",
    'dragenter #plantlocalsensor': function (e) {
      e.stopPropagation();
      e.preventDefault();
      $(e.currentTarget).css({
        'border': '2px solid #0B85A1',
        "-webkit-box-shadow": "5px 5px 2px #888888",
        "-moz-box-shadow": "5px 5px 2px #888888",
        "box-shadow": "5px 5px 2px #888888"
      });
    },
    'dragleave #plantlocalsensor': function (e) {
      $(e.currentTarget).css({
        'border': '2px dotted #0B85A1',
        "-webkit-box-shadow": "2px 2px 1px #888888",
        "-moz-box-shadow": "2px 2px 1px #888888",
        "box-shadow": "2px 2px 1px #888888"
      });
    },
    'drop #plantlocalsensor': 'imagePlantDiv',
    'dragover #plantlocalsensor': function (e) {
      e.stopPropagation();
      e.preventDefault();
    },
    "contextmenu #imgsensor, #plantlocalsensor": function (event) {
      if ($('#sensor-posx').val() != 0 || $('#sensor-posy').val() != 0 || $(event.currentTarget).attr("id") == "plantlocalsensor") {
        // Avoid the real one
        event.preventDefault();
        // Show contextmenu
        $(".custom-menu").finish().toggle(100).
                // In the right position (the mouse)
                css({
                  top: event.pageY + "px",
                  left: event.pageX + "px"
                });
      }
    },
    "mousedown #imgsensor, #plantlocalsensor": function (e) {
      // If the clicked element is not the menu
      if (!$(e.target).parents(".custom-menu").length > 0) {
        // Hide it
        $(".custom-menu").hide(100);
      }
    },
    "click .custom-menu li": function (e) {
      // This is the triggered action name
      switch ($(e.currentTarget).attr("data-action")) {
        // A case for each action. Your actions here
        case "remove":
          //alert("first");  
          var elem = $('#imgsensor').clone();
          $("#addimagesensor").html("");
          $("#addimagesensor").append(elem);
          $('#sensor-posx').val(0);
          $('#sensor-posy').val(0);
          $("#imgsensor").animate({
            top: 0,
            left: 0
          }).draggable({
            containment: $('body'),
            stop: function () {
              var finalOffset = $(this).offset();
              var finalxPos = (finalOffset.left - $('#posiSensor').offset().left) * 100 / $('#posiSensor').width();
              var finalyPos = (finalOffset.top - $('#posiSensor').offset().top) * 100 / $('#posiSensor').height();
              if (finalxPos >= 0 && finalyPos >= 0) {
                $('#sensor-posx').val(finalxPos);
                $('#sensor-posy').val(finalyPos);
              }
            },
            revert: 'invalid'
          });
          break;
        case "removeplant":
          $('#plantlocalsensor').css({
            'border': "none",
            "-webkit-box-shadow": "none",
            "-moz-box-shadow": "none",
            "box-shadow": "none",
            "background-image": "none"
          });
          break;
      }
      // Hide it AFTER the action was triggered
      $(".custom-menu").hide(100);
    }
  },
  initialize: function () {
  },
  checkImputs: function () {
    $('.valid-input').each(function (i, obj) {
      if ($(obj).val().trim().length <= 2) {
        $(obj).parent().next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
      } else {
        $(obj).parent().next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
      }
      switch ($(obj).data("typevalue")) {
        case "ipaddress":
          var ipRegex = '^([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5]).([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5]).([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5]).([01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])$';
          if ($(obj).val().trim().match(ipRegex)) {
            $(obj).parent().next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
          } else {
            $(obj).parent().next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
          }
          break;
        case "port":
          if (($(obj).val().trim() * 1) >= 10000 && ($(obj).val().trim() * 1) < 65536) {
            $(obj).parent().next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
          } else {
            $(obj).parent().next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
          }
          break;
        case "systempath":
          var val = $(obj).val().replace(/\//g, "§").replace(".", "£");
          if (val.trim().length > 0) {
            modem("GET",
                    "/validpathsystem/" + val,
                    function (data) {
                      if (data) {
                        $(obj).parent().next().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                      } else {
                        $(obj).parent().next().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                      }
                    },
                    function (xhr, ajaxOptions, thrownError) {
                      var json = JSON.parse(xhr.responseText);
                      error_launch(json.message);
                    }, {}
            );
          }
          break;
        case "siteName":
          $(obj).val($(obj).val().replace(/[^\w]/gi, ''));
          break;
      }
    });
  },
  init: function () {
    var self = this;
    $("#server-ip:input").inputmask();
    $('body').on('input', function (e) {
      self.inputchanged = true;
    });
    self.getiniconfigparams();
    self.getwlaninterfaces();
    self.getmonitorcreated();
    self.checkmonitorstarted();
    showInfoMsg(false, '.my-modal');
    $.AdminLTE.boxWidget.activate();

    modem("GET",
            "/getsitelist",
            function (data) {
              var sitelst = "";
              for (var i in data.dblist) {
                sitelst += '<li><a class="select-opt-site-name" data-host="' + data.host + '" data-port="' + data.port + '" data-pass="' + data.authKey + '" data-site="' + data.dblist[i].db + '" href="#">' + data.dblist[i].db + '</a></li>';
              }
              sitelst += '<li><a class="select-opt-site-name" data-site="new" href="#">New Site</a></li>';
              $("#select-site-name").html(sitelst);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );

    $('#imgsensor').draggable({
      containment: $('body'),
      stop: function () {
        var finalOffset = $(this).offset();
        var finalxPos = (finalOffset.left - $('#posiSensor').offset().left) * 100 / $('#posiSensor').width();
        var finalyPos = (finalOffset.top - $('#posiSensor').offset().top) * 100 / $('#posiSensor').height();
        if (finalxPos >= 0 && finalyPos >= 0) {
          $('#sensor-posx').val(finalxPos);
          $('#sensor-posy').val(finalyPos);
        }
      },
      revert: 'invalid'
    });

    $('#plantlocalsensor').droppable({
      accept: '#imgsensor',
      over: function (event, ui) {
        $('#imgsensor').draggable('option', 'containment', $(this));
      }
    });
    self.checkImputs();
  },
  selectSiteName: function (e) {
    var self = this;
    e.preventDefault();
    if ($(e.currentTarget).data("site") == "new") {
      $("#site-name, #site-pass, #server-ip, #server-port").attr("disabled", false);
      $("#site-name, #site-pass, #server-ip, #server-port").val("");
    } else {
      $("#site-name, #site-pass, #server-ip, #server-port").attr("disabled", "disabled");
      $("#server-ip").val($(e.currentTarget).data("host"));
      $("#server-port").val($(e.currentTarget).data("port"));
      $("#site-pass").val(atob($(e.currentTarget).data("pass")));
      $("#site-name").val($(e.currentTarget).text());
    }
    self.checkImputs();
  },
  refresh: function () {
    var self = this;
    showInfoMsg(true, '.my-modal', "RefreshValues.<br>Please Wait a Moment... <i class='fa fa-refresh fa-spin'></i>");
    self.init();
    $("#site-name, #site-pass, #server-ip, #server-port").attr("disabled", false);
  },
  getiniconfigparams: function () {
    var self = this;
    modem("GET",
            "/paramsinifile",
            function (data) {
              if (data.globalconfig != 0) {
                $("#site-file-folder").val(data.filemonitor);
                $("#ssh-port").val(data.sshport);
                $("#site-name").val(data.databasesitename.replace(/[^\w]/gi, ''));
                $("#site-pass").val(data.databasepass);
                $("#server-ip").val(data.databasehost);
                $("#server-port").val(data.databaseport);
                $("#sensor-local").val(data.localsensormorada);
                $("#sensor-name").val(data.localsensornomeSensor);
                $("#sensor-latitude").val(data.localsensorlatitude);
                $("#sensor-longitude").val(data.localsensorlongitude);
                $("#sensor-posx").val(data.localsensorposx);
                $("#sensor-posy").val(data.localsensorposy);
                if (atob(data.localsensorplant) != "none") {
                  $('#plantlocalsensor').css({
                    'border': "2px solid black",
                    "-webkit-box-shadow": "none",
                    "-moz-box-shadow": "none",
                    "box-shadow": "none",
                    "background-image": atob(data.localsensorplant),
                    "background-size": "100% 100%",
                    "background-repeat": "no-repeat",
                    "background-position": "center center"
                  });
                }
                $("#myonoffswitch").attr("checked", data.autostart);
                carregarmapa([["<h4>" + $("#sensor-name").val() + "</h4>", $("#sensor-latitude").val(), $("#sensor-longitude").val()]], $("#map-google")[0], self.selectnewposition);
                self.validinifile = true;
              } else {
                $("#Check-Position").click();
                self.validinifile = false;
              }
              self.checkImputs();
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  getwlaninterfaces: function () {
    var self = this;
    modem("GET",
            "/dispOswlan",
            function (data) {
              var a = data.split("\n");
              var displst = "";
              for (var i in a) {
                var b = a[i].split(" ");
                if (b[0].length > 3) {
                  displst += '<li><a class="select-opt-device" data-mac=' + b[1] + ' href="#">' + b[0] + '</a></li>';
                }
              }
              $("#select-device").html(displst);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  getmonitorcreated: function () {
    var self = this;
    modem("GET",
            "/dispOsmon",
            function (data) {
              if (data.length > 0) {
                $("#device-monitor").val(data);
                $("#device-select").val($("#select-device li:first").text());
                $("#select-device").parent().children("button").addClass("disabled");
              }
              $('#create-monitor').prop('disabled', true);
              $("#start_monitor").prop('disabled', true);
              $("#stop-monitor").prop('disabled', true);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  selectDevice: function (e) {
    var self = this;
    e.preventDefault();
    $("#device-select").val($(e.currentTarget).text());
    $('#create-monitor').prop('disabled', false);
  },
  createmonitor: function () {
    var self = this;
    console.log("create monitor");
    showInfoMsg(true, '.my-modal', "Create Monitor.<br>Please Wait a Moment... <i class='fa fa-refresh fa-spin'></i>");
    modem("POST",
            "/createmonitor",
            function (data) {
              if (data.toString().trim().length > 2) {
                $("#device-monitor").val(data.toString().replace("[phy0]", "").replace(/\)/g, ""));
                $("#select-device").parent().children("button").addClass("disabled");
                $('#create-monitor').prop('disabled', true);
                $("#start_monitor").prop('disabled', false);
                showInfoMsg(false, '.my-modal');
              }
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {
      wifi: $("#device-select").val()
    }
    );
  },
  checkmonitorstarted: function () {
    var self = this;
    modem("GET",
            "/checkmonitorstart",
            function (data) {
              if ($("#device-monitor").val().trim().length > 2) {
                if (data.toString().trim().length == 0) {
                  $("#stop-monitor").prop('disabled', true);
                  $("#start_monitor").prop('disabled', false);
                } else {
                  $("#stop-monitor").prop('disabled', false);
                  $("#start_monitor").prop('disabled', true);
                }
              }
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  selectSource: function (e) {
    var self = this;
    e.preventDefault();
    $("#posiSensor .tab-pane").removeClass("active");
    $("#posiSensor ." + $(e.currentTarget).children().attr("href")).addClass("active");
    if ($(".tab1").hasClass("active")) {
      $("#add-plant").attr("disabled", "disabled");
      $("#imgsensor").css("display", "none");
      $("#Check-Position, #sensor-local, #sensor-latitude, #sensor-longitude").attr("disabled", false);
      $("#sensor-posx, #sensor-posy").attr("disabled", "disabled");
    } else {
      $("#add-plant").attr("disabled", false);
      $("#imgsensor").css({
        "display": "block"
      });
      if ($("#plantlocalsensor").css("background-image") != "none") {
        var xx = ($("#plantlocalsensor").width() * $("#sensor-posx").val() * 1) / 100;
        var yy = ($("#plantlocalsensor").height() * $("#sensor-posy").val() * 1) / 100;
        $("#imgsensor").css({
          top: (($("#plantlocalsensor").offset().top - $("#addimagesensor").offset().top) + yy) - $("#addimagesensor").css("padding").replace("px", "") * 1 + "px",
          left: (($("#plantlocalsensor").offset().left - $("#addimagesensor").offset().left) + xx) - $("#addimagesensor").css("padding").replace("px", "") * 1 + "px"
        });
      }
      $("#sensor-posx, #sensor-posy").attr("disabled", false);
      $("#Check-Position, #sensor-local, #sensor-latitude, #sensor-longitude").attr("disabled", "disabled");
    }
  },
  addimagenplant: function () {
    $("#selectplant").click();
  }, imagePlant: function (e) {
    var file = e.originalEvent.target.files[0];
    var reader = new FileReader(file);
    var image = new Image();
    var bgsize = "100% 100%";
    reader.onload = function (evt) {
      image.src = evt.target.result;
      image.onload = function () {
        var w = this.width;
        var h = this.height;
        if (w > h) {
          bgsize = "100% auto";
        } else if (w < h) {
          bgsize = "auto 100%";
        }
        $('#plantlocalsensor').css({
          'border': "2px solid black",
          "-webkit-box-shadow": "none",
          "-moz-box-shadow": "none",
          "box-shadow": "none",
          "background-image": 'url(' + thumbnail(evt.target.result, 500, 500) + ')',
          "background-size": bgsize,
          "background-repeat": "no-repeat",
          "background-position": "center center"
        });
      }
      ;
    };
    reader.readAsDataURL(file);
  },
  imagePlantDiv: function (e) {
    e.preventDefault();
    if (e.originalEvent.dataTransfer) {
      var files = e.originalEvent.dataTransfer.files;
      var errMessage = 0;
      $.each(files, function (index, file) {
        // Some error messaging
        if (!files[index].type.match('image.*')) {
          if (errMessage === 0) {
            alert('Hey! Images only');
            ++errMessage
          }
          else if (errMessage === 1) {
            alert('Stop it! Images only!');
            ++errMessage
          }
          else if (errMessage === 2) {
            alert("Can't you read?! Images only!");
            ++errMessage
          }
          else if (errMessage === 3) {
            alert("Fine! Keep dropping non-images.");
            errMessage = 0;
          }
          return false;
        }

        var reader = new FileReader(file);
        var image = new Image();
        var bgsize = "100% 100%";
        reader.onload = function (evt) {
          image.src = evt.target.result;
          image.onload = function () {
            var w = this.width;
            var h = this.height;
            if (w > h) {
              bgsize = "100% auto";
            } else if (w < h) {
              bgsize = "auto 100%";
            }
            $('#plantlocalsensor').css({
              'border': "2px solid black",
              "-webkit-box-shadow": "none",
              "-moz-box-shadow": "none",
              "box-shadow": "none",
              "background-image": 'url(' + thumbnail(evt.target.result, 500, 500) + ')',
              "background-size": bgsize, "background-repeat": "no-repeat",
              "background-position": "center center"
            });
          };
        };
        reader.readAsDataURL(file);
      });
    }
  },
  selectnewposition: function (data) {
    var self = this;
    $("#sensor-latitude").val(data.lat);
    $("#sensor-longitude").val(data.long);
    $("#sensor-local").val(data.place);
  },
  checksave: function (e) {
    var self = this;
    switch ($(e.currentTarget).data("event")) {
      case"close":
        break;
      case "notsave":
        self.continue = true;
        self.startmonitor();
        break;
      case "save":
        self.inputchanged = false;
        self.continue = true;
        self.savesettings(self.startmonitor());
        break;
    }
    $(".modal").hide();
  },
  savesettings: function (callback) {
    var self = this;
    if (($(".valid-input").length == $(".fa-check").length) ? true : false) {
      self.inputchanged = false;
      var settings = {
        filemonitor: $("#site-file-folder").val(),
        sshport: $("#ssh-port").val(),
        autostart: $("#myonoffswitch").is(":checked"),
        sitename: $("#site-name").val().replace(/[^\w]/gi, ''),
        host: $("#server-ip").val(),
        port: $("#server-port").val() * 1,
        password: $("#site-pass").val(),
        morada: $("#sensor-local").val(),
        nomeSensor: $("#sensor-name").val(),
        latitude: $("#sensor-latitude").val() * 1,
        longitude: $("#sensor-longitude").val() * 1,
        posx: $("#sensor-posx").val() * 1,
        posy: $("#sensor-posy").val() * 1,
        plant: btoa($("#plantlocalsensor").css("background-image"))
      };
      modem("POST",
              "/savesettings",
              function (data) {
                if (data == "save") {
                  showmsg('.my-modal', "success", "Seved Settings!");
                  self.validinifile = true;
                  if (typeof callback == "function") {
                    callback();
                  }
                } else {
                  showmsg('.my-modal', "error", "Error");
                }
              },
              function (xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
              }, {
        data: settings
      }
      );
    } else {
      showmsg('.my-modal', "error", "Bad Values to Save, check the <i class='icon fa fa-close'>.");
    }
  },
  startmonitor: function () {
    var self = this;
    if (self.inputchanged && !self.continue) {
      $(".modal").show();
    } else {
      if (self.validinifile) {
        self.continue = false;
        if ($("#device-monitor").val().trim().length > 0) {
          console.log("start monitor");
          showInfoMsg(true, '.my-modal', "Start Monitor.<br>Please Wait a Moment... <i class='fa fa-refresh fa-spin'></i>");
          modem("POST",
                  "/startmonitor",
                  function (data) {
                    console.log(data);
                    self.confirmMonitorStart();
                  }, function (xhr, ajaxOptions, thrownError) {
            var json = JSON.parse(xhr.responseText);
            error_launch(json.message);
          }, {}
          );
        } else {
          showmsg('.my-modal', "warning", "Create Monitor First!");
        }
      } else {
        showmsg('.my-modal', "warning", "Save Settings First!");
      }
    }
  }, confirmMonitorStart: function () {
    var self = this;
    setTimeout(function () {
      self.checkmonitorstarted();
      if (!$("#stop-monitor").prop('disabled')) {
        showInfoMsg(false, '.my-modal');
      } else {
        self.confirmMonitorStart();
      }
    }, 1000);
  },
  stopmonitor: function () {
    var self = this;
    console.log("Start stop Monitor!");
    showInfoMsg(true, '.my-modal', "Stop Monitor.<br>Please Wait a Moment... <i class='fa fa-refresh fa-spin'></i>");
    modem("POST",
            "/stopmonitor",
            function (data) {
              self.checkmonitorstarted();
              showInfoMsg(false, '.my-modal');
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  firstposition: function () {
    var self = this;
    $.getJSON(self.location + normalizeString($("#sensor-local").val()).toLowerCase() + self.keyloc, function (data) {
      $("#sensor-local").val(data.results[0].formatted_address);
      $("#sensor-latitude").val(data.results[0].geometry.location.lat);
      $("#sensor-longitude").val(data.results[0].geometry.location.lng);
      self.inputchanged = true;
      carregarmapa([["<h4>" + $("#sensor-name").val() + "</h4>", $("#sensor-latitude").val(), $("#sensor-longitude").val()]], $("#map-google")[0], self.selectnewposition);
    });
  },
  restartso: function () {
    var self = this;
    showInfoMsg(true, '.my-modal', "The system is going down for reboot NOW!<br>Wait for system responding... <i class='fa fa-refresh fa-spin'></i>");
    modem("GET",
            "/restartsystem",
            function (data) {
              setTimeout(function () {
                self.serverResponse();
              }, 10000);
              console.log(data);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  poweroffso: function () {
    var self = this;
    showInfoMsg(true, '.my-modal', "The system is going down NOW!<br>See you later!");
    modem("GET",
            "/poweroffsystem",
            function (data) {
              console.log(data);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );

  },
  serverResponse: function () {
    var self = this;
    $.ajax({url: window.location.href.split("#")[0],
      type: "HEAD",
      timeout: 1000,
      statusCode: {
        200: function (response) {
          showInfoMsg(false, '.my-modal');
          window.location.reload();
        },
        400: function (response) {
          setTimeout(function () {
            self.serverResponse();
          }, 1000);
          console.log('Not working!');
        },
        0: function (response) {
          setTimeout(function () {
            self.serverResponse();
          }, 1000);
          console.log('Not working!');
        }
      }
    });
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
