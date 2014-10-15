window.controllers.controller('MenuController', ['$scope', '$rootScope', '$http', '$location', 'me', 'requests', 'bitcoin', 'friends',
    function ($scope, $rootScope, $http, $location, me, requests, bitcoin, friends) {
        $scope.closeMenu = function closeMenu() {
            $rootScope.menuOpen = false;
        };



    }
]);