 
myApp.service('Users', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = '';
    service.getUsers = function(success){
        $http.get(service.baseRestUrl + '/users').success(function (items) {
            success(items);
        });
    }

    service.updateUser = function(data,success){
        $http.post(service.baseRestUrl + '/updateUsers', data).success(function (items) {
            success(items);
        });
    }
    service.saveUser = function(data,success){
        $http.post(service.baseRestUrl + '/saveUsers', data).success(function (items) {
            success(items);
        });
    }

    service.addEditUsers = function(data,success){
        $http.post(service.baseRestUrl + '/addEditUsers',data).success(function (items) {
            success(items);
        });
    }

    service.changePassword = function(data,success){
        $http.post(service.baseRestUrl + '/changepassword',data).success(function (items) {
            success(items);
        });
    }

    return service;
}]);