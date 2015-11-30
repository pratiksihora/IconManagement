 
var country = require('../controller/country.controller');

module.exports = function (app) {
    app.route('/getcountry')
      .post(country.getcountrydata)
    app.route('/submitcountry')
      .post(country.submitcountry);
}