const moment = require("moment");

module.exports = (app, db) => {
  const controller = {};

  //! **************************************************************
  //? postMessage
  //! **************************************************************
  controller.postMessage = (req, res) => {
    let sender = req.body.usuario_emissor_id;
    let receiver = req.body.usuario_receptor_id;
    let content = req.body.mensagem_conteudo;

    if (sender == undefined) {
      res.status(400).send({
        message: "Informe id do remetente.",
      });
      return;
    }

    if (receiver == undefined) {
      res.status(400).send({
        message: "Informe o id do receptor.",
      });
      return;
    }

    if (content == undefined) {
      res.status(400).send({
        message: "Informe o conteúdo da mensagem.",
      });
      return;
    }

    let currentDate = moment().format("YYYY-MM-DD HH:mm:ss");

    var sql = "INSERT INTO mensagem (??) VALUES (?, ?, ?, ?)";
    var columns = [
      "usuario_emissor_id",
      "usuario_receptor_id",
      "mensagem_conteudo",
      "mensagem_data",
    ];
    var inserts = [columns, sender, receiver, content, currentDate];
    sql = db.format(sql, inserts);

    db.query(sql, (err, result) => {
      if (err) {
        console.log(err.sqlMessage);
        res.status(400).send({ message: errors.queryError });
      } else {
        data = {
          mensagem_id: result.insertId,
          usuario_emissor_id: sender,
          usuario_receptor_id: receiver,
          mensagem_conteudo: content,
          mensagem_data: currentDate,
        };
        res.status(200).send(data);
      }
    });
  };

  //! **************************************************************
  //? getMessagesByUser
  //! **************************************************************
  controller.getMessagesByUser = (req, res) => {
    let userId = req.params.usuario_id;

    sql = `SELECT 
        mensagem_id,
        usuario_emissor_id,
        usuario_receptor_id,
        mensagem_conteudo,
        mensagem_data
        FROM mensagem
        WHERE usuario_emissor_id = ${userId} 
        OR usuario_receptor_id = ${userId}
        ORDER BY mensagem_data ASC`;

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
