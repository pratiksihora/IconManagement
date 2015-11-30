 
myApp.service('Countrys', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = '';
    service.getCountrys = function (data, success, error) {
        $http.post(service.baseRestUrl + '/getcountry', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

     service.SubmitCountrys = function (data, success, error) {
        $http.post(service.baseRestUrl + '/submitcountry', data).success(function (items) {
            success(items);
        }).error(function (err) {
            error(err);
        });
    }

    return service;
} ]);