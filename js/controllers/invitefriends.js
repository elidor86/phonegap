window.controllers.controller('InviteFriendsController', ['$scope', 'Spinner', 'Theme', 'UsersService', '$timeout', '$window', "Ddp", '$rootScope', '$http', '$location', 'me', 'requests', 'bitcoin', 'friends', 'Analytics', 'GlobalInvitationsService',
    function ($scope, Spinner, Theme, UsersService, $timeout, $window, Ddp, $rootScope, $http, $location, me, requests, bitcoin, friends, Analytics, GlobalInvitationsService) {

        window.wscope = $scope;
        var btcAddressRegex = /^[13][1-9A-HJ-NP-Za-km-z]{26,33}/;


        $scope.$on('selectAll', function () {
            $scope.selectAll();
        });

        $scope.$on('invite', function () {
            $scope.setConnectContentState('invite');
        });


        /*
         $scope.$on('searchText', function (scope, searchText) {
         Theme.searchText=searchText
         });*/


        $scope.analyzeQR = function analyzeQR(event) {

            var invalid = function () {
                Theme.searchText = "invalid qr code";

                $timeout(function () {
                    Theme.searchText = "";
                }, 3000);
                $rootScope.$safeApply();
            };

            qrcode.callback = function (result) {

                console.log("result", result);

                if (result === 'error decoding QR Code') {
                    invalid();
                    return;
                }


                if (btcAddressRegex.test(result)) {
                    Theme.searchText = result;
                    $rootScope.$safeApply();
                    return;
                }

                var uri = new URI(result);

                if (uri.protocol() != 'bitcoin') {
                    invalid();
                    return;
                }


                var address = uri.path();
                if (address && btcAddressRegex.test(address)) {
                    Theme.searchText = address;
                    $rootScope.$safeApply();
                    return;
                }

                invalid();

                /*
                 var query = uri.search(true);

                 if (query.amount) {
                 //   $scope.give.sat = query.amount * 100000000;
                 }
                 if (query.message) {
                 //  $scope.give.message = query.message;
                 }*/
            };

            var img = new Image();
            img.onload = function () {
                qrcode.decode(img.src);
            };

            img.src = $window.URL.createObjectURL(event.target.files[0]);
        };

        jQuery('#qrcode').on('change', $scope.analyzeQR);

        /*
         $scope.setImg = function () {
         //console.log("setImg");
         // jQuery('#qrcode').click();


         var scanner = cordova.require("com.phonegap.plugins.barcodescanner.barcodescanner");

         scanner.scan(
         function (result) {
         alert("We got a barcode\n" +
         "Result: " + result.text + "\n" +
         "Format: " + result.format + "\n" +
         "Cancelled: " + result.cancelled);
         },
         function (error) {
         alert("Scanning failed: " + error);
         }
         );
         };*/

        $scope.connectContentState = "list";
        // Control the visible friend list
        $scope.visibleFriendsLimit = 20;
        //chunk of friends to get when scrolling down
        $scope.friendsChunk = 30;
        $scope.visibleFriends = {};
        //$rootScope.$watch('user.fbUser',$scope.getfriends);

        $scope.getRemaining = function () {

            if ($rootScope.remaining) {
                return $rootScope.remaining - $rootScope.numselected;
            } else {
                return 128 - $rootScope.numselected;
            }

        };

        $scope.goToAddress = function (id) {
            $rootScope.goTo("btc/" + id);
        };

        $scope.giveget = function () {
            window.location.href = '/giveget';
        };

        //Theme.searchText = "";

        //$scope.fbFriends = $rootScope.FBfriends.dontHaveApp;
        $scope.bitUsers = [];

        var getBitconnectUsersByKey = function () {

            Spinner.start();
            $http.post(baseAppUrl + '/getBitconnectUsersByKey', {
                accessToken: access_token,
                keyword: Theme.searchText
            })
                .success(function (data) {


                    for (var i = 0; i < data.length; i++) {

                        if (data[i].uid == $rootScope.user.id) {
                            data.splice(i, 1);
                            continue;
                        }


                        for (var x = 0; x < UsersService.FBfriends.haveApp.length; x++) {
                            if (data[i].uid == UsersService.FBfriends.haveApp[x].uid) {
                                data.splice(i, 1);
                                break;
                            }

                        }

                    }

                    Spinner.complete();

                    $scope.bitUsers = data;
                    $scope.$safeApply();

                })
                .error(function (e) {
                    Spinner.complete();
                    console.log("subme error ", e);
                });

        };

        $scope.btcAddressToSend = null;

        var getBitconnectUsersByAddress = function () {

            Spinner.start();

            $scope.bitUsers = [];
            UsersService.fbFriends = [];

            $http.post(baseAppUrl + '/getUsersListByAddress', {
                accessToken: access_token,
                keyword: Theme.searchText
            })
                .success(function (data) {

                    console.log("data ", data);
                    Spinner.complete();

                    if (_.isObject(data)) {
                        $scope.bitUsers.push(data);
                    } else {
                        $scope.btcAddressToSend = Theme.searchText;
                    }

                    $scope.$safeApply();
                })
                .error(function (e) {
                    Spinner.complete();
                    console.log("subme error ", e);
                });


        };

        $scope.invalidAddress = false;

        $scope.$watch(function () {
            return Theme.searchText;
        }, function (scope, request) {

            Analytics.clickTrack({
                eventCategory: "connect",
                eventAction: "search",
                eventLabel: Theme.searchText
            });

            $scope.invalidAddress = false;
            //console.log("searchText", Theme.searchText);
            $scope.btcAddressToSend = null;
            if (Theme.searchText == "") {
                UsersService.fbFriends = UsersService.FBfriends.dontHaveApp;
            } else {
                if (Theme.searchText.length >= 3 && Theme.searchText.length <= 25) {
                    getBitconnectUsersByKey();
                } else if (Theme.searchText.length >= 25 && btcAddressRegex.test(Theme.searchText)) {
                    if ($rootScope.validateBbcAddress(Theme.searchText)) {
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

                    if (new RegExp("\\b(" + Theme.searchText + ")", "gi").test(UsersService.FBfriends.dontHaveApp[i].name)) {
                        filteredUsers.push(UsersService.FBfriends.dontHaveApp[i]);
                    }
                }


                UsersService.fbFriends = filteredUsers;
            }
        });

        $scope.setConnectContentState = function (state) {

            $scope.connectContentState = state;

        };

        $scope.isIvniteAllMode = false;

        $scope.isSelectAll = false;
        $scope.selectAll = function () {

            if ($scope.isSelectAll) {

                for (var i = 0; i < UsersService.fbFriends.length; i++) {
                    var user = UsersService.fbFriends[i];
                    UsersService.fbFriends[i].isSelected = false;
                }
                $scope.selected = [];
                $rootScope.numselected = 0;
                $scope.isSelectAll = false;

            } else {
                for (var i = 0; i < UsersService.fbFriends.length; i++) {

                    var user = UsersService.fbFriends[i];
                    if (!user.isSelected) {
                        $scope.selected[user.uid] = user;
                        $rootScope.numselected += 1;
                        UsersService.fbFriends[i].isSelected = true;
                    }

                }

                $scope.isSelectAll = true;
            }


        };

        $scope.cancel = function (state) {
            //  $scope.selected = {};
            //  $rootScope.numselected = 0;
            Analytics.clickTrack({
                eventCategory: "connect",
                eventAction: "cancel"
            });
            $scope.setConnectContentState('list');
        };


        $scope.updateVisibleFriends = function () {
            var filter = function (f) {
                if (!$scope.searchstring)
                    return true;
                var friendString = (f.first_name + ' ' + f.last_name).toLowerCase(),
                    searchString = $scope.searchstring.toLowerCase();
                return friendString.indexOf(searchString) >= 0;
            };
            if ($rootScope.user && $rootScope.user.friends && UsersService.FBfriends) {
                $scope.filteredFriends = UsersService.FBfriends.otherFriends.filter(filter);
                var nvf = $scope.filteredFriends.slice(0, $scope.visibleFriendsLimit),
                    nvflist = nvf.map(function (x) {
                        return x.id;
                    }),
                    ovflist = ($scope.visibleFriends.otherFriends || []).map(function (x) {
                        return x.id;
                    });
                if (JSON.stringify(nvflist) != JSON.stringify(ovflist)) {
                    $scope.visibleFriends.otherFriends = nvf;
                }
            }
        };

        //$rootScope.$watch('FBfriends', $scope.updateVisibleFriends);

        // Select friends
        $scope.selected = {};
        $rootScope.numselected = 0;

        $scope.friendsLimit = 50;

        $scope.selectFriend = function (user) {


            console.log("user ", user);
            var id = user.uid;
            if (!$scope.selected[id]) {


                Analytics.clickTrack({
                    eventCategory: "connect",
                    eventAction: "selectFriend",
                    eventLabel: user.uid
                });

                /*
                 if ($scope.getRemaining() <= 0) {
                 $rootScope.message = {
                 body: "there are no more invitations in the system. you can invite the current selection of friends, or unselect some friends in order to invite others",
                 canceltext: 'cool, thanx'
                 };
                 return
                 }*/

                /*
                 if ($rootScope.numselected >= 50) {
                 $rootScope.message = {
                 body: "you have selected 50 friends, the maximum allowed by facebook in one batch. please click invite to send these 50 invitations, and and then select more in another batch",
                 canceltext: 'cool, thanx'
                 };
                 return
                 }*/

                user.isSelected = true;
                $scope.selected[id] = user;
                $rootScope.numselected += 1;

                if ($rootScope.numselected < $rootScope.invitationLimit - $rootScope.usedInvitations) {

                }
            } else {

                Analytics.clickTrack({
                    eventCategory: "connect",
                    eventAction: "unSelectFriend",
                    eventLabel: user.uid
                });

                user.isSelected = false;
                delete $scope.selected[id];
                $rootScope.numselected -= 1;

            }
            $scope.$safeApply();
        };


        $scope.loadMoreFriends = function () {

            Analytics.clickTrack({
                eventCategory: "connect",
                eventAction: "loadMoreFriends"
            });


            if (angular.isUndefined(UsersService.FBfriends) || angular.isUndefined(UsersService.FBfriends.dontHaveApp)) {
                return;
            }

            $scope.friendsLimit = $scope.friendsLimit + 50;

        };

        $scope.selectNone = function () {
            $scope.selected = {};
            $rootScope.numselected = 0;
        };

        $scope.clearSelection = function () {

            for (var i = 0; i < UsersService.fbFriends.length; i++) {
                UsersService.fbFriends[i].isSelected = false;
            }
            $scope.selected = {};
            $rootScope.numselected = 0;
            $scope.isSelectAll = false;
        };


        var fbInviteAll = function (skip, pSelected) {
            var idArr = [];

            var selected = [];

            if (pSelected) {
                selected = pSelected;
            } else {
                _.each($scope.selected, function (user, key, list) {
                    selected.push(user);
                });
            }


            var max = skip + 50 <= selected.length ? skip + 50 : selected.length;

            for (var i = skip; i < max; i++) {
                idArr.push(selected[i].uid);
            }


            facebookConnectPlugin.showDialog({
                method: 'apprequests',
                to: idArr,
                title: 'come bitconnect with me :)',
                message: 'tap "send" at the top right to invite your friend. you will get a reward when they sign up'
            }, function (req) {
                /// console.log(req);
                $scope.clearSelection();
                $scope.setConnectContentState('list');

                $http.post(baseAppUrl + '/mkinvite', {
                    from: $rootScope.user.id,
                    accessToken: access_token,
                    to: idArr,
                    reqid: req.request
                }).success(function (r) {
                    console.log("success ", r);

                })
                    .error(function (e) {
                        console.log("error ", e);
                    });


                if (skip + 50 <= selected.length) {
                    fbInviteAll(skip + 50, selected);
                }


            }, function (err) {
                console.log("facebookConnectPlugin.showDialog ", err);
            });

        };


        // Invite friends
        $scope.invite = function () {
            //console.log(friendId.toString());

            $rootScope.toggleConnect();


            if ($rootScope.numselected > 50) {
                $rootScope.message = {
                    body: 'you have selected ' + $rootScope.numselected + ' friends, who will be invited in batches of 50. send requests in the following ' + Math.ceil($rootScope.numselected / 50) + ' facebook windows',
                    action: function () {
                        $rootScope.message = {};
                        fbInviteAll(0);

                    },
                    cancel: function () {
                        $scope.clearSelection();
                        $scope.cancel();

                    },
                    actiontext: 'ok',
                    canceltext: 'cancel'
                };
            } else {
                fbInviteAll(0);
            }


            Analytics.clickTrack({
                eventCategory: "connect",
                eventAction: "invite"
            });


        };


        $scope.inviteAll = function (state) {

            Analytics.clickTrack({
                eventCategory: "connect",
                eventAction: "inviteAll"
            });

            $rootScope.toggleConnect();

            fbInviteAll(0);


        };


        // Done
        $scope.done = function () {
            $rootScope.goTo('thanx');
        };


    }
]);