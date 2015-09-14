/* global module */

var r = require('rethinkdb');
var connectdb = require("./ConnectDb");

var self = this;

/**
 * Insere ou atualiza a tabela que tem todos os APs detetados
 * @param {type} valsAp
 * @param {type} client
 * @returns {undefined}
 */
module.exports.insertDispAp = function (valsAp, client) {
  var pwr = (valsAp.length == 14) ? ((typeof valsAp[7] == "undefined") ? "-1" : valsAp[7]) : ((typeof valsAp[8] == "undefined") ? "-1" : valsAp[8]);
  if ((pwr * 1) != -1 && pwr.trim() != "" && (pwr * 1) < 10 &&  (pwr * 1) > -140) {
    r.connect(self.dbData).then(function (conn) {
      return r.db(self.dbConfig.db).table("DispAp").get(valsAp[0]).replace(function (row) {
        return r.branch(
                row.eq(null),
                {
                  "macAddress": valsAp[0],
                  "nameVendor": r.db("Prefix").table("tblPrefix").get(valsAp[0].substring(0, 8)).getField("vendor").default(""),
                  "channel": (typeof valsAp[3] == "undefined") ? "" : valsAp[3],
                  "Speed": (typeof valsAp[4] == "undefined") ? "" : valsAp[4],
                  "Privacy": (typeof valsAp[5] == "undefined") ? "" : valsAp[5],
                  "Cipher": (valsAp.length == 14) ? ((typeof valsAp[6] == "undefined") ? "" : (typeof valsAp[6].split(",")[0] == "undefined") ? "" : valsAp[6].split(",")[0]) : valsAp[6],
                  "Authentication": (valsAp.length == 14) ? ((typeof valsAp[6] == "undefined") ? "" : (typeof valsAp[6].split(",")[1] == "undefined") ? "" : valsAp[6].split(",")[1]) : valsAp[7],
                  "ESSID": (valsAp.length == 14) ? ((typeof valsAp[12] == "undefined") ? "" : valsAp[12]) : ((typeof valsAp[13] == "undefined") ? "" : valsAp[13]),
                  "disp": [{
                      name: client,
                      "First_time": r.now().inTimezone("+01:00").toEpochTime(),
                      "values": [{
                          "Last_time": r.now().inTimezone("+01:00").toEpochTime(),
                          "Power": pwr
                        }]
                    }]
                },
        r.branch(
                row("disp")("name").contains(client),
                row.merge({
                  "channel": (typeof valsAp[3] == "undefined") ? "" : valsAp[3],
                  "Speed": (typeof valsAp[4] == "undefined") ? "" : valsAp[4],
                  "Privacy": (typeof valsAp[5] == "undefined") ? "" : valsAp[5],
                  "Cipher": (valsAp.length == 14) ? ((typeof valsAp[6] == "undefined") ? "" : (typeof valsAp[6].split(",")[0] == "undefined") ? "" : valsAp[6].split(",")[0]) : valsAp[6],
                  "Authentication": (valsAp.length == 14) ? ((typeof valsAp[6] == "undefined") ? "" : (typeof valsAp[6].split(",")[1] == "undefined") ? "" : valsAp[6].split(",")[1]) : valsAp[7],
                  "ESSID": (valsAp.length == 14) ? ((typeof valsAp[12] == "undefined") ? "" : valsAp[12]) : ((typeof valsAp[13] == "undefined") ? "" : valsAp[13]),
                  "disp": row('disp').map(function (d) {
                    return r.branch(
                            d('name').eq(client).default(false),
                            d.merge({
                              "values": d("values").append({
                                "Last_time": r.now().inTimezone("+01:00").toEpochTime(),
                                "Power": pwr
                              })}),
                            d);
                  })}),
                {"macAddress": valsAp[0],
                  "nameVendor": r.db("Prefix").table("tblPrefix").get(valsAp[0].substring(0, 8)).getField("vendor").default(""),
                  "channel": (typeof valsAp[3] == "undefined") ? "" : valsAp[3],
                  "Speed": (typeof valsAp[4] == "undefined") ? "" : valsAp[4],
                  "Privacy": (typeof valsAp[5] == "undefined") ? "" : valsAp[5],
                  "Cipher": (valsAp.length == 14) ? ((typeof valsAp[6] == "undefined") ? "" : (typeof valsAp[6].split(",")[0] == "undefined") ? "" : valsAp[6].split(",")[0]) : valsAp[6],
                  "Authentication": (valsAp.length == 14) ? ((typeof valsAp[6] == "undefined") ? "" : (typeof valsAp[6].split(",")[1] == "undefined") ? "" : valsAp[6].split(",")[1]) : valsAp[7],
                  "ESSID": (valsAp.length == 14) ? ((typeof valsAp[12] == "undefined") ? "" : valsAp[12]) : ((typeof valsAp[13] == "undefined") ? "" : valsAp[13]),
                  "disp": row('disp').append({
                    name: client,
                    "First_time": r.now().inTimezone("+01:00").toEpochTime(),
                    "values": [{
                        "Last_time": r.now().inTimezone("+01:00").toEpochTime(),
                        "Power": pwr
                      }]
                  })}));
      }, {nonAtomic: true}).run(conn)
              .finally(function () {
                conn.close();
              });
    }).then(function (output) {
//    console.log("Query Ap output:", output);
    }).error(function (err) {
      console.log("***************** Dispp Ap **************************");
      console.log("Failed:", err);
    });
  }
};