 
myApp.service('Stores', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = '';
    service.getStores = function (data, success, error) {
        $http.post(service.baseRestUrl + '/getstore', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

     service.AddEditStore = function (data, success, error) {
        $http.post(service.baseRestUrl + '/addeditstore', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    return service;
} ]);