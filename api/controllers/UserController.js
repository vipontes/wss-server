const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const moment = require("moment-timezone");

const headerModule = require("../modules/header.module")();

const timeToExpire = 60 * 60 * 24; // Um dia

module.exports = (app, db) => {
  const controller = {};

  //! **************************************************************
  //? login
  //! **************************************************************
  controller.login = (req, res) => {
    const phoneNumber = db.escape(req.body.usuario_telefone);
    const password = req.body.usuario_senha;

    if (password == undefined) {
      res.status(400).send({ message: "Senha inválida." });
      return;
    }

    const secret = process.env.SECRET;
    const paswordHash = crypto
      .createHmac("sha512", secret)
      .update(password)
      .digest("hex");

    var sql = `SELECT 
                usuario_id, 
                usuario_senha, 
                usuario_ativo 
                FROM usuario 
                WHERE usuario_telefone = ${phoneNumber}`;

    db.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage);
        res.status(400).send({ message: errors.queryError });
      } else if (result.length == 0) {
        res.status(401).send({ message: "Dados inválidos." });
      } else {
        let data = result[0];

        if (data.usuario_ativo == 0) {
          res.status(400).send({
            message:
              "Este usuário encontra-se bloqueado no sistema. Entre em contato com o administrador.",
          });
        } else if (data.usuario_senha != paswordHash) {
          res.status(400).send({ message: "Senha inválida" });
        } else {
          const userId = data.usuario_id;

          const tokenPayload = {
            usuario_id: userId * 1,
            expiresAt: Math.floor(Date.now() / 1000) + timeToExpire,
          };
          var token = jwt.sign(tokenPayload, secret);

          const refreshTokenPayload = {
            usuario_id: userId * 1,
            random: Math.floor(Math.random() * 100000000) + 1,
          };
          var refreshToken = jwt.sign(refreshTokenPayload, secret);

          sql = `UPDATE usuario SET usuario_token = '${token}', usuario_refresh_token = '${refreshToken}' WHERE usuario_id = ${userId}`;
          db.query(sql, (err, result) => {
            if (err) {
              console.log(err.sqlMessage);
              res.status(400).send({ message: errors.queryError });
            } else {
              sql = `SELECT 
              usuario_id,
              usuario_nome,
              usuario_telefone,
              '' AS usuario_senha,
              usuario_ativo,
              usuario_data_criacao,
              usuario_token,
              usuario_refresh_token
              FROM usuario
              WHERE usuario_id = ${userId}`;

              db.query(sql, (err, result) => {
                if (err) {
                  console.log(err.sqlMessage);
                  res.status(400).send({ message: errors.queryError });
                } else {
                  data = result[0];
                  res.status(200).send(data);
                }
              });
            }
          });
        }
      }
    });
  };

  //! **************************************************************
  //? postUser
  //! **************************************************************
  controller.postUser = (req, res) => {
    let userName = req.body.usuario_nome;
    let userPass = req.body.usuario_senha;
    let userPhone = req.body.usuario_telefone;

    if (userPhone == undefined) {
      res.status(400).send({
        message: "Informe número do telefone.",
      });
      return;
    }

    if (userName == undefined) {
      res.status(400).send({
        message: "Informe o nome do usuário.",
      });
      return;
    }

    if (userPass == undefined) {
      res.status(400).send({
        message: "Informe a senha do usuário.",
      });
      return;
    }

    const secret = process.env.SECRET;
    const hashPass = crypto
      .createHmac("sha512", secret)
      .update(userPass)
      .digest("hex");

    var sql = "INSERT INTO usuario (??) VALUES (?, ?, ?)";
    var columns = ["usuario_nome", "usuario_telefone", "usuario_senha"];
    var inserts = [columns, userName, userPhone, hashPass];
    sql = db.format(sql, inserts);

    db.query(sql, (err, result) => {
      if (err) {
        if (err.errno == 1062) {
          res
            .status(401)
            .send({ message: "Este telefone já foi cadastrado.." });
        } else {
          console.log(err.sqlMessage);
          res.status(400).send({ message: errors.queryError });
        }
      } else {
        data = { usuario_id: result.insertId };
        res.status(200).send(data);
      }
    });
  };

  //! **************************************************************
  //? getUser
  //! **************************************************************
  controller.getUser = (req, res) => {
    let userId = req.params.usuario_id;

    sql = `SELECT 
        usuario_id,
        usuario_nome,
        usuario_telefone,
        usuario_ativo,
        usuario_data_criacao
        FROM usuario
        WHERE usuario_id = ${userId}`;

    db.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage);
        res.status(400).send({ message: errors.queryError });
      } else {
        res.status(200).send(result[0]);
      }
    });
  };

  //! **************************************************************
  //? getUsers
  //! **************************************************************
  controller.getUsers = (req, res) => {
    sql = `SELECT 
        usuario_id,
        usuario_nome,
        usuario_telefone,
        usuario_ativo,
        usuario_data_criacao
        FROM usuario
        ORDER BY usuario_nome ASC`;

    db.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage);
        res.status(400).send({ message: errors.queryError });
      } else {
        res.status(200).send(result);
      }
    });
  };

  //! **************************************************************
  //? getAllUsersExceptMe
  //! **************************************************************
  controller.getAllUsersExceptMe = async (req, res) => {

    let usuarioId = await headerModule.getUserFromHeader(req);

    sql = `SELECT 
        usuario_id,
        usuario_nome,
        usuario_telefone,
        usuario_ativo,
        usuario_data_criacao
        FROM usuario
        WHERE usuario_id <> ${usuarioId}
        ORDER BY usuario_nome ASC`;

    db.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage);
        res.status(400).send({ message: errors.queryError });
      } else {
        res.status(200).send(result);
      }
    });
  };

  return controller;
};
