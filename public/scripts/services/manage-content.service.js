myApp.service('ContentTypes', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = '';

    service.getManageContentType = function (data, success, error) {
        $http.post(service.baseRestUrl + '/getmanagecontent', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    service.AddEditContentType = function (data, success, error) {
        $http.post(service.baseRestUrl + '/addeditcontenttype', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }
     
    return service;
} ]);