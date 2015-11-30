 
var site_base_path = '';
//var site_base_path = 'http://dailymagic.in';
myApp.controller('dashboardCtrl', function ($scope, $http, ngProgress) {
    $scope.base_url = site_base_path;
    $('.removeActiveClass').removeClass('active');
    $('.removeSubactiveClass').removeClass('active');

    $('#dashboard').addClass('active');

    var Json = {
        ContentStatus: [{ 'id': 1, 'name': 'Content file upload pending', 'Count': 1450 },
            { 'id': 2, 'name': 'In Process', 'Count': 250 },
            { 'id': 3, 'name': 'Ready to Moderate', 'Count': 280 },
            { 'id': 4, 'name': 'Published', 'Count': 12890 },
            { 'id': 5, 'name': 'Rejected', 'Count': 780 },
            { 'id': 6, 'name': 'Inactive', 'Count': 230 },
            { 'id': 7, 'name': 'Deleted', 'Count': 120 }],
        PublishedContentList: [{ 'id': 1, 'VendorType': 'Vendor 1', 'Wallpaper': 250, 'FullSong': 450, 'Videos': 125, 'GamesApps': 85, 'Total': 0 },
            { 'id': 2, 'VendorType': 'Vendor 2', 'Wallpaper': 850, 'FullSong': 380, 'Videos': 210, 'GamesApps': 22, 'Total': 0 },
            { 'id': 3, 'VendorType': 'Vendor 3', 'Wallpaper': 1570, 'FullSong': 1400, 'Videos': 52, 'GamesApps': 106, 'Total': 0 },
            { 'id': 4, 'VendorType': 'Vendor 4', 'Wallpaper': 1200, 'FullSong': 570, 'Videos': 388, 'GamesApps': 47, 'Total': 0 },
            { 'id': 5, 'VendorType': 'Vendor 5', 'Wallpaper': 1700, 'FullSong': 220, 'Videos': 890, 'GamesApps': 60, 'Total': 0 },
            { 'id': 6, 'VendorType': 'Vendor 6', 'Wallpaper': 820, 'FullSong': 580, 'Videos': 835, 'GamesApps': 71, 'Total': 0 }]
    }
    $scope.ContentStatus = Json.ContentStatus;
    $scope.PublishedContentList = Json.PublishedContentList;
    $scope.TotalUpload = 0;
    $scope.WallpaperTotal = 0;
    $scope.FullSongTotal = 0;
    $scope.VideosTotal = 0;
    $scope.GamesAppsTotal = 0;
    $scope.GrandTotal = 0;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');

    $scope.FilesStatus = [];
    $scope.FileNames = [];
    $scope.Vendors = [];
    $scope.StatusFiles = [];
    $scope.VendorFiles = [];
    $scope.TotalUpload = 10;
    $scope.FileGridData = [];
    $scope.VendorGridData = [];

});