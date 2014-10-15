window.controllers.controller('headerController', ['$scope', 'Theme', '$rootScope', '$timeout', '$http', 'HistoryService',
    function ($scope, Theme, $rootScope, $timeout, $http, HistoryService) {

        $scope.isSelectAll = false;

        $scope.selectAll = function () {
            $scope.isSelectAll = $scope.isSelectAll ? false : true;
            $rootScope.$broadcast('selectAll');
        };

        $scope.invite = function () {
            $rootScope.$broadcast('invite');
        };


    }
]);