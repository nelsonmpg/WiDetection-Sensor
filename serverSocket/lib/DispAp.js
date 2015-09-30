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
module.exports.insertDispAp = function (client, mac, pwr, chnl, priv, cphr, ath, essid, spd) {
  r.connect(self.dbData).then(function (conn) {
    var vendor = r.db("Prefix").table("tblPrefix").get(mac.substring(0, 8)).getField("vendor").default("UNKNOWN");
    var lastTime = r.db(self.dbConfig.db)
            .table("DispAp").get(mac)("disp")
            .filter({name: client})("values")
            .map(function (x) {
              return  x.orderBy(r.desc(("Last_time"))).limit(1)("Last_time").nth(0);
            }).nth(0).default(0);
    var atualTime = r.now().inTimezone("+01:00").toEpochTime();
    return r.branch(
            vendor.ne(null).and(lastTime.lt(atualTime.sub(600))), // 10 minutos
            r.db(self.dbConfig.db)
            .table("DispAp")
            .get(mac)
            .replace(function (row) {
              return r.branch(
                      row.eq(null),
                      {
                        "macAddress": mac,
                        "nameVendor": vendor,
                        "channel": chnl,
                        "Speed": spd,
                        "Privacy": priv,
                        "Cipher": cphr,
                        "Authentication": ath,
                        "ESSID": essid,
                        "disp": [{
                            name: client,
                            "First_time": atualTime,
                            "values": [{
                                "Last_time": atualTime,
                                "Power": pwr
                              }]
                          }]
                      },
              r.branch(
                      row("disp")("name").contains(client),
                      row.merge({
                        "channel": chnl,
                        "Speed": spd,
                        "Privacy": priv,
                        "Cipher": cphr,
                        "Authentication": ath,
                        "ESSID": essid,
                        "disp": row('disp').map(function (d) {
                          return r.branch(
                                  d('name').eq(client).default(false),
                                  d.merge({
                                    "values": d("values").append({
                                      "Last_time": atualTime,
                                      "Power": pwr
                                    })}),
                                  d);
                        })}),
                      {"macAddress": mac,
                        "nameVendor": vendor,
                        "channel": chnl,
                        "Speed": spd,
                        "Privacy": priv,
                        "Cipher": cphr,
                        "Authentication": ath,
                        "ESSID": essid,
                        "disp": row('disp').append({
                          name: client,
                          "First_time": atualTime,
                          "values": [{
                              "Last_time": atualTime,
                              "Power": pwr
                            }]
                        })}));
            }, {nonAtomic: true, durability: "soft"}), "nao faz").run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
//    if (output.changes != 1 && output.replaced != 1) {
//      console.log("Disp Ap -> ", client, mac, pwr, chnl, priv, cphr, ath, essid, spd);
//      console.log("Query Disp Ap output:\n", output);
//    }
  }).error(function (err) {
    console.log("***************** Dispp Ap **************************");
    console.log("Failed:", err);
  });
};