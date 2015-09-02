/* global module */

var r = require('rethinkdb');
var ini = require('ini');
var fs = require('fs');
var connectdb = require('./ConnectDb.js');
// #### Connection details

// RethinkDB database settings. Defaults can be overridden using environment variables.
var dbConfig = {
  db: 'user',
  tables: {
    'users': 'id'
  }
};

var self = this;

/**
 * Verfica se existe a base de dados e as tabelas se não cronstroi-as
 * @returns {undefined}
 */
module.exports.setup = function () {
  r.connect(self.dbData).then(function (connection) {
    r.dbCreate(dbConfig.db).run(connection, function (err, result) {
      if (err) {
        console.log("[DEBUG] RethinkDB database '%s' already exists (%s:%s)\n%s", dbConfig.db, err.name, err.msg, err.message);
      } else {
        console.log("[INFO ] RethinkDB database '%s' created", dbConfig.db);
      }

      for (var tbl in dbConfig.tables) {
        (function (tableName) {
          r.db(dbConfig.db).tableCreate(tableName, {primaryKey: dbConfig.tables[tbl]}).run(connection, function (err, result) {
            if (err) {
              console.log("ERROR: %s:%s", err.name, err.msg);
            } else {
              console.log("[INFO ] RethinkDB table '%s' created", tableName);
            }
          });
        })(tbl);
      }
    });
  });
};

/**
 * Consultsa a base dedados se o utilizador existe e se e o correto
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.loginUser = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db("user").table("users")
            .filter({"email": req.body.email})
            .filter({"pass": req.body.pass})
            .withFields("id", "fullname", "email", "logo")
            .coerceTo("array")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
    res.send(output);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Regista o novo utili<zador
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.registeruser = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db("user").table("users").filter({"email": req.body.email}).count().do(function (valor) {
      return r.branch(valor.eq(0),
              r.db("user").table("users").insert({"email": req.body.email, "fullname": req.body.fullname, "pass": req.body.pass, "logo": ""}),
              false)
    }).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
    res.send(output);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getsitelist = function (req, res) {
  var cfg = ini.parse(fs.readFileSync('./MainConfig.ini', 'utf-8'));
  // carrega as configuracoes do ficheiro ini para as variaveis
  r.connect(self.dbData).then(function (conn) {
    return r.dbList().map({"db": r.row})
            .filter(r.row("db").ne("rethinkdb"))
            .filter(r.row("db").ne("user"))
            .filter(r.row("db").ne("Prefix"))
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (result) {
    var val = {
      host: cfg.database.host,
      port: cfg.database.port,
      authKey: Base64.encode(cfg.database.projectname, "hex"),
      dblist: result
    };
    res.send(val);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

// Create Base64 Object
var Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode: function (e) {
    var t = "";
    var n, r, i, s, o, u, a;
    var f = 0;
    e = Base64._utf8_encode(e);
    while (f < e.length) {
      n = e.charCodeAt(f++);
      r = e.charCodeAt(f++);
      i = e.charCodeAt(f++);
      s = n >> 2;
      o = (n & 3) << 4 | r >> 4;
      u = (r & 15) << 2 | i >> 6;
      a = i & 63;
      if (isNaN(r)) {
        u = a = 64;
      } else if (isNaN(i)) {
        a = 64;
      }
      t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);
    }
    return t;
  }, decode: function (e) {
    var t = "";
    var n, r, i;
    var s, o, u, a;
    var f = 0;
    e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (f < e.length) {
      s = this._keyStr.indexOf(e.charAt(f++));
      o = this._keyStr.indexOf(e.charAt(f++));
      u = this._keyStr.indexOf(e.charAt(f++));
      a = this._keyStr.indexOf(e.charAt(f++));
      n = s << 2 | o >> 4;
      r = (o & 15) << 4 | u >> 2;
      i = (u & 3) << 6 | a;
      t = t + String.fromCharCode(n);
      if (u != 64) {
        t = t + String.fromCharCode(r);
      }
      if (a != 64) {
        t = t + String.fromCharCode(i);
      }
    }
    t = Base64._utf8_decode(t);
    return t;
  }, _utf8_encode: function (e) {
    e = e.replace(/\r\n/g, "\n");
    var t = "";
    for (var n = 0; n < e.length; n++) {
      var r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
      } else if (r > 127 && r < 2048) {
        t += String.fromCharCode(r >> 6 | 192);
        t += String.fromCharCode(r & 63 | 128);
      } else {
        t += String.fromCharCode(r >> 12 | 224);
        t += String.fromCharCode(r >> 6 & 63 | 128);
        t += String.fromCharCode(r & 63 | 128);
      }
    }
    return t;
  }, _utf8_decode: function (e) {
    var t = "";
    var n = 0;
    var r = c1 = c2 = 0;
    while (n < e.length) {
      r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
        n++;
      } else if (r > 191 && r < 224) {
        c2 = e.charCodeAt(n + 1);
        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
        n += 2;
      } else {
        c2 = e.charCodeAt(n + 1);
        c3 = e.charCodeAt(n + 2);
        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        n += 3;
      }
    }
    return t;
  }
};
