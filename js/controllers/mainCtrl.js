window.controllers.controller('mainCtrl', ['$scope', 'Theme', '$rootScope', '$http', '$location', '$routeParams', 'ChatServices', '$timeout', 'UsersService',
    function ($scope, Theme, $rootScope, $http, $location, $routeParams, ChatServices, $timeout, UsersService) {


        $scope.facebookLogin = function () {
            facebookConnectPlugin.login(["basic_info", "user_birthday"], function (response) {
                if (response.authResponse) {
                    console.log('Welcome!  Fetching your information.... ');

                } else {
                    console.log('User cancelled login or did not fully authorize.');
                }
            });
        };

        $scope.logoutUser = function () {

            console.log("logoutUser");
            facebookConnectPlugin.logout(function () {
                window.location.href = '/#/';
            }, function () {

            });


        };


        $scope.ChatServices = ChatServices;
        $scope.baseAppPath = baseAppPath;
        $scope.Theme = Theme;
        $scope.UsersService = UsersService;
        UsersService.getUsersFbFriends();

        $scope.toggleBtcMode = function () {

            ChatServices.btcmode == "tnx" ? ChatServices.btcmode = "sat" : ChatServices.btcmode = "tnx";
        };




    }
]);


