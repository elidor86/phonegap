window.app.service('UsersService', ['$rootScope', '$http', 'Ddp', '$q', function ($rootScope, $http, Ddp, $q) {
    var cachedUsers,
        cachedPartialName;


    var setUser = function (u) {
        $rootScope.user = u ? u : profile;
        $rootScope.firstname = $rootScope.user.fbUser.first_name.toLowerCase();
        $rootScope.lastname = $rootScope.user.fbUser.last_name.toLowerCase();
        $rootScope.username = ($rootScope.user.fbUser.username || ($rootScope.firstname + '_' + $rootScope.lastname)).split('.').join('');

        $rootScope.$safeApply();
    };

    var self = this;
    this.FBfriends = {};
    self.FBfriends.haveApp = [];
    self.FBfriends.dontHaveApp = [];

    $rootScope.$on('balanceUpdate', function (scope, obj) {
        if (obj && obj.amount) {
            $rootScope.user.tnx = obj.amount;
            console.log("$rootScope.user.tnx ", $rootScope.user.tnx);
            console.log("obj.amount ", obj.amount);
            $rootScope.$safeApply();
        }
    });

    $rootScope.$on('onResume', function (scope) {
        console.log("onResume user");
        var jqxhr = jQuery.get(baseAppUrl + "/me?accessToken=" + access_token, function () {
            //alert("success");
        }).done(function (data) {

            window.profile = data;
            profile = data;
            setUser();

            $rootScope.$safeApply();

        }).fail(function (err) {
            console.log('err ', err);
        });
    });

    this.getUsersFbFriends = function () {

        console.log("getUsersFbFriends");
        facebookConnectPlugin.getLoginStatus(function (response) {

            console.log("getUsersFbFriends getLoginStatus response", response);

            if (response.status === 'connected') {


                var uid = response.authResponse.userID;
                var accessToken = response.authResponse.accessToken;

                //console.log("uid ", uid);

                var v = "";
                if (typeof device != 'undefined' && (device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos")) {
                    v = 'v1.0/';
                }

                facebookConnectPlugin.api(v + uid + "/friends?fields=installed,name", ["user_friends"],
                    function (result) {
                        console.log("getUsersFbFriends result ", result);
                        self.FBfriends.haveApp = [];
                        self.FBfriends.dontHaveApp = [];

                        var users = result.data;
                        for (var i = 0; i < users.length; i++) {
                            users[i].uid = users[i].id;
                            if (users[i].installed) {
                                self.FBfriends.haveApp.push(users[i]);
                            } else {
                                self.FBfriends.dontHaveApp.push(users[i]);
                            }
                        }

                        // console.log("getUsersFbFriends self.FBfriends ", self.FBfriends);

                        self.FBfriends.haveApp = _.sortBy(self.FBfriends.haveApp, function (item) {
                            return item.name;
                        });

                        self.FBfriends.dontHaveApp = _.sortBy(self.FBfriends.dontHaveApp, function (item) {
                            return item.name;
                        });


                        self.fbFriends = self.FBfriends.dontHaveApp;
                        $rootScope.$safeApply();

                        //console.log(" this.fbFriends ", self.fbFriends);
                    },
                    function (error) {
                        console.log("facebookConnectPlugin error", error);

                    });


            } else if (response.status === 'not_authorized') {
                // the user is logged in to Facebook,
                // but has not authenticated your app
            } else {
                // the user isn't logged in to Facebook.
            }
        });


    };

    this.loginWithFacebook = function loginWithFacebook(doLogin) {
        var deferred = $q.defer();

        var login = function (response) {

            console.log("login response", response);
            access_token = response.authResponse.accessToken;
            //window.profile = response.authResponse.userID;

            profile = {}, window.profile = {};

            profile.id = response.authResponse.userID;
            window.profile.id = response.authResponse.userID;
            window.fb_id = response.authResponse.userID;

            self.getUsersFbFriends();

            $http.post(baseAppUrl + '/subme', {
                accessToken: access_token
            })
                .success(function (r) {

                })
                .error(function (e) {
                    console.log("subme error ", e);
                });

            /*
             Ddp.connect().then(function () {
             deferred.resolve();
             $rootScope.$safeApply();
             });*/


            function initPushNotification() {


                if (window.cordova) {

                    pushNotification = window.plugins.pushNotification;

                    function errorHandler(error) {

                        console.log('pushNotification error', error);
                        //alert('error = ' + error);
                    }

                    function tokenHandler(result) {
                        console.log("result ", result);

                        $http.post(baseAppUrl + '/updateapntoken', {token: result, accessToken: access_token})
                            .success(function (r) {
                                console.log("updateapntoken success", r);
                            })
                            .error(function (e) {
                                console.log("updateapntoken error", e);
                            });


                        // alert('device token = ' + result);
                    }

                    function successHandler(result) {
                        console.log("result ", result);


                        // alert('device token = ' + result);
                    }

                    if (device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos") {

                        pushNotification.register(
                            successHandler,
                            errorHandler,
                            {
                                "senderID": "338945528543",
                                "ecb": "onNotification"
                            });

                    } else {
                        pushNotification.register(
                            tokenHandler,
                            errorHandler,
                            {
                                "badge": "true",
                                "sound": "true",
                                "alert": "true",
                                "ecb": "onNotificationAPN"
                            });
                    }


                }

            }


            initPushNotification();
            // $location.path("/app/conversations");


            var jqxhr = jQuery.get(baseAppUrl + "/me?accessToken=" + response.authResponse.accessToken, function () {
                //alert("success");
            }).done(function (data) {

                window.profile = data;
                profile = data;
                setUser();
                deferred.resolve();
                $rootScope.$broadcast('loggedIn');
                $rootScope.$safeApply();

            }).fail(function (err) {
                console.log('err ', err);
            });
        };
        facebookConnectPlugin.getLoginStatus(function (response) {

            console.log("loginWithFacebook response", response);

            if (response.status === 'connected') {
                login(response);
            }
            else if (doLogin) {

                facebookConnectPlugin.login(['public_profile', 'user_friends'], function (response) {
                    console.log("facebookConnectPlugin.login users services ", response);
                    if (response.authResponse) {
                        login(response);
                    }
                }, function (e) {
                    deferred.reject();
                    console.log('User cancelled login or did not fully authorize.', e);
                });

            }
        });

        return deferred.promise;
    };

    this.isConnectedWithFacebook = function () {

        var deferred = $q.defer();
        facebookConnectPlugin.getLoginStatus(function (response) {

            console.log("loginWithFacebook response", response);

            if (response.status === 'connected') {
                deferred.resolve(true);
            }
            else {

                deferred.resolve(false);


            }
        });

        return deferred.promise;
    };


    this.getUsersByPartialName = function getUsersByPartialName(partialName, callback) {
        var usersById = {},
            found = false;
        if (partialName.indexOf(cachedPartialName) === 0) {
            for (var key in cachedUsers) {
                if (cachedUsers.hasOwnProperty(key) && this.userFilter(cachedUsers[key], partialName)) {
                    usersById[key] = cachedUsers[key];
                    found = true;
                }
            }
            if (found) {
                console.log(found);
                callback(usersById);
                return;
            }
        }
        console.log('request');
        $http.get(baseAppUrl + '/autofill?partial=' + partialName)
            .success(function (res) {
                for (var i = 0; i < res.length; i++) {
                    var user = res[i];
                    usersById[user.id] = {
                        username: user.username,
                        id: user.id,
                        fullname: user.fullname
                    };
                }
                cachedPartialName = partialName;
                cachedUsers = usersById;
                callback(usersById);
            });
    };


    this.getUserById = function getUserById(userId, cb) {
        $http.get(baseAppUrl + '/user?userId=' + userId).success(function (res) {
            cb(res);
        });
    };

    /*
     * Returns true iff the given user matches the given partial name, in terms of search criteria.
     */
    this.userFilter = function userFilter(user, partialName) {
        var fullname,
            names,
            enteredNames,
            i = 0;
        if (user.username && user.username.indexOf(partialName) !== -1) {
            return true;
        }
        if (!user.fullname && user.first_name && user.last_name) {
            fullname = user.first_name + ' ' + user.last_name;
        } else {
            fullname = user.fullname;
        }


        names = fullname.toLowerCase().split(' ');
        enteredNames = partialName.toLowerCase().split(' ');

        for (i = 0; i < enteredNames.length - 1; i++) {
            var nameIndex = names.indexOf(enteredNames[i]);
            if (nameIndex === -1) {
                return false;
            } else {
                names.splice(nameIndex, 1);
            }
        }
        for (i = 0; i < names.length; i++) {
            if (names[i].indexOf(enteredNames[enteredNames.length - 1]) === 0) {
                return true;
            }
        }
        return false;
    };

    /*
     * Combines the source user map into the destination user map.
     * Each user will appear once, with information from both maps.
     * Existing properties of the destination map are not overriden.
     */
    this.combineMaps = function combineMaps(dst, src) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                if (dst[key]) {
                    for (var userProperty in src[key]) {
                        if (src[key].hasOwnProperty(userProperty)) {
                            dst[key][userProperty] = dst[key][userProperty] || src[key][userProperty];
                        }
                    }
                } else {
                    dst[key] = src[key];
                }
            }
        }
    };
}]);