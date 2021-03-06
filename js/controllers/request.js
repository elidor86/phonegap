window.controllers.controller('RequestController', ['$scope', '$rootScope', '$timeout', '$http', '$location', 'me', 'bitcoin', 'friends', 'HistoryService',
    function($scope, $rootScope, $timeout, $http, $location, me, bitcoin, friends, HistoryService) {

        window.wscope = $scope;



        this.gethistory = function gethistory(tryCached) {
            if (tryCached) {
                var cachedHistory = HistoryService.getCachedHistory();
                if (cachedHistory) {
                    $scope.history = cachedHistory;
                    return;
                }
            }
            HistoryService.getHistory(function(h) {
                // Do the object equality check so that we do not refresh unless we have to
                var newh = h.map(function(x) {
                    return x.id;
                }),
                    oldh = ($scope.history || []).map(function(x) {
                        return x.id;
                    });
                if (JSON.stringify(newh) != JSON.stringify(oldh)) {
                    $scope.history = h;
                }
            });
        };
        $scope.toggleMenu = function toggleMenu() {
            $rootScope.menuOpen = !$rootScope.menuOpen;
        }
        setInterval(this.gethistory, 5000);
        this.gethistory(true);
    }
]);