myApp.controller('manageContentCtrl', function ($scope, $window, $http, ngProgress, $state, $stateParams, ContentTypes, _) {
    $('.removeActiveClass').removeClass('active');
    $('#manage-content').addClass('active');
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    $scope.CurrentPage = $state.current.name;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.IsAddContent = $state.current.name == "edit-content" ? false : true;
    $scope.PageTitle = $state.current.name == "edit-content" ? "Edit " : "Add ";


    function GetDeleteDeliveryType(OldDeliveryType, SelectedDeliveryType) {
        var DeleteArray = [];
        _.each(OldDeliveryType, function (old) {
            data = _.find(SelectedDeliveryType, function (selected, key) { return selected == old.cmd_entity_detail; });
            if (!data) {
                DeleteArray.push(old.cd_id);
            }
        });
        return DeleteArray;
    }

    function GetAddDeliveryType(OldDeliveryType, SelectedDeliveryType) {
        var AddArray = [];
        _.each(SelectedDeliveryType, function (selected) {
            data = _.find(OldDeliveryType, function (old, key) { return selected == old.cmd_entity_detail; });
            if (!data) {
                AddArray.push(selected);
            }
        });
        return AddArray;
    }


    ContentTypes.getManageContentType({ Id: $stateParams.id, state: $scope.CurrentPage }, function (content) {
        $scope.ParentContentType = _.where(content.ContentMasterList, { cm_name: "Content Type" });
        $scope.AllDeliveryType = _.where(content.ContentMasterList, { cm_name: "Delivery Type" });
        $scope.ContentTypes = content.ContentList;
        $scope.OldContentRights = content.ContentRights;
        if ($scope.CurrentPage == "edit-content") {
            _.each($scope.ContentTypes, function (contenttype) {
                $scope.SelectedParentContentType = contenttype.mct_parent_cnt_type_id;
                $scope.content_delivery_type = contenttype.mct_delivery_type_id;
                $scope.NewContentType = contenttype.contentname;
                $scope.content_id = contenttype.mct_cnt_type_id;
                $scope.mct_id = contenttype.mct_id;
            });
            $scope.SelectParentContentTypeChange();
            _.each($scope.OldContentRights, function (content) {
                $scope.SelectedDeliveryType.push(content.cmd_entity_detail);
            });
        }
    }, function (error) {
                $scope.error = error;
                $scope.errorvisible = true;
                ngProgress.complete();
            });

    $scope.SelectParentContentTypeChange = function () {
        $scope.SelectedDeliveryType = [];
        if ($scope.SelectedParentContentType == "" || !$scope.SelectedParentContentType) {
            $scope.DeliveryType = [];
        }
        else {
            var parent = _.find($scope.ParentContentType, function (dtype) { return dtype.cd_id == $scope.SelectedParentContentType });
            if (parent) {
                if (parent.cd_name == "Audio" || parent.cd_name == "Video") {
                    $scope.DeliveryType = $scope.AllDeliveryType;
                }
                else {
                    $scope.DeliveryType = [];
                    var DeliveryType = _.find($scope.AllDeliveryType, function (dtype) { return dtype.cd_name == "Download" });
                    if (DeliveryType) {
                        $scope.DeliveryType.push(DeliveryType);
                    }
                }
            }
        }
    }
    $scope.resetForm = function () {
        $scope.successvisible = false;
        $scope.errorvisible = false;
    }

    $scope.submitForm = function (isValid) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        if (isValid) {
            ngProgress.start();
            var contenttype = {
                state: $scope.CurrentPage,
                mct_id: $scope.mct_id,
                content_id: $scope.content_id,
                parent_content_type: $scope.SelectedParentContentType,
                content_name: $scope.NewContentType,
                content_delivery_type: $scope.content_delivery_type,
                AddDeliveryType: GetAddDeliveryType($scope.OldContentRights, $scope.SelectedDeliveryType),
                DeleteDeliveryType: GetDeleteDeliveryType($scope.OldContentRights, $scope.SelectedDeliveryType)
            };
            ContentTypes.AddEditContentType(contenttype, function (data) {
                if (data.success) {
                    if ($scope.CurrentPage == "edit-content") {
                        $window.location.href = "#manage-content";
                    }
                    else {
                        $scope.SelectedParentContentType = "";
                        $scope.NewContentType = '';
                        $scope.SelectedDeliveryType = [];
                        $scope.DeliveryType = [];
                        $scope.manageContentForm.$setPristine();
                        $scope.ContentTypes.push(data.ContentList[0]);
                    }
                    $scope.success = data.message;
                    $scope.successvisible = true;
                }
                else {
                    $scope.error = data.message;
                    $scope.errorvisible = true;
                }
                ngProgress.complete();
            }, function (error) {
                $scope.error = error;
                $scope.errorvisible = true;
                ngProgress.complete();
            });
        }
    };
});