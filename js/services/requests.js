angular.module('thanxbits').service('requests', ['$rootScope', 'Theme', '$http', 'RequestTypes', 'TxTypes', 'Analytics', function ($rootScope, Theme, $http, RequestTypes, TxTypes, Analytics) {

    window.rscope = $rootScope;

    this.acceptRequest = function acceptRequest(request, successCB) {

        Analytics.clickTrack({
            eventCategory: "requests",
            eventAction: "acceptRequest",
            eventLabel: request.id
        });

        if (request.requestType === RequestTypes.GET) {
            if (!request) return;
            if (request.tnx > 0) {
                $rootScope.thanxSend(request.sender.fbUser.first_name, request.sender.username, request.tnx, request, request.message, TxTypes.getRequest, successCB);
            } else {
                $rootScope.bitcoinSend(request.sender.username, request.sat, null, request.message, request.id, function (err) {
                    if (err) {
                        $rootScope.errHandle(err);
                    } else if (successCB) {
                        successCB();
                    }
                });
            }
        } else if (request.requestType === RequestTypes.GIVE) {

            $http.post(baseAppUrl + '/acceptgive', {
                accessToken: access_token,
                requestId: request.id
            }).success(function (r) {
                //$rootScope.$broadcast('updateRequest', r);
                if (successCB) {
                    successCB();
                }
            });

            /*
             $rootScope.message = {
             body: 'get ' + request.tnx + ' thanx from ' + request.sender.username + '?',
             action: function () {
             $http.post('/acceptgive', {
             requestId: request.id
             }).success(function (r) {
             $rootScope.$broadcast('updateRequest', r);

             $rootScope.message = {};
             if (successCB) {
             successCB();
             }
             });
             },
             actiontext: 'yep',
             canceltext: 'nope'
             };*/
        }
    };

    this.acceptTwoWayRequest = function acceptTwoWayRequest(request, successCB) {

        console.log("acceptTwoWayRequest", request);

        var tx = null;
        if (request.secondTx.units == 'sat') {
            $rootScope.bitcoinTwoWay(request.sender.id, parseInt(request.secondTx.amount), 10000, '', undefined).then(function (txS) {
                tx = txS;
                console.log("tx ", tx);
                acceptTwoWayRequest();
            });
        } else {
            acceptTwoWayRequest();
        }

        function acceptTwoWayRequest() {

            $http.post(baseAppUrl + '/accepttwoway', {
                accessToken: access_token,
                tx: tx,
                requestId: request.id
            }).success(function (r) {


            });

        }

    };

    this.rejectRequest = function rejectRequest(request, direction) {

        Analytics.clickTrack({
            eventCategory: "requests",
            eventAction: "rejectRequest",
            eventLabel: request.id
        });

        Theme.showConfirmModal(direction == 'incoming' ?
            'are you sure you want to reject?' : 'are you sure you want to cancel your request?', function () {

            $http.post(baseAppUrl + '/clearrequest', {
                accessToken: access_token,
                request_id: request.id
            })
                .success(function (r) {
                    $rootScope.$broadcast('updateRequest', r);
                    $rootScope.message = {};
                    /*
                     $rootScope.message = {
                     body: direction == 'incoming' ? 'rejected' : 'cancelled',
                     canceltext: 'cool thanx'
                     };*/
                })
                .error(function (e) {
                    $rootScope.message = {
                        body: e,
                        canceltext: 'cool thanx'
                    };
                });

        });


    };

}]);