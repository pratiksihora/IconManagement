myApp.controller('storeCtrl', function ($scope, $http, $stateParams, $state, ngProgress, Stores, _, $window) {

    $('.removeActiveClass').removeClass('active');
    $('#store').addClass('active');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    $scope.CurrentPage = $state.current.name;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.IsAddStore = $state.current.name == "edit-store" ? false : true;
    $scope.PageTitle = $state.current.name == "edit-store" ? "Edit " : "Add ";
    $scope.channel = [];
    $scope.OldStore = [];
    $scope.cmd_entity_type = 0;
    $scope.Stores = [];
    $scope.currentPageNo = 0;
    $scope.pageLimit = 10;


    Stores.getStores({ Id: $stateParams.id, state: $scope.CurrentPage }, function (store) {
        console.log(store)
        if (store.Channels.length > 0) {
            $scope.Channels = store.Channels;
            $scope.cmd_entity_type = store.Channels[0].cm_id;
        }
        $scope.SelectStoreChannels = [];
        $scope.Stores = store.StoreList;

        if ($scope.CurrentPage == "edit-store") {
            $scope.OldStoreChannels = store.ChannelRights;
            _.each($scope.OldStoreChannels, function (channel) {
                $scope.SelectStoreChannels.push(channel.cmd_entity_detail);
            });
            $scope.Stores.forEach(function (store) {
                $scope.StoreName = store.st_name;
                $scope.StoreURL = store.st_url;
                $scope.StoreId = store.st_id;
                $scope.ld_id = store.ld_id;
                $scope.Email = store.ld_email_id;
                $scope.ContactPerson = store.ld_display_name;
                $scope.MobileNo = store.ld_mobile_no;
                $scope.StoreFrontType = store.st_front_type;
            });
        }
    }, function (error) {
        $scope.error = error;
        $scope.errorvisible = true;
    });

    function GetDeleteStoreChannels(OldStore, SelectedStore) {
        var DeleteArray = [];
        _.each(OldStore, function (oldstore) {
            data = _.find(SelectedStore, function (selected, key) { return selected == oldstore.cmd_entity_detail; });
            if (!data) {
                DeleteArray.push(oldstore.cd_id);
            }
        });
        return DeleteArray;
    }

    function GetAddStore(OldStore, SelectedStore) {
        var AddArray = [];
        _.each(SelectedStore, function (selected) {
            data = _.find(OldStore, function (oldstore, key) { return selected == oldstore.cmd_entity_detail; });
            if (!data) {
                AddArray.push(selected);
            }
        });
        return AddArray;
    }


    $scope.resetForm = function () {
        $scope.storeForm.$setPristine();
        $scope.storeForm.$setValidity();
        $scope.successvisible = false;
        $scope.errorvisible = false;
    }

    $scope.submitForm = function (isValid) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        if (isValid) {
            if (parseInt($scope.MobileNo).toString().length == 10) {
                ngProgress.start();
                var store = {
                    state: $scope.CurrentPage,
                    store_id: $scope.StoreId,
                    store_name: $scope.StoreName,
                    store_site_url: $scope.StoreURL,
                    store_ld_id: $scope.ld_id,
                    store_email: $scope.Email,
                    store_contact_person: $scope.ContactPerson,
                    store_user_no: $scope.MobileNo,
                    store_cmd_entity_type: $scope.cmd_entity_type,
                    store: $scope.SelectStoreChannels,
                    store_front_type: $scope.StoreFrontType,
                    AddStoreChannels: GetAddStore($scope.OldStoreChannels, $scope.SelectStoreChannels),
                    DeleteStoreChannels: GetDeleteStoreChannels($scope.OldStoreChannels, $scope.SelectStoreChannels)
                };
                Stores.AddEditStore(store, function (data) {
                    if (data.success) {
                        if ($scope.CurrentPage == "edit-store") {
                            $window.location.href = "#add-store";
                        }
                        else {
                            $scope.StoreName = '';
                            $scope.StoreURL = '';
                            $scope.Email = '';
                            $scope.ContactPerson = '';
                            $scope.MobileNo = '';
                            $scope.SelectStoreChannels = [];
                            $scope.storeForm.$setPristine();
                            $scope.Stores.push(data.StoreList[0]);
                        }
                        $scope.success = data.message;
                        $scope.successvisible = true;
                    }
                    else {
                        $scope.error = data.message;
                        $scope.errorvisible = true;
                    }
                    ngProgress.complete();
                }
                , function (error) {
                    $scope.error = error;
                    $scope.errorvisible = true;
                    ngProgress.complete();
                });
            }
            else {
                $scope.error = "Invalid Mobile No.";
                $scope.errorvisible = true;
            }
        }
    };
});