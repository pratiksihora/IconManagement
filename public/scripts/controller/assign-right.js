
myApp.controller('assignRightCtrl', function ($scope, $http, ngProgress, $stateParams, AssignRights, $state, _, $window) {
    $('.removeActiveClass').removeClass('active');
    $('#assign-right').addClass('active');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.CurrentPage = $state.current.name;

    AssignRights.GetAssignRights({ state: $scope.CurrentPage }, function (assignrights) {

        $scope.Stores = assignrights.Stores;
        $scope.StoreChannels = assignrights.StoreChannels;

        $scope.AllContentTypes = assignrights.ContentTypes;
        $scope.AllCountrys = assignrights.Countrys;
        $scope.AllPaymentTypes = assignrights.PaymentTypes;
        $scope.AllPaymentChannels = assignrights.PaymentChannels;
        $scope.VendorCountry = assignrights.VendorCountry;

        $scope.PartnerDistibutionChannels = assignrights.PartnerDistibutionChannels;
        $scope.VendorCountrys = assignrights.VendorCountrys;

        $scope.AssignCountrys = assignrights.AssignCountrys;
        $scope.AssignPaymentTypes = assignrights.AssignPaymentTypes;
        $scope.AssignPaymentChannels = assignrights.AssignPaymentChannels;
        $scope.AssignContentTypes = assignrights.AssignContentTypes;
        $scope.AssignVendors = assignrights.AssignVendors;

        var srorecontent = _.find(assignrights.MasterList, function (store) { return store.cm_name == "Store" });
        if (srorecontent) {
            $scope.StoreContentType = srorecontent.cd_id;
        }
        if ($scope.CurrentPage == "assign-right-manage") {
            $scope.SelectedStore = parseInt($stateParams.id);
            $scope.storeChange();
        }

    }, function (error) {
        $scope.error = error;
        $scope.errorvisible = true;
    });

    $scope.storeChange = function () {

        var store = _.find($scope.Stores, function (store) { return store.st_id == $scope.SelectedStore });
        if (store) {
            $scope.PricePointDetail = store.st_pricepoint_url;
            $scope.country_group_id = store.st_country_distribution_rights;
            $scope.payment_type_group_id = store.st_payment_type;
            $scope.payment_channel_group_id = store.st_payment_channel;
            $scope.vendor_group_id = store.st_vendor;
            $scope.content_type_group_id = store.st_content_type;
            $scope.ContentTypes = $scope.AllContentTypes;
            $scope.Countrys = $scope.AllCountrys;
            $scope.PaymentTypes = $scope.AllPaymentTypes;
            $scope.SelectedGeoLocation = _.pluck(_.where($scope.AssignCountrys, { cmd_group_id: store.st_country_distribution_rights }), "cmd_entity_detail");
            $scope.SelectedPaymentType = _.pluck(_.where($scope.AssignPaymentTypes, { cmd_group_id: store.st_payment_type }), "cmd_entity_detail");
            $scope.SelectContentType = _.pluck(_.where($scope.AssignContentTypes, { cmd_group_id: store.st_content_type }), "cmd_entity_detail");
            $scope.countryChange();
            $scope.SelectedVendor = _.pluck(_.where($scope.AssignVendors, { cmd_group_id: store.st_vendor }), "cmd_entity_detail");
            $scope.SelectedPaymentChannel = _.pluck(_.where($scope.AssignPaymentChannels, { cmd_group_id: store.st_payment_channel }), "cmd_entity_detail");

        }
        else {
            $scope.PricePointDetail = null;
            $scope.country_group_id = null;
            $scope.payment_type_group_id = null;
            $scope.payment_channel_group_id = null;
            $scope.vendor_group_id = null;
            $scope.content_type_group_id = null;
            $scope.Vendors = [];
            $scope.ContentTypes = [];
            $scope.Countrys = [];
            $scope.PaymentTypes = [];
            $scope.PaymentChannels = [];
            $scope.SelectedGeoLocation = [];
            $scope.SelectedPaymentType = [];
            $scope.SelectedPaymentChannel = [];
            $scope.SelectContentType = [];
            $scope.SelectedVendor = [];
        }
    }


    $scope.countryChange = function () {
        var Vendors = _.filter($scope.VendorCountry, function (country) { return _.contains($scope.SelectedGeoLocation, country.r_country_distribution_rights) });
        var Vendorarray = [];
        $scope.Vendors = [];
        _.each(Vendors, function (cnt) {
            if (Vendorarray.indexOf(cnt.vd_id) == -1) {
                Vendorarray.push(cnt.vd_id);
                $scope.Vendors.push(cnt);
            }
        });
        var storechannels = _.pluck(_.where($scope.StoreChannels, { st_id: $scope.SelectedStore }), "cmd_entity_detail");
        var paymentchannels = _.filter($scope.PartnerDistibutionChannels, function (channel) { return _.contains($scope.SelectedGeoLocation, channel.partner_cty_id) && _.contains(storechannels, channel.en_id) });
        var channelarray = [];
        $scope.PaymentChannels = [];
        _.each(paymentchannels, function (channel) {
            if (channelarray.indexOf(channel.partner_id) == -1) {
                channelarray.push(channel.partner_id);
                $scope.PaymentChannels.push(channel);
            }
        });
    }

    function GetDeleteAssignRights(OldData, SelectedData, GroupId, type, DeleteArray) {
        _.each(OldData, function (old) {
            var data = _.find(SelectedData, function (selected, key) { return selected == old.cmd_entity_detail && old.cmd_group_id == GroupId });
            if (!data) {
                DeleteArray.push({ cmd_entity_detail: old.cmd_entity_detail, cmd_group_id: GroupId, Type: type });
            }
        });
        return DeleteArray;
    }

    function GetAddAssignRights(OldData, SelectedData, GroupId, type, AddArray) {
        _.each(SelectedData, function (selected) {
            var data = _.find(OldData, function (old, key) { return selected == old.cmd_entity_detail && old.cmd_group_id == GroupId });
            if (!data) {
                AddArray.push({ cmd_entity_detail: selected, cmd_group_id: GroupId, Type: type });
            }
        });
        return AddArray;
    }

    $scope.resetForm = function () {
        location.reload();
        $scope.successvisible = false;
        $scope.errorvisible = false;
    }

    $scope.submitForm = function (isValid) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        if (isValid) {
            var AddArray = [];
            var DeleteArray = [];
            AddArray = GetAddAssignRights(_.where($scope.AssignCountrys, { cmd_group_id: $scope.country_group_id }), $scope.SelectedGeoLocation, $scope.country_group_id, "country", AddArray);
            DeleteArray = GetDeleteAssignRights(_.where($scope.AssignCountrys, { cmd_group_id: $scope.country_group_id }), $scope.SelectedGeoLocation, $scope.country_group_id, "country", DeleteArray);
            AddArray = GetAddAssignRights(_.where($scope.AssignPaymentTypes, { cmd_group_id: $scope.payment_type_group_id }), $scope.SelectedPaymentType, $scope.payment_type_group_id, "paymenttype", AddArray);
            DeleteArray = GetDeleteAssignRights(_.where($scope.AssignPaymentTypes, { cmd_group_id: $scope.payment_type_group_id }), $scope.SelectedPaymentType, $scope.payment_type_group_id, "paymenttype", DeleteArray);
            AddArray = GetAddAssignRights(_.where($scope.AssignPaymentChannels, { cmd_group_id: $scope.payment_channel_group_id }), $scope.SelectedPaymentChannel, $scope.payment_channel_group_id, "paymentchannel", AddArray);
            DeleteArray = GetDeleteAssignRights(_.where($scope.AssignPaymentChannels, { cmd_group_id: $scope.payment_channel_group_id }), $scope.SelectedPaymentChannel, $scope.payment_channel_group_id, "paymentchannel", DeleteArray);
            AddArray = GetAddAssignRights(_.where($scope.AssignContentTypes, { cmd_group_id: $scope.content_type_group_id }), $scope.SelectContentType, $scope.content_type_group_id, "contenttype", AddArray);
            DeleteArray = GetDeleteAssignRights(_.where($scope.AssignContentTypes, { cmd_group_id: $scope.content_type_group_id }), $scope.SelectContentType, $scope.content_type_group_id, "contenttype", DeleteArray);
            AddArray = GetAddAssignRights(_.where($scope.AssignVendors, { cmd_group_id: $scope.vendor_group_id }), $scope.SelectedVendor, $scope.vendor_group_id, "vendor", AddArray);
            DeleteArray = GetDeleteAssignRights(_.where($scope.AssignVendors, { cmd_group_id: $scope.vendor_group_id }), $scope.SelectedVendor, $scope.vendor_group_id, "vendor", DeleteArray);

            var store = {
                storeId: $scope.SelectedStore,
                AddAssignRights: AddArray,
                DeleteAssignRights: DeleteArray,
                country_group_id: $scope.country_group_id,
                payment_type_group_id: $scope.payment_type_group_id,
                payment_channel_group_id: $scope.payment_channel_group_id,
                vendor_group_id: $scope.vendor_group_id,
                content_type_group_id: $scope.content_type_group_id,
                pricepoint_url: $scope.PricePointDetail,
                store_content_type: $scope.StoreContentType
            }
            ngProgress.start();
            AssignRights.UpdateAssignRights(store, function (data) {
                if (data.success) {
                    $window.location.href = "#add-store";
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
    };

});