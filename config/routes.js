/**
* Created by sujata.patne on 7/7/2015.
*/
module.exports = function (app) {
    require('../routes/index')(app);
    require('../routes/store')(app);
    require('../routes/assign-right')(app);
    require('../routes/country')(app);
    require('../routes/manage-content')(app);

    app.use('/*', function (req, res, next) {
        res.status(404).json({ "error": "No such service present" });
    })

    app.use('*', function (req, res, next) {
        res.status(404).send('<html><body><h1>404 Page Not Found</h1></body></html>');
    })
}
