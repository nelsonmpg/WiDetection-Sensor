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
module.exports.insertAntDisp = function (client, mac, pwr, bssid) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.dbConfig.db).table("AntDisp").get(client).replace(function (row) {
      return r.branch(
              row.eq(null),
              {
                "nomeAntena": client,
                "host": [{
                    "macAddress": mac,
                    "data": r.now().inTimezone("+01:00").toEpochTime(),
                    "Power": pwr,
                    "BSSID": bssid,
                    "nameVendor": r.db("Prefix").table("tblPrefix").get(mac.substring(0, 8)).getField("vendor").default("UNKNOWN")
                  }]
              },
      r.branch(
              row("host")("macAddress").contains(mac),
              row.merge({
                "host": row("host").map(function (d) {
                  return r.branch(
                          d("macAddress").eq(mac).default(false),
                          {
                            "macAddress": mac,
                            "data": r.now().inTimezone("+01:00").toEpochTime(),
                            "Power": pwr,
                            "BSSID": bssid,
                            "nameVendor": r.db("Prefix").table("tblPrefix").get(mac.substring(0, 8)).getField("vendor").default("UNKNOWN")
                          },
                  d);
                })}),
              {
                "nomeAntena": client,
                "host": row("host").append({
                  "macAddress": mac,
                  "data": r.now().inTimezone("+01:00").toEpochTime(),
                  "Power": pwr,
                  "BSSID": bssid,
                  "nameVendor": r.db("Prefix").table("tblPrefix").get(mac.substring(0, 8)).getField("vendor").default("UNKNOWN")
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