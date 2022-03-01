module.exports = (app, db) => {
    const controller = require("../controllers/MessageController")(app, db);
    const middleware = require("../middleware/auth")(app, db);

    app.route("/message").all(middleware.accessAuth).post(controller.postMessage);
    app.route('/message/by-user/:usuario_id').all(middleware.accessAuth).get(controller.getMessagesByUser);
}