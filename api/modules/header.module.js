const jwt = require("jsonwebtoken");

module.exports = () => {
    const headerModule = {};

    //! *************************************************************************
    //? getUserFromHeader
    //! *************************************************************************
    headerModule.getUserFromHeader = (req) => {
        return new Promise((resolve) => {
            var token = req.headers["authorization"];
            if (!token) {
                return resolve(-1);
            }

            token = token.replace("Bearer ", "");

            let secret = process.env.SECRET;
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    resolve(-1);
                } else {
                    resolve(decoded.usuario_id);
                }
            });
        });
    };

    return headerModule;

}