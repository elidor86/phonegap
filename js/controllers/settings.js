window.controllers.controller('SettingsController', ['$scope' , '$timeout', 'Spinner', 'Theme', '$rootScope', '$http', '$location', '$routeParams', 'me', 'requests', 'bitcoin', 'friends',
    function ($scope, $timeout, Spinner, Theme, $rootScope, $http, $location, $routeParams, me, requests, bitcoin, friends) {

        window.wscope = $scope;
        //Theme.headerRightState = 'chat';
        Theme.setHeaderSrc("settings");

        $scope.meAction = $routeParams.action;
        $scope.verifyState = false;


        $scope.phoneVerifyNextBtn = function () {

        };

        $scope.isUserAgeGreaterThenMonth = function () {

            var diff = $rootScope.getUserAge();
            if (Math.abs(diff) < 30) {
                return false;
            } else {
                return true;
            }

        };

        $scope.UserAgeAbs = function () {

            var diff = 30 - $rootScope.getUserAge();
            return Math.abs(diff);


        };

        $scope.getOneMonthDate = function (unit) {
            var date = moment().add('days', $scope.UserAgeAbs());

            if (unit == "day") {
                return date.format("Do");
            } else if (unit == "month") {
                return date.format("MMM");
            }

        };


        $scope.sendtext = function sendtext() {

            var pattern = /^[\s()+-]*([0-9][\s()+-]*){6,20}$/;
            if ($scope.smsInfo) {
                // clear previous error/success msg:
                $scope.smsInfo = '';
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
            if (!pattern.test($scope.phonenum)) {
                $scope.smsInfo = 'invalid phone number';
                return;
            }

            if (!$scope.phonenum) {
                $scope.smsInfo = 'no mobile number entered';
                return;
            }

            $http.post(baseAppUrl + '/sendsms', {
                accessToken: access_token,
                phone: '+' + $scope.phonenum
            }).success(function () {
                //$scope.smsInfo = 'SMS sent, enter verification code:';
                $scope.verifyState = true;
            }).error(function () {
                $scope.smsInfo = 'an error occured, please try again';
            });
        };

        $scope.verify = function verify() {
            $http.post(baseAppUrl + '/verifyaccount', {
                code: $scope.smscode,
                accessToken: access_token
            }).success(function (res) {
                if (res.verified) {
                    $scope.user.verified = true;
                }
            }).error(function () {
                $scope.verificationError = 'wrong code. you may request another one above.'
            });
        };


        $scope.checkLogin = function (pw, check, callback) {
            if (pw != check) $rootScope.errHandle('passwords don\'t match');
            else if (pw.length < 8) $rootScope.errHandle('must be 8 chars minimum');
            else {

                Theme.showNewAdressModal(function () {

                    if (Theme.modalFields.confirmPassword !== pw) {

                    } else {
                        Theme.isModalVisible = false;
                        $rootScope.bitcoinLogin(pw, function () {

                        });
                    }

                }, function () {

                });

                /*
                 var fields = {
                 confirm: {
                 type: 'password'
                 }
                 };*/

                /*
                 $rootScope.message = {
                 body: 'I understand that without my password, I cannot access bitcoins on my address ,please enter your password again:',
                 action: function () {

                 if ($rootScope.message.fields.confirm.value !== pw) {

                 } else {
                 $rootScope.bitcoinLogin(pw, function () {

                 });
                 $rootScope.message = {};
                 }
                 },
                 fields: fields,
                 actiontext: 'ok',
                 canceltext: 'cancel'
                 };*/
            }

        };

        $scope.amount = "";
        $scope.satAmount = "";


        $scope.buy = function () {
            console.log("$scope.amount", $scope.amount);
            if (angular.isUndefined($scope.amount) || $scope.amount < 10000)
                return $rootScope.errHandle("minimum buy 10000");
            if ($scope.amount > $scope.balance - 10000)
                return $rootScope.errHandle("not enough bts");

            var msg = "are you sure you would like to get " + $scope.amount + " thanx with " + $scope.amount + " satoshi? a transaction fee of 10,000 satoshi will be added ";

            Theme.showConfirmModal(msg, function () {
                $rootScope.buyTnx($scope.amount);
            });

            /*
             $rootScope.confirmDialog(msg, function () {

             });*/
        };

        $scope.coupon = "";
        $scope.redeemCouponAmount = null;
        $scope.redeemCouponError = null;

        $scope.redeem = function () {
            console.log("$scope.coupon", $scope.coupon);

            if (angular.isUndefined($scope.coupon))
                return;

            Spinner.start();

            $http.post(baseAppUrl + '/redeemCoupon', {
                accessToken: access_token,
                coupon: $scope.coupon
            })
                .success(function (r) {
                    console.log("redeemCoupon success", r);
                    Spinner.complete();
                    if (r.error) {
                        $scope.redeemCouponError = r.error;
                    } else {
                        $scope.redeemCouponAmount = r.amount;

                        $timeout(function () {
                            $rootScope.goTo('chat/123456thanx');
                        }, 1000);

                    }


                })
                .error(function (e) {
                    Spinner.complete();
                    console.log("error ", e);
                });


        };


        $scope.setImg = function () {
            console.log("setImg");

            cordova.plugins.barcodeScanner.scan(
                function (result) {

                    ///result = result.text;
                    var str = result.text;
                    if (str.search("http") != -1) {
                        str = str.replace("http://", "");
                        str = str.replace(".thanx.io", "");
                    }

                    $scope.coupon = str;

                    $scope.$safeApply();


                },
                function (error) {
                    alert("Scanning failed: " + error);
                }
            );
        };

        $scope.txError = false;
        $scope.buySat = function () {
            console.log("$scope.amount", $scope.satAmount);
            if (angular.isUndefined($scope.satAmount) || $scope.satAmount < 10000)
                return $rootScope.errHandle("minimum buy 10000");
            if ($scope.satAmount > $rootScope.user.tnx - 10000)
                return $rootScope.errHandle("not enough thanks");

            var msg = "are you sure you would like to get " + $scope.amount + " satoshi with " + $scope.amount + " thanx? a transaction fee of 10,000 satoshi will be added ";

            $rootScope.confirmDialog(msg, function () {
                $http.post(baseAppUrl + '/buysat', {
                    accessToken: access_token, amount: $scope.satAmount
                })
                    .success(function () {
                        $rootScope.message = {};
                        $location.path("/app/chat/123456thanx");
                    })
                    .error(function () {
                        $rootScope.message = {};
                        $scope.txError = true;
                    });
                //buysat
            });
        };


        // Kill account (testing only)
        $scope.kill = function () {
            $http.post(baseAppUrl + '/kill')
                .success(function (r) {
                    $rootScope.user = r;
                    location.href = '/app/newaccount';
                })
                .error(errhandle);
        };

        $scope.toggleChangeUsername = function toggleChangeUsername() {
            $scope.changingUsername = !$scope.changingUsername;
        };

        $scope.checkname = function () {
            $scope.newUsernameLegal = /^[a-zA-Z][0-9a-zA-Z_-]{3,15}$/.test($scope.newUsername);
            $http.post(baseAppUrl + '/checkname', {
                accessToken: access_token,
                name: $scope.newUsername + '.bitconnect.me'
            })
                .success(function (r) {
                    if (r == '"available"') $scope.newUsernameAvailable = true;
                    else $scope.newUsernameAvailable = false;
                })
                .error(errhandle);
        };

        $scope.changeUsername = function changeUsername() {
            $http.post(baseAppUrl + '/changeusername', {
                accessToken: access_token,
                username: $scope.newUsername + '.bitconnect.me'
            }).success(function (r) {
                $scope.changingUsername = false;
                me.getme();
            });
        }
        $scope.$watch('newUsername', function (value) {
            if (value) {
                $scope.checkname(value);
            }
        });
    }
]);