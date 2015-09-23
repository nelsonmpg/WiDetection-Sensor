/* global module */

var r = require('rethinkdb');
var connectdb = require("./ConnectDb");
var self = this;

/**
 * Insere ou atualiza a tabela que tem todos os Dispositivos wireless detetados
 * @param {type} valsHost
 * @param {type} client
 * @returns {undefined}
 */
module.exports.insertDispMovel = function (client, mac, pwr, bssid, probes) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.dbConfig.db).table("DispMoveis").get(mac).replace(function (row) {
      return r.branch(
              row.eq(null),
              {
                "macAddress": mac,
                "nameVendor": r.db("Prefix").table("tblPrefix").get(mac.substring(0, 8)).getField("vendor").default("UNKNOWN"),
                "Probed_ESSIDs": probes,
                "disp": [{
                    name: client,
                    "First_time": r.now().inTimezone("+01:00").toEpochTime(),
                    "values": [{
                        "Last_time": r.now().inTimezone("+01:00").toEpochTime(),
                        "Power": pwr,
                        "BSSID": bssid
                      }]
                  }]
              },
      r.branch(
              row("disp")("name").contains(client),
              row.merge({
                "Probed_ESSIDs": r.db(self.dbConfig.db)
                        .table("DispMoveis")
                        .get(mac)("Probed_ESSIDs")
                        .setUnion(probes),
                "disp": row('disp').map(function (d) {
                  return r.branch(
                          d('name').eq(client).default(false),
                          d.merge({
                            "values": d('values').append({
                              "Last_time": r.now().inTimezone("+01:00").toEpochTime(),
                              "Power": pwr,
                              "BSSID": bssid
                            })}),
                          d);
                })}), {
        "macAddress": mac,
        "nameVendor": r.db("Prefix").table("tblPrefix").get(mac.substring(0, 8)).getField("vendor").default("UNKNOWN"),
        "Probed_ESSIDs": r.db(self.dbConfig.db)
                .table("DispMoveis")
                .get(mac)("Probed_ESSIDs")
                .setUnion(probes),
        "disp": row("disp").append({
          "name": client,
          "First_time": r.now().inTimezone("+01:00").toEpochTime(),
          "values": [{
              "Last_time": r.now().inTimezone("+01:00").toEpochTime(),
              "Power": pwr,
              "BSSID": bssid
            }]})
      }));
    }, {nonAtomic: true}).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
    console.log("Disp Moveis -> ", client, mac, pwr, bssid, probes);
    console.log("Query Disp output:\n", output);
  }).error(function (err) {
    console.log("***************** Dispp Moveis **************************");
    console.log("Failed:", err);
  });
};