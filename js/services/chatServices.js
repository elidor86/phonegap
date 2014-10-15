window.app.service('ChatServices', ['$rootScope', "Ddp", "HistoryService", "$q", "$http",
    function ($rootScope, Ddp, HistoryService, $q, $http) {

        var ChatServices = {};


        ChatServices.requestMode = "send";
        ChatServices.btcmode = "tnx";


        ChatServices.otherUser = "send";

        var otherUsers = {};

        ChatServices.getOtherUser = function (type, id) {
            console.log("other user ", otherUsers);
            var deferred = $q.defer();

            if (otherUsers[id]) {
                return otherUsers[id];
            }

            $http.get(baseAppUrl + '/user?' + type + '=' + id).success(function (otherUser) {

                console.log("$http.ge ", otherUsers);

                otherUsers[id] = otherUser;
                ChatServices.otherUser = otherUser;
                deferred.resolve(otherUser);
            });

            return deferred.promise;
        };


        return ChatServices;
    }
]);