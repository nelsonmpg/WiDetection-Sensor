/* global module, client */

var r = require('rethinkdb');
var connectdb = require("./ConnectDb");

var self = this;

/**
 * Insere ou atualiza a tabela que tem o sensor com os Devices que detectou
 * @param {type} valuesHst
 * @param {type} client
 * @returns {undefined}
 */
module.exports.insertAntDisp = function (valuesHst, client) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.dbConfig.db).table("AntDisp").get(client).replace(function (row) {
      return r.branch(
              row.eq(null),
              {
                "nomeAntena": client,
                "host": [{"macAddress": valuesHst[0],
                    "data": r.now().inTimezone("+01:00").toEpochTime(),
                    "Power": (typeof valuesHst[3] == "undefined") ? "" : valuesHst[3],
                    "BSSID": (typeof valuesHst[5] == "undefined") ? "" : valuesHst[5].replace(/(,| |\r\n|\n|\r)/g, ""),
                    "nameVendor": r.db("Prefix").table("tblPrefix").get(valuesHst[0].substring(0, 8)).getField("vendor").default("UNKNOWN")
                  }]
              },
      r.branch(
              row("host")("macAddress").contains(valuesHst[0]),
              row.merge({
                "host": row("host").map(function (d) {
                  return r.branch(
                          d("macAddress").eq(valuesHst[0]).default(false),
                          {
                            "macAddress": valuesHst[0],
                            "data": r.now().inTimezone("+01:00").toEpochTime(),
                            "Power": (typeof valuesHst[3] == "undefined") ? "" : valuesHst[3],
                            "BSSID": (typeof valuesHst[5] == "undefined") ? "" : valuesHst[5].replace(/(,| |\r\n|\n|\r)/g, ""),
                            "nameVendor": r.db("Prefix").table("tblPrefix").get(valuesHst[0].substring(0, 8)).getField("vendor").default("UNKNOWN")
                          },
                  d);
                })}),
              {
                "nomeAntena": client,
                "host": row("host").append({
                  "macAddress": valuesHst[0],
                  "data": r.now().inTimezone("+01:00").toEpochTime(),
                  "Power": (typeof valuesHst[3] == "undefined") ? "" : valuesHst[3],
                  "BSSID": (typeof valuesHst[5] == "undefined") ? "" : valuesHst[5].replace(/(,| |\r\n|\n|\r)/g, ""),
                  "nameVendor": r.db("Prefix").table("tblPrefix").get(valuesHst[0].substring(0, 8)).getField("vendor").default("UNKNOWN")
                })}));
    }, {nonAtomic: true}).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
//    console.log("Query output:", output);
  }).error(function (err) {
    console.log("***************** Ant Disp **************************");
    console.log("Failed:", err);
  });
};