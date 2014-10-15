window.app = angular.module('thanxbits', ['ui.bootstrap', 'ngTouch', 'thanxbits.controllers', 'once', 'ngRoute', 'ngAnimate']);

window.controllers = angular.module('thanxbits.controllers', []);

var el = function (x) {
    return document.getElementById(x);
};

var qs = function (x) {
    return document.querySelectorAll(x);
};

var errhandle = function (r) {
    console.log("Error", r);
};

/*
 *    DdpClient.connect()
 .done(function () {
 console.log('DdpClient connect done');





 })
 .fail(function (e) {

 console.log('error', e);


 });
 */

window.app
    .config(['$routeProvider', '$locationProvider', '$compileProvider',
        function ($routeProvider, $locationProvider, $compileProvider) {



            //  console.log("html5Mode",   $locationProvider.html5Mode() );


            $routeProvider
                .when('/app/connect', {
                    templateUrl: 'partials/connect.html',
                    controller: 'InviteFriendsController',
                    resolve: {
                        friendsList: [ 'friends', function (friends) {
                            return friends.getMyFriends();
                        }]
                    }
                })
                .when('/', {
                    templateUrl: 'partials/welcome.html',
                    //template: localHtml.conversations.html,
                    //controller: 'ConversationsController',
                    resolve: {
                        isLoggedIn: [ '$location', '$rootScope', 'UsersService', '$q', 'Spinner', function ($location, $rootScope, UsersService, $q, Spinner) {

                            var deferred = $q.defer();

                            UsersService.isConnectedWithFacebook().then(function (response) {

                                if (response) {

                                    Spinner.start();
                                    UsersService.loginWithFacebook().then(function (response) {
                                        Spinner.complete();
                                        UsersService.getUsersFbFriends();
                                        $location.path("/app/conversations");
                                        $rootScope.$safeApply();

                                    }, function () {
                                        Spinner.complete();
                                    });

                                } else {
                                    deferred.resolve();
                                }

                            });


                            return deferred.promise;

                        }]
                    }
                })
                .when('/app/conversations', {
                    templateUrl: 'partials/conversations.html',
                    //template: localHtml.conversations.html,
                    controller: 'ConversationsController'
                })
                .when('/app/thanx', {
                    templateUrl: 'partials/requests.html',
                    controller: 'RequestController'
                })
                .when('/app/give', {
                    templateUrl: 'partials/give.html',
                    controller: 'GiveController'
                })
                .when('/app/chat/123456thanx', {
                    templateUrl: 'partials/super-chat.html',
                    controller: 'ChatController',
                    resolve: {
                        otherUser: [ '$http', '$route', 'ChatServices', function ($http, $route, ChatServices) {


                            return ChatServices.getOtherUser("userId", '123456thanx');

                        }]
                    }

                })
                .when('/app/chat/:otherUserId', {
                    templateUrl: 'partials/chat.html',
                    controller: 'ChatController',
                    resolve: {
                        otherUser: [ '$http', '$route', 'ChatServices', function ($http, $route, ChatServices) {

                            return ChatServices.getOtherUser("userId", $route.current.params.otherUserId);

                        }]
                    }

                })
                .when('/app/btc/:otherUserId', {
                    templateUrl: 'partials/addresschat.html',
                    controller: 'ChatController',
                    resolve: {
                        otherUser: [ '$http', '$route', 'ChatServices', function ($http, $route, ChatServices) {

                            return ChatServices.getOtherUser("btc", $route.current.params.otherUserId);

                        }]
                    }

                })
                .when('/app/transaction/:id', {
                    templateUrl: 'partials/transaction.html',
                    controller: 'TransactionController'
                })
                .when('/app/me', {
                    templateUrl: 'partials/me.html',
                    controller: 'SettingsController'
                })
                .when('/app/settings', {
                    templateUrl: 'partials/me.html',
                    controller: 'SettingsController'
                })
                .when('/app/newaccount', {
                    templateUrl: '/partials/newaccount.html',
                    controller: 'NewAccountController'
                })
                .when('/app/info/:userId', {
                    templateUrl: 'partials/appprofile.html',
                    controller: 'ProfileCtrl',
                    resolve: {
                        userid: [  '$route', function ($route) {

                            return $route.current.params.userId;

                        }]
                    }
                })

        }
    ]);


