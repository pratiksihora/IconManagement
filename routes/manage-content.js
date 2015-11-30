var managecontent = require('../controller/manage-content.controller');
module.exports = function (app) {
    app.route('/getmanagecontent')
      .post(managecontent.getmanagecontentdata)
    app.route('/addeditcontenttype')
      .post(managecontent.addeditcontenttype);
}