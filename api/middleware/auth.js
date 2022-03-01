const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");

module.exports = (app, db) => {
  const auth = {};

  //! *************************************************************************
  //? accessAuth
  //! *************************************************************************
  auth.accessAuth = (req, res, next) => {
    var token = req.headers["authorization"];

    if (!token) {
      return res.status(401).send({ auth: false, error: "Token not found" });
    }

    token = token.replace("Bearer ", "");
    let secret = process.env.SECRET;
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        console.log(err);
        return res
          .status(401)
          .send({ auth: false, error: "Invalid token. User not found." });
      } else {
        const expiresAt = decoded.expiresAt;
        var currentDateTime = new Date();
        var expireDate = moment(expiresAt * 1000).toDate();
        if (currentDateTime > expireDate) {
          res.status(401).json({ error: "Token expired." });
        } else {
          let usuarioId = decoded.usuario_id;

          let sql = `SELECT usuario_id FROM usuario 
                       WHERE usuario_id = ${usuarioId}
                       AND usuario_token = '${token}'`;
          db.query(sql, (err, result) => {
            if (err) {
              console.log(err.sqlMessage);
              res.status(400).send({ error: errors.queryError });
            } else {
              if (result.length > 0) {
                next();
              } else {
                res.status(400).json({
                  auth: false,
                  error: "Invalid token. User not found.",
                });
              }
            }
          });
        }
      }
    });
  };

  return auth;
};
