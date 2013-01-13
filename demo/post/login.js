var generateResponse = function(req, res, next) {

    var username = req.body.username,
        password = req.body.password;

    var response = {
        "username": username,
        "success": password === 'password1'
    };

    res.body = response;

    next();
};

module.exports = {
    path: '/login',
    callback: generateResponse
};
