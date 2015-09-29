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
    var vendor = r.db("Prefix").table("tblPrefix").get(mac.substring(0, 8)).getField("vendor").default(null);
    return r.branch(
            vendor.ne(null),
            r.db(self.dbConfig.db)
            .table("AntDisp")
            .get(client)
            .replace(function (row) {
              return r.branch(
                      row.eq(null),
                      {
                        "nomeAntena": client,
                        "host": [{
                            "macAddress": mac,
                            "data": r.now().inTimezone("+01:00").toEpochTime(),
                            "Power": pwr,
                            "BSSID": bssid,
                            "nameVendor": vendor
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
                                    "nameVendor": vendor
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
                          "nameVendor": vendor
                        })}));
            }, {nonAtomic: true, durability: "soft"}), "não faz").run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
    console.log("Ant Disp -> ", client, mac, pwr, bssid);
    console.log("Query Ant Disp output:\n", output);
  }).error(function (err) {
    console.log("***************** Ant Disp **************************");
    console.log("Failed:", err);
  });
};