window.app.run(['$rootScope', 'Theme', '$http', '$location', 'Analytics', 'Ddp',
    function ($rootScope, Theme, $http, $location, Analytics, Ddp) {

        $rootScope.user = profile || {};
        // Ddp.connect();
        console.log("start angular app");

        $rootScope.path = baseAppPath;

        $rootScope.searchText = null;

        console.log("$rootScope.user ", $rootScope.user);

        /*
         $rootScope.$watch(function () {
         return $rootScope.user.tnx
         }, function (newValue, oldValue) {
         console.log("$watch user newValue ", newValue);
         console.log("$watch user oldValue ", oldValue);

         });*/


        $rootScope.start_and_end = function (str) {
            if (str && str.length > 20) {
                return str.substr(0, 10) + '...' + str.substr(str.length - 5, str.length);
            }
            return str;
        };

        $rootScope.getFbProfilePic = function (id, size) {
            var btcAddressRegex = /^[13][1-9A-HJ-NP-Za-km-z]{26,33}/;
            //   console.log(id);
            if (id) {
                if (id == '123456thanx') {
//'img/ui/thanx_icon.png';
                    var src = 'img/ui/thanx_icon.png';
                } else if (btcAddressRegex.test(id)) {
                    return 'img/ui/bitcoin_icon.png';
                } else {
                    var width = size ? size : 100;
                    var src = "https://graph.facebook.com/" + id + "/picture?width=" + width + '&height=' + width;
                }

                return src;
            } else {
                return 'img/ui/bitcoin_icon.png';
            }


        };

        $rootScope.getMeFbProfilePic = function () {
            //console.log("$rootScope.user.id ", $rootScope.user.id);

            return $rootScope.getFbProfilePic(window.fb_id);
        };

        $rootScope.phonegapUrl = function (id) {
            window.open('http://blockchain.info/address/' + $rootScope.user.address, '_blank');
        };

        console.log("start angular app", $rootScope.path);


        /*
         var content = document.getElementsById('scrollDiv');
         content.addEventListener('touchstart', function (event) {
         this.allowUp = (this.scrollTop > 0);
         this.allowDown = (this.scrollTop < this.scrollHeight - this.clientHeight);
         this.slideBeginY = event.pageY;
         });

         content.addEventListener('touchmove', function (event) {
         var up = (event.pageY > this.slideBeginY);
         var down = (event.pageY < this.slideBeginY)
         this.slideBeginY = event.pageY;
         if ((up && this.allowUp) || (down && this.allowDown))
         event.stopPropagation();
         else
         event.preventDefault();
         });
         */

        // $rootScope.FBfriends = typeof FBfriends != "undefined" ? FBfriends : {};
        $rootScope.FBfriends = {};


        $rootScope.$safeApply = function () {
            var $scope, fn, force = false;
            if (arguments.length == 1) {
                var arg = arguments[0];
                if (typeof arg == 'function') {
                    fn = arg;
                } else {
                    $scope = arg;
                }
            } else {
                $scope = arguments[0];
                fn = arguments[1];
                if (arguments.length == 3) {
                    force = !!arguments[2];
                }
            }
            $scope = $scope || this;
            fn = fn || function () {
            };
            if (force || !$scope.$$phase) {
                $scope.$apply ? $scope.$apply(fn) : $scope.apply(fn);
            } else {
                fn();
            }
        };

        $rootScope.animationClass = "";

        $rootScope.back = function () {
            window.history.back();
        };

        $rootScope.goTo = function (path, searchValues) {

            if (window.location.pathname.indexOf(path) == -1) {
                console.log("path", path);
                $location.path('app/' + path);
                if (searchValues) {
                    $location.search(searchValues);
                }
            }
        };

        $rootScope.path = function () {
            var p = window.location.pathname.split('/');
            return p[p.length - 1];
        };
        $rootScope.message = {};

        $rootScope.modalCancel = function () {
            if (angular.isFunction($rootScope.message.cancel)) {
                $rootScope.message.cancel();
            }
            $rootScope.message.cancel = null;
            $rootScope.message.body = null;
            $rootScope.message.imgSrc = null;
        };


        $rootScope.errHandle = function (msg) {


            $rootScope.message = {
                body: msg || 'error',
                canceltext: 'cool, thanx'
            };
        };

        $rootScope.confirmDialog = function (msg, action) {
            $rootScope.message = {
                body: msg,
                action: action,
                actiontext: 'yes please',
                canceltext: 'no thanx'
            };
        };

        $rootScope.showMessage = function (msg) {

            Analytics.clickTrack({
                eventCategory: "dialog",
                eventAction: "showMessage",
                eventLabel: msg
            });

            $rootScope.message = {
                body: msg || 'success',
                canceltext: 'cool, thanx'
            };
        };

        $rootScope.toggleMenu = function toggleMenu() {
            Analytics.clickTrack({
                eventCategory: "user",
                eventAction: "nav",
                eventLabel: "toggleMenu"
            });

            $rootScope.menuOpen = !$rootScope.menuOpen;
            $rootScope.connectState = false;
        };

        $rootScope.toggleSearch = function () {
            if ($rootScope.searchContainerState == "select") {
                $rootScope.searchContainerState = "search"
            } else {
                $rootScope.searchContainerState = "select"
            }
        };

        var mainContainer = jQuery("#main-container");
        $rootScope.connectState = false;


        $rootScope.swipeRight = function ($event) {

            var target = $($event.target).attr("class");
            //console.log("$event ", target);
            if ($location.path().search('conversations') == -1) {
                return;
            }


            if ($rootScope.connectState == true) {
                $rootScope.connectState = false;
                Theme.hideConnect();
            } else {
                $rootScope.toggleMenu();
            }


        };

        $rootScope.swipeLeft = function ($event) {

            var target = $($event.target).attr("class");
            //console.log("$event ", target);
            if ($location.path().search('conversations') == -1) {
                return;
            }

            if ($rootScope.menuOpen == true) {
                $rootScope.menuOpen = false;
            } else {
                $rootScope.connectState = true;
                Theme.showConnect();
            }


        };

        $rootScope.toggleConnect = function () {

            Analytics.clickTrack({
                eventCategory: "user",
                eventAction: "nav",
                eventLabel: "toggleConnect"
            });

            //var connectContainer = jQuery("#connect-container");
            // var x = connectContainer.width();

            if ($rootScope.connectState == false) {
                //   connectContainer.css("display", "block");
                // mainContainer.css("z-index", 5);
                //  TweenMax.to(mainContainer, 0.7, { x: -x, opacity: 0.7, ease: Expo.easeInOut});
                // TweenMax.to(connectContainer, 0.7, { opacity: 1, ease: Expo.easeInOut});
                $rootScope.menuOpen = false;
                $rootScope.connectState = true;
            } else {
                //     connectContainer.css("display", "none");
                // mainContainer.css("z-index", 100);
                //  TweenMax.to(mainContainer, 0.5, {  x: 0, opacity: 1, ease: Expo.easeInOut});
                // TweenMax.to(connectContainer, 0.7, { opacity: 0.5, ease: Expo.easeInOut});
                $rootScope.connectState = false;
            }
        };


        $rootScope.getUserAge = function (unit) {
            var now = moment();
            //console.log("getUserAge", moment($rootScope.user.createdAt * 1000).diff(now, unit ? unit : "days"))
            return moment($rootScope.user.createdAt * 1000).diff(now, unit ? unit : "days");
        };

        $rootScope.showQr = function (e) {
            e.preventDefault();
            $rootScope.message = {body: "qr code", imgSrc: "https://blockchain.info/qr?data=" + $rootScope.user.address + "&size=200"};
        };


        $rootScope.$on('$routeChangeSuccess', function (angularEvent, current, previous) {


            if (current.loadedTemplateUrl && current.loadedTemplateUrl.split("/").length >= 2 && current.loadedTemplateUrl.search("welcome") == -1) {

                console.log("$routeChangeSuccess !!", current.loadedTemplateUrl);
                $rootScope.topPath = "partials/top/" + current.loadedTemplateUrl.split("/")[1]
            }

            //console.log("previous", previous.loadedTemplateUrl);

            ///partials/chat
            if (previous) {
                if (current.loadedTemplateUrl == "partials/conversations" && !previous) {
                    // $rootScope.animationClass = "left-to-right-animation";
                } else if (previous.loadedTemplateUrl == "/partials/conversations" && current.loadedTemplateUrl == "/partials/chat") {
                    $rootScope.animationClass = "right-to-left-animation";
                } else if (current.loadedTemplateUrl == "/partials/conversations" && previous.loadedTemplateUrl == "/partials/chat") {
                    $rootScope.animationClass = "left-to-right-animation";
                } else if (current.loadedTemplateUrl == "/partials/conversations" && previous.loadedTemplateUrl == "/partials/connect") {
                    $rootScope.animationClass = "left-to-right-animation";
                } else if (previous.loadedTemplateUrl == "/partials/conversations" && current.loadedTemplateUrl == "/partials/connect") {
                    $rootScope.animationClass = "right-to-left-animation";
                } else {
                    $rootScope.animationClass = "";
                }
            }


        });
    }
]);