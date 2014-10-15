window.app.service('connect', ['$rootScope', 'UsersService', 'Ddp', function ($rootScope, UsersService) {

    var Connect = {};

    Connect.searchText = null;
    Connect.invalidAddress = false;

    $rootScope.$watch('searchText', function () {

        Analytics.clickTrack({
            eventCategory: "connect",
            eventAction: "search",
            eventLabel: Connect.searchText
        });

        Connect.invalidAddress = false;
        console.log("searchText", $scope.searchText);
        $scope.btcAddressToSend = null;
        if ($scope.searchText == "") {
            UsersService.fbFriends = UsersService.FBfriends.dontHaveApp;
        } else {
            if ($scope.searchText.length >= 3 && $scope.searchText.length <= 25) {
                getBitconnectUsersByKey();
            } else if ($scope.searchText.length >= 25 && btcAddressRegex.test($scope.searchText)) {
                if ($rootScope.validateBbcAddress($scope.searchText)) {
                    getBitconnectUsersByAddress();
                } else {
                    $scope.invalidAddress = true;

                }
                return
            } else {
                $scope.bitUsers = [];
            }

            var filteredUsers = [];

            for (var i = 0; i < UsersService.FBfriends.dontHaveApp.length; i++) {

                if (new RegExp("\\b(" + $scope.searchText + ")", "gi").test(UsersService.FBfriends.dontHaveApp[i].name)) {
                    filteredUsers.push(UsersService.FBfriends.dontHaveApp[i]);
                }
            }


            UsersService.fbFriends = filteredUsers;
        }
    });


    return Connect;

}]);