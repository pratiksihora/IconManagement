 

var assignright = require('../controller/assign-right.controller');
module.exports = function (app) {
    app.route('/getassignright')
      .post(assignright.getassignrights)
    app.route('/updateassignright')
      .post(assignright.updateassignright);
}