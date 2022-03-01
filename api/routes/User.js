module.exports = (app, db) => {
    const controller = require("../controllers/UserController")(app, db);
    const middleware = require("../middleware/auth")(app, db);

    app.route("/user").post(controller.postUser);
    app.route('/user/login').post(controller.login);
    app.route('/user/all').all(middleware.accessAuth).get(controller.getUsers);
    app.route('/user/all-except-me').all(middleware.accessAuth).get(controller.getAllUsersExceptMe);
    app.route('/user/:usuario_id').all(middleware.accessAuth).get(controller.getUser);
}