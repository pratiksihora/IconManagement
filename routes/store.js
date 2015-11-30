/**
* Created by sujata.patne on 15-07-2015.
*/
var store = require('../controller/store.controller');

module.exports = function (app) {
    app.route('/getstore')
      .post(store.getstoredata)
    app.route('/addeditstore')
      .post(store.AddEditStore);
}