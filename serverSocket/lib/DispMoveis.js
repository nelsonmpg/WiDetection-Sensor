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
module.exports.insertDispMovel = function (valsHost, client) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.dbConfig.db).table("DispMoveis").get(valsHost[0]).replace(function (row) {
      return r.branch(
              row.eq(null),
              {
                "macAddress": valsHost[0],
                "nameVendor": r.db("Prefix").table("tblPrefix").get(valsHost[0].substring(0, 8)).getField("vendor").default(""),
                "Probed_ESSIDs": (typeof valsHost[6] == "undefined") ? [] : valsHost[6].replace(/(\r\n|\n|\r)/gm, "").split(","),
                "disp": [{
                    name: client,
                    "First_time": r.now().inTimezone("+01:00").toEpochTime(),
                    "values": [{
                        "Last_time": r.now().inTimezone("+01:00").toEpochTime(),
                        "Power": (typeof valsHost[3] == "undefined") ? "" : valsHost[3],
                        "BSSID": (typeof valsHost[5] == "undefined") ? "" : valsHost[5].replace(/(,| |\r\n|\n|\r)/g, "")
                      }]
                  }]
              },
      r.branch(
              row("disp")("name").contains(client),
              row.merge({
                "Probed_ESSIDs": r.db(self.dbConfig.db)
                        .table("DispMoveis")
                        .get(valsHost[0])("Probed_ESSIDs")
                        .setUnion((typeof valsHost[6] == "undefined") ? [] : valsHost[6].replace(/(\r\n|\n|\r)/gm, "").split(",")),
                "disp": row('disp').map(function (d) {
                  return r.branch(
                          d('name').eq(client).default(false),
                          d.merge({
                            "values": d('values').append({
                              "Last_time": r.now().inTimezone("+01:00").toEpochTime(),
                              "Power": (typeof valsHost[3] == "undefined") ? "" : valsHost[3],
                              "BSSID": (typeof valsHost[5] == "undefined") ? "" : valsHost[5].replace(/(,| |\r\n|\n|\r)/g, "")
                            })}),
                          d);
                })}), {
        "macAddress": valsHost[0],
        "nameVendor": r.db("Prefix").table("tblPrefix").get(valsHost[0].substring(0, 8)).getField("vendor").default(""),
        "Probed_ESSIDs": r.db(self.dbConfig.db)
                .table("DispMoveis")
                .get(valsHost[0])("Probed_ESSIDs")
                .setUnion((typeof valsHost[6] == "undefined") ? [] : valsHost[6].replace(/(\r\n|\n|\r)/gm, "").split(",")),
        "disp": row("disp").append({
          "name": client,
          "First_time": r.now().inTimezone("+01:00").toEpochTime(),
          "values": [{
              "Last_time": r.now().inTimezone("+01:00").toEpochTime(),
              "Power": (typeof valsHost[3] == "undefined") ? "" : valsHost[3],
              "BSSID": (typeof valsHost[5] == "undefined") ? "" : valsHost[5].replace(/(,| |\r\n|\n|\r)/g, "")
            }]})
      }));
    }, {nonAtomic: true}).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
//    console.log("Query Disp output:\n", output);
  }).error(function (err) {
    console.log("***************** Dispp Moveis **************************");
    console.log("Failed:", err);
  });
};