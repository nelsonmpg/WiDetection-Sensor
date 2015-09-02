/* global module */

var r = require('rethinkdb');
var connectdb = require("./ConnectDb");

var self = this;

/**
 * Insert ou update da tabela ActiveAnt com os dados do sensor que esta a transmintir
 * @param {type} client     nome do sensor
 * @param {type} latitude   latitude para o google maps
 * @param {type} longitude  longitude para o google maps
 * @param {type} local      localizacao / city do sensor
 * @param {type} posx       posicao X para colocar na planta
 * @param {type} posy       posicao Y para colocar na planta
 * @returns {undefined}
 */
module.exports.insertActiveAnt = function (client, latitude, longitude, local, posx, posy) {
  r.connect(self.dbData).then(function (conn) {
    return r.db(self.dbConfig.db)
            .table("ActiveAnt")
            .get(client)
            .replace(function (row) {
              return r.branch(
                      row.eq(null),
                      {
                        "nomeAntena": client,
                        "latitude": latitude,
                        "longitude": longitude,
                        "local": local,
                        "data": r.now().inTimezone("+01:00"),
                        "posX": posx,
                        "posY": posy,
                        "memory": "",
                        "cpu": "",
                        "disc": ""
                      },
              {
                "nomeAntena": client,
                "latitude": latitude,
                "longitude": longitude,
                "local": local,
                "data": r.now().inTimezone("+01:00"),
                "posX": posx,
                "posY": posy,
                "memory": "",
                "cpu": "",
                "disc": ""
              });
            }).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
//    console.log("Query output:", output);
  }).error(function (err) {
    console.log("***************** Active Ant **************************");
    console.log("Failed:", err);
  });
};

/**
 * Faz o update databela Active Ant
 * @param {type} client   Nome do sensor
 * @param {type} mem      memoria utilizada do so do sensor
 * @param {type} cpu      cpu utilizado do so so sensor
 * @param {type} disc     disco utilizado do sensor
 * @returns {undefined}
 */
module.exports.updateActiveAnt = function (client, mem, cpu, disc) {
  r.connect(self.dbData).then(function (conn) {
    return  r.db(self.dbConfig.db)
            .table("ActiveAnt")
            .get(client)
            .update({
              "data": r.now().inTimezone("+01:00"),
              "memory": mem,
              "cpu": cpu,
              "disc": disc
            }).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
//    console.log("Query output:", output);
  }).error(function (err) {
    console.log("***************** Active Ant Update **************************");
    console.log("Failed:", err);
  });
};

/**
 * Insert ou Update da planta de localizacao do sensor
 * @param {type} client
 * @param {type} plant
 * @returns {undefined}
 */
module.exports.insertPlant = function (client, plant) {
  r.connect(self.dbData).then(function (conn) {
    return  r.db(self.dbConfig.db)
            .table("plantSite")
            .get(client)
            .replace(function (row) {
              return r.branch(
                      row.eq(null),
                      {
                        "nomeAntena": client,
                        "img": plant
                      },
              {
                "nomeAntena": client,
                "img": plant
              });
            }).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
//    console.log("Query output:", output);
  }).error(function (err) {
    console.log("***************** Insert ou update da planta **************************");
    console.log("Failed:", err);
  });
};