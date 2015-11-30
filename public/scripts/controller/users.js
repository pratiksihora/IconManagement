 
var site_base_path = '';
//var site_base_path = 'http://dailymagic.in';
myApp.controller('usersCtrl', function ($scope, $http, ngProgress, $timeout, Users, $state) {
    $scope.base_url = site_base_path;
    $('.removeActiveClass').removeClass('active');
    $('.removeSubactiveClass').removeClass('active');
    $('#changepassword').addClass('active');

    $scope.Permission = true;
    $scope.IsDisable = true;
    $scope.Vendor = [];
    $scope.Users = [];
    $scope.UserRole = [];
    $scope.SelectedUserRole = 0;
    $scope.UserList = [];
    $scope.successvisible = false;
    $scope.success = false;
    $scope.errorvisible = false;
    $scope.error = false;
    $scope.passwordtype = "password";
    $scope.newpasswordtype = "password";
    $scope.confirmpasswordtype = "password";

    $scope.usercurrentPage = 0;
    $scope.userpageSize = 5;

    $scope.connectionError = false;
    $scope.error;

    ngProgress.color('yellowgreen');
    ngProgress.height('3px');

    $scope.addEditUsers = function (id) {
        $scope.error = "";
        $scope.success = "";
        Users.addEditUsers({ ld_id: id }, function (user) {
            if (user.RoleUser === "Super Admin") {
                $scope.UserRole = angular.copy(user.UserRole);
                $scope.FullName = user.UserData[0].ld_display_name;
                $scope.UserName = user.UserData[0].ld_user_name;
                $scope.EmailId = user.UserData[0].ld_email_id;
                $scope.MobileNo = user.UserData[0].ld_mobile_no;
                $scope.SelectedUserRole = user.UserData[0].ld_role;
                $scope.ld_Id = user.UserData[0].ld_id;
            }
            else {
                location.href = "/";
            }
        });
    }

    $scope.SaveUserDetails = function () {
        $scope.NameValidation = false;
        $scope.UserNameValidation = false;
        $scope.EmailValidation = false;
        $scope.MobileValidation = false;
        $scope.RoleValidationVisible = false;
        $scope.VendorValidation = false;

        $scope.errorvisible = false;
        $scope.error = "";
        $scope.success = "";

        if ($scope.FullName != "") {
            if ($scope.UserName != "") {
                if ($scope.EmailId != "" && validateEmail($scope.EmailId)) {
                    if (!isNaN($scope.MobileNo) && $scope.MobileNo != "" && $scope.MobileNo.toString().length == 10) {
                        if ($scope.SelectedUserRole != 0) {
                            if ($scope.ld_Id === undefined) {
                                ngProgress.start();
                                var datas = {
                                    FullName: $scope.FullName,
                                    UserName: $scope.UserName,
                                    EmailId: $scope.EmailId,
                                    MobileNo: $scope.MobileNo,
                                    Role: $scope.SelectedUserRole
                                }
                                Users.saveUser(datas, function (data) {
                                    if (data.Result == "AddEditUsers") {
                                        Users.getUsers(function (users) {
                                            $scope.UserList = angular.copy(users.UserData);
                                            $scope.UserRole = angular.copy(users.UserRole);
                                        });
                                        $state.transitionTo('users');
                                        $scope.FullName = "";
                                        $scope.UserName = "";
                                        $scope.EmailId = "";
                                        $scope.MobileNo = "";
                                        $scope.SelectedVendorList = [];
                                        $scope.SelectedUserRole = 0;
                                        $scope.successvisible = true;
                                        $scope.success = "Record inserted successfully. Temprory Password sent to register email.";
                                    }
                                    if (data.Result == "EmailIdError") {
                                        $scope.errorvisible = true;
                                        $scope.error = "Email Already Available.";
                                    }
                                    if (data.Result == "UserNameError") {
                                        $scope.errorvisible = true;
                                        $scope.error = "UserName  Already Available.";
                                    }
                                    if (data.Result == "MobileNoError") {
                                        $scope.errorvisible = true;
                                        $scope.error = "MobileNo Already Available.";
                                    }
                                    ngProgress.complete();
                                })
                            } else {
                                ngProgress.start();
                                var datas = {
                                    ld_Id: $scope.ld_Id,
                                    FullName: $scope.FullName,
                                    UserName: $scope.UserName,
                                    EmailId: $scope.EmailId,
                                    MobileNo: $scope.MobileNo,
                                    Role: $scope.SelectedUserRole
                                }
                                Users.updateUser(datas, function (data) {
                                    if (data.Result == "UsersUpdated") {
                                        $scope.successvisible = true;
                                        Users.getUsers(function (users) {
                                            $scope.UserList = angular.copy(users.UserData);
                                            $scope.UserRole = angular.copy(users.UserRole);
                                        });
                                        $state.transitionTo('users');
                                        //$window.location.href = "#add-edit";
                                        $scope.success = "Record Updated successfully.";
                                    }
                                    if (data.Result == "EmailIdError") {
                                        $scope.errorvisible = true;
                                        $scope.error = "Email Already Available.";
                                    }
                                    if (data.Result == "UserNameError") {
                                        $scope.errorvisible = true;
                                        $scope.error = "UserName  Already Available.";
                                    }
                                    if (data.Result == "MobileNoError") {
                                        $scope.errorvisible = true;
                                        $scope.error = "MobileNo Already Available.";
                                    }
                                    ngProgress.complete();
                                });
                            }
                        }
                        else {
                            $scope.RoleValidationVisible = true;
                        }
                    }
                    else {
                        $scope.MobileValidation = true;
                    }
                }
                else {
                    $scope.EmailValidation = true;
                }
            }
            else {
                $scope.UserNameValidation = true;
            }
        }
        else {
            $scope.NameValidation = true;
        }

    }

    $scope.OldPassword = "";
    $scope.NewPassword = "";
    $scope.ConfirmPassword = "";
    $scope.ConfirmPasswordValidation = false;
    $scope.OldPasswordValidation = false;

    $scope.SaveChangedPassword = function () {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        if ($scope.NewPassword == $scope.ConfirmPassword) {
            ngProgress.start();
            var datas = {
                "oldpassword": $scope.OldPassword,
                "newpassword": $scope.NewPassword
            };
            Users.changePassword(datas, function (data) {
                console.log(data);
                ngProgress.complete();
                if (data.success) {
                    $scope.OldPassword = "";
                    $scope.NewPassword = "";
                    $scope.ConfirmPassword = "";
                    $scope.success = data.message;
                    $scope.successvisible = true;
                }
                else {
                    $scope.error = data.message;
                    $scope.errorvisible = true;
                }
            });
        }
        else {
            $scope.error = "Confirm Password does not match.";
            $scope.errorvisible = true;
        }
    };

    $scope.Resetclick = function () {
        $scope.successvisible = false;
        $scope.errorvisible = false;
    };

    $scope.Passwordvisible = function (val) {
        if (val == 1) {
            $scope.passwordtype = $scope.passwordtype == "password" ? "text" : "password";
        }
        else if (val == 2) {
            $scope.newpasswordtype = $scope.passwordtype == "password" ? "text" : "password";
        }
        else {
            $scope.confirmpasswordtype = $scope.passwordtype == "password" ? "text" : "password";
        }
    }
});

myApp.filter('startFrom', function () {
    return function (input, start) {
        if (!input || !input.length) { return; }
        start = +start; //parse to int
        return input.slice(start);
    }
});

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);

}