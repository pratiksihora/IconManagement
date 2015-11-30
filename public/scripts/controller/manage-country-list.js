myApp.controller('manageCountryListCtrl', function ($scope, $http, ngProgress, $state, $stateParams, Countrys) {

    $('.removeActiveClass').removeClass('active');
    $('#manage-country-list').addClass('active');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    $scope.CurrentPage = $state.current.name;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.resetvisible = $stateParams.id ? false : true;
    $scope.country_content_type = "";
    $scope.addgroupvisible = false;
    $scope.groupcountryvisible = false;

    function GetCountrys(CountryData) {
        var CountryList = [];
        _.each($scope.AllCountryList, function (cnt) {
            var data = _.find(CountryData, function (managecnt) {
                return cnt.cd_name == managecnt.cd_name
            })
            if (!data) {
                CountryList.push(cnt);
            }
        })
        return CountryList;
    }



    function BindPageData(country) {
        $scope.SelectedGroup = "";
        $scope.selectedCountries = [];
        var iconcontent = _.find(country.MasterCountryList, function (mastar) { return mastar.cm_name == "icon_geo_location" });
        if (iconcontent) {
            $scope.icon_content_type = iconcontent.cm_id;
        }
        var contentgroup = _.find(country.MasterCountryList, function (mastar) { return mastar.cm_name == "country_group" });
        if (contentgroup) {
            $scope.content_group = contentgroup.cm_id;
        }
        $scope.AllCountryList = _.where(country.CountryList, { cm_name: "global_country_list" });
        $scope.OldManageCountry = _.where(country.CountryList, { cm_name: "icon_geo_location" });
        $scope.CountryList = GetCountrys($scope.OldManageCountry);
        $scope.ManagedCountrys = [];
        _.each($scope.OldManageCountry, function (cnt) {
            $scope.ManagedCountrys.push(cnt);
        })
        $scope.AllGroups = _.where(country.CountryList, { cm_name: "country_group" });
        $scope.AllGroups.unshift({ cd_id: -1, cd_name: "Add New Group" });
        $scope.ManagedGroupCountry = country.CountryGroups;
        $scope.OldManagedGroupCountry = country.CountryGroups;
        $scope.SelectGroupChange();
    }

    Countrys.getCountrys({ state: $scope.CurrentPage }, function (country) {
        $scope.CountryPageLoadData = country;
        BindPageData($scope.CountryPageLoadData);
    }, function (error) {
        $scope.error = error;
        $scope.errorvisible = true;
    });

    $scope.resetform = function () {
        $scope.errorvisible = false;
        $scope.successvisible = false;
        BindPageData($scope.CountryPageLoadData);
    }
    function GetAddNewCountryInIcon(OldData, TotalData) {
        var AddArray = [];
        _.each(TotalData, function (total) {
            var data = _.find(OldData, function (old) { return old.cd_name == total.cd_name });
            if (!data) {
                AddArray.push(total);
            }
        })
        return AddArray;
    }
    $scope.add_countries = function () {
        _.each($scope.selectedCountries, function (selected) {
            var index = _.findIndex($scope.CountryList, function (cnt) { return cnt.cd_name == selected })
            if (index > -1) {
                var data = $scope.CountryList[index];
                $scope.ManagedCountrys.push(data);
                $scope.CountryList.splice(index, 1);
            }
        })
        $scope.selectedCountries = [];
    }

    function GetGroupCountry(CountryData) {
        var CountryList = [];
        _.each($scope.AllCountryList, function (cnt) {
            var data = _.find(CountryData, function (managecnt) { return cnt.cd_name == managecnt.cd_name })
            if (!data) {
                CountryList.push(cnt);
            }
        })
        return CountryList;
    }

    $scope.SelectGroupChange = function () {
        if (!$scope.SelectedGroup || $scope.SelectedGroup == "") {
            $scope.groupcountryvisible = false;
            $scope.addgroupvisible = false;
        }
        else if ($scope.SelectedGroup == "Add New Group") {
            $scope.NewGroupName = "";
            $scope.GroupPendingCountry = [];
            _.each($scope.AllCountryList, function (country) {
                $scope.GroupPendingCountry.push(country)
            })
            $scope.GroupCountry = [];
            $scope.addgroupvisible = true;
            $scope.groupcountryvisible = true;
        }
        else {
            var groupcountry = _.where($scope.ManagedGroupCountry, { cm_name: $scope.SelectedGroup });
            $scope.OldGroupPendingCountry = [];
            _.each(groupcountry, function (country) {
                $scope.OldGroupPendingCountry.push(country);
            });
            $scope.GroupPendingCountry = GetGroupCountry(groupcountry);
            $scope.GroupCountry = groupcountry;
            $scope.addgroupvisible = false;
            $scope.groupcountryvisible = true;
        }
    }

    $scope.left_countries = function () {
        _.each($scope.SelectedPendingCountry, function (selected) {
            var index = _.findIndex($scope.GroupPendingCountry, function (cnt) { return cnt.cd_name == selected })
            if (index > -1) {
                var data = $scope.GroupPendingCountry[index];
                $scope.GroupCountry.push(data);
                $scope.GroupPendingCountry.splice(index, 1);
            }
        })
        $scope.SelectedPendingCountry = [];
    }

    $scope.right_countries = function () {
        _.each($scope.SelectedGroupCountry, function (selected) {
            var index = _.findIndex($scope.GroupCountry, function (cnt) { return cnt.cd_id == selected })
            if (index > -1) {
                var data = $scope.GroupCountry[index];
                $scope.GroupPendingCountry.push(data);
                $scope.GroupCountry.splice(index, 1);
            }
        })
        $scope.SelectedGroupCountry = [];
    }

    function GetAddNewCountryInGroup(OldData, TotalData, group_id) {
        var AddArray = [];
        _.each(TotalData, function (total) {
            var data = _.find(OldData, function (old) { return old.cd_name == total.cd_name });
            if (!data) {
                AddArray.push(total);
            }
        })
        return AddArray;
    }
    function GetDeleteNewCountryInGroup(OldData, TotalData, group_id) {
        var DeleteArray = [];
        _.each(OldData, function (old) {
            var data = _.find(TotalData, function (total) { return old.cd_name == total.cd_name });
            if (!data) {
                DeleteArray.push(old);
            }
        })
        return DeleteArray;
    }

    $scope.SubmitForm = function (isValid) {
        $scope.errorvisible = false;
        $scope.successvisible = false;
        if (isValid) {

            var group;
            if (!$scope.SelectedGroup || $scope.SelectedGroup == "") {
                group = {
                    status: "NoGroup",
                    group_id: $scope.SelectedGroup,
                    group_name: '',
                    icon_content_type: $scope.icon_content_type,
                    content_group: $scope.content_group,
                    AddCountryForGroup: [],
                    DeleteCountryForGroup: [],
                    ChangedCountry: GetAddNewCountryInIcon($scope.OldManageCountry, $scope.ManagedCountrys)
                }
            }
            else if ($scope.SelectedGroup == "Add New Group") {
                if ($scope.NewGroupName && $scope.NewGroupName != "") {
                    var index = _.findIndex($scope.AllGroups, function (cnt) { return cnt.cd_name.toLowerCase() == $scope.NewGroupName.toLowerCase() })
                    if (index == -1) {
                        if ($scope.GroupCountry.length > 0) {
                            group = {
                                status: "NewGroup",
                                group_name: $scope.NewGroupName,
                                group_id: $scope.SelectedGroup,
                                icon_content_type: $scope.icon_content_type,
                                content_group: $scope.content_group,
                                AddCountryForGroup: $scope.GroupCountry,
                                DeleteCountryForGroup: [],
                                ChangedCountry: GetAddNewCountryInIcon($scope.OldManageCountry, $scope.ManagedCountrys)
                            }
                        }
                        else {
                            $scope.error = "Please select country for new Group.";
                            $scope.errorvisible = true;
                        }
                    }
                    else {
                        $scope.error = "Group Name must be unique.";
                        $scope.errorvisible = true;
                    }
                }
                else {
                    $scope.error = "Group Name is required.";
                    $scope.errorvisible = true;
                }
            }
            else {
                if ($scope.GroupCountry.length > 0) {
                    group = {
                        status: "UpdateGroup",
                        group_id: _.find($scope.ManagedGroupCountry, function (managegroup) { return managegroup.cm_name == $scope.SelectedGroup }).cm_id,
                        group_name: '',
                        icon_content_type: $scope.icon_content_type,
                        content_group: $scope.content_group,
                        AddCountryForGroup: GetAddNewCountryInGroup($scope.OldGroupPendingCountry, $scope.GroupCountry, $scope.SelectedGroup),
                        DeleteCountryForGroup: GetDeleteNewCountryInGroup($scope.OldGroupPendingCountry, $scope.GroupCountry, $scope.SelectedGroup),
                        ChangedCountry: GetAddNewCountryInIcon($scope.OldManageCountry, $scope.ManagedCountrys)
                    }
                }
                else {
                    $scope.error = "Please select country for Group.";
                    $scope.errorvisible = true;
                }
            }
            if (group) {
                if (group.ChangedCountry.length > 0 || group.AddCountryForGroup.length > 0 || group.DeleteCountryForGroup.length > 0) {
                    ngProgress.start();
                    Countrys.SubmitCountrys(group, function (country) {
                        if (country.success) {
                            $scope.CountryPageLoadData = country;
                            BindPageData($scope.CountryPageLoadData);
                            $scope.success = country.message;
                            $scope.successvisible = true;
                        }
                        else {
                            $scope.error = country.message;
                            $scope.errorvisible = true;
                        }
                        ngProgress.complete();
                    }, function (error) {
                        $scope.error = error;
                        $scope.errorvisible = true;
                        ngProgress.complete();
                    });
                }
            }
        }
    }
});