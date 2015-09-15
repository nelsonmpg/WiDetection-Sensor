/* global module */

var r = require('rethinkdb');
var connectdb = require("./ConnectDb");

var self = this;

/**
 * Insere ou atualiza a tabela que tem o sensor com os AP que detectou
 * @param {type} valuesAp
 * @param {type} client
 * @returns {undefined}
 */
module.exports.insertAntAp = function (valuesAp, client) {
  var pwr = (valuesAp.length == 14) ? ((typeof valuesAp[7] == "undefined") ? "-1" : valuesAp[7]) : ((typeof valuesAp[8] == "undefined") ? "-1" : valuesAp[8]);
  if ((pwr * 1) != -1 && pwr.trim() != "" && (pwr * 1) < 10 &&  (pwr * 1) > -140){
    r.connect(self.dbData).then(function (conn) {
      return r.db(self.dbConfig.db).table("AntAp").get(client).replace(function (row) {
        return r.branch(
                row.eq(null),
                {
                  "nomeAntena": client,
                  "host": [{
                      "macAddress": valuesAp[0],
                      "channel": (typeof valuesAp[3] == "undefined") ? "" : valuesAp[3].trim(),
                      "Privacy": (typeof valuesAp[5] == "undefined") ? "" : valuesAp[5].trim(),
                      "Cipher": (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[0] == "undefined") ? "" : valuesAp[6].split(",")[0].trim()) : valuesAp[6].trim(),
                      "Authentication": (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[1] == "undefined") ? "" : valuesAp[6].split(",")[1].trim()) : valuesAp[7].trim(),
                      "ESSID": (valuesAp.length == 14) ? ((typeof valuesAp[12] == "undefined") ? "" : valuesAp[12].trim()) : ((typeof valuesAp[13] == "undefined") ? "" : valuesAp[13].trim()),
                      "data": r.now().inTimezone("+01:00").toEpochTime(),
                      "Power": pwr,
                      "nameVendor": r.db("Prefix").table("tblPrefix").get(valuesAp[0].substring(0, 8)).getField("vendor").default("UNKNOWN")
                    }]
                },
        r.branch(
                row("host")("macAddress").contains(valuesAp[0]),
                row.merge({
                  "host": row("host").map(function (d) {
                    return r.branch(
                            d("macAddress").eq(valuesAp[0]).default(false),
                            {
                              "macAddress": valuesAp[0],
                              "channel": (typeof valuesAp[3] == "undefined") ? "" : valuesAp[3].trim(),
                              "Privacy": (typeof valuesAp[5] == "undefined") ? "" : valuesAp[5].trim(), 
                              "Cipher": (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[0] == "undefined") ? "" : valuesAp[6].split(",")[0].trim()) : valuesAp[6].trim(),
                              "Authentication": (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[1] == "undefined") ? "" : valuesAp[6].split(",")[1].trim()) : valuesAp[7].trim(),
                              "ESSID": (valuesAp.length == 14) ? ((typeof valuesAp[12] == "undefined") ? "" : valuesAp[12]) : ((typeof valuesAp[13] == "undefined") ? "" : valuesAp[13]),
                              "data": r.now().inTimezone("+01:00").toEpochTime(),
                              "Power": pwr,
                              "nameVendor": r.db("Prefix").table("tblPrefix").get(valuesAp[0].substring(0, 8)).getField("vendor").default("UNKNOWN")
                            }, d)
                  })
                }),
                {
                  "nomeAntena": client,
                  "host": row("host").append({
                    "macAddress": valuesAp[0], 
                    "channel": (typeof valuesAp[3] == "undefined") ? "" : valuesAp[3].trim(),
                    "Privacy": (typeof valuesAp[5] == "undefined") ? "" : valuesAp[5].trim(),
                    "Cipher": (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[0] == "undefined") ? "" : valuesAp[6].split(",")[0].trim()) : valuesAp[6].trim(),
                    "Authentication": (valuesAp.length == 14) ? ((typeof valuesAp[6] == "undefined") ? "" : (typeof valuesAp[6].split(",")[1] == "undefined") ? "" : valuesAp[6].split(",")[1].trim()) : valuesAp[7].trim(),
                    "ESSID": (valuesAp.length == 14) ? ((typeof valuesAp[12] == "undefined") ? "" : valuesAp[12]) : ((typeof valuesAp[13] == "undefined") ? "" : valuesAp[13].trim()),
                    "data": r.now().inTimezone("+01:00").toEpochTime(),
                    "Power": pwr,
                    "nameVendor": r.db("Prefix").table("tblPrefix").get(valuesAp[0].substring(0, 8)).getField("vendor").default("UNKNOWN")
                  })}));
      }, {nonAtomic: true}).run(conn)
              .finally(function () {
                conn.close();
              });
    }).then(function (output) {
//    console.log("Query output:", output);
    }).error(function (err) {
      console.log("***************** Ant Ap **************************");
      console.log("Failed:", err);
    });
  }
};