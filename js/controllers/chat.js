window.controllers.controller('ChatController', ['$scope', 'Theme', '$location', 'Spinner', 'otherUser', "Ddp", 'RequestTypes', 'requests', '$rootScope', '$timeout', '$http', '$routeParams', 'HistoryService', 'me', 'bitcoin', 'ChatServices',
    function ($scope, Theme, $location, Spinner, otherUser, Ddp, RequestTypes, requests, $rootScope, $timeout, $http, $routeParams, HistoryService, me, bitcoin, ChatServices) {

        console.log("ChatController!!!!!!", otherUser);


        //$routeParams.otherUserId = $routeParams.otherUserId ? $routeParams.otherUserId : "123456thanx";
        var isSuperUser = false;
        if (otherUser.id == '123456thanx') {
            otherUser.fullname = 'thanx.io';
            isSuperUser = true;
        }
        else if (!$routeParams.otherUserId) {
            $routeParams.otherUserId = "123456thanx";
            isSuperUser = true;
        }


        $scope.isOtherBtc = $location.path().search("app/btc") > -1 ? true : false;


        $scope.ChatServices = ChatServices;
        $scope.otherUser = otherUser;
        $scope.otherUserId = null;


        if (typeof otherUser == 'string') {
            $scope.otherUserId = otherUser;
        } else {
            $scope.otherUserId = otherUser.id;
        }

        Theme.otherUserId = $scope.otherUserId;
        Theme.otherUser = otherUser;

        if (isSuperUser) {
            Theme.setHeaderSrc("super-user");
        } else {
            Theme.setHeaderSrc("chat");

        }


        $scope.interactions = [];
        $scope.interactions1 = [];
        $scope.interactionsObj = {};


        var scrollTo = function (el) {
            var container = jQuery('.content'),
                scrollTo = jQuery('#' + el);

            if (scrollTo.offset()) {
                container.scrollTop(
                        scrollTo.offset().top - container.offset().top + container.scrollTop()
                );
            }
        };


        var loadChatFromStorage = function () {
            var chatHistory = HistoryService.getLocalStorage($routeParams.otherUserId, true);

            if (_.isArray(chatHistory)) {
                chatHistory.splice(0, chatHistory.length - 20);
            } else {
                chatHistory = [];
            }

            $scope.interactions1 = chatHistory;

            $timeout(function () {
                scrollTo('scroll-to');
            }, 50);

            $scope.$safeApply();
        };

        loadChatFromStorage();

        var elasticResizeFirstTime = true;
        $scope.$on('elastic:resize', function (scope, $ta, mirrorHeight) {

            console.log("elastic:resize ", mirrorHeight);
            // console.log("elastic:resize ", $($ta[0]).height());
            //  console.log("elastic:height ", $('.chat-msg-input').height() );


            if (elasticResizeFirstTime) {
                $('.chat-msg-input').css('border-radius', mirrorHeight / 2);
            }
            elasticResizeFirstTime = false;

            if (location.href.search('app/btc/') > -1) {
                return
            }
            var rootFsize = parseInt($('html').css('font-size'));
            $('#chat-btm').css('height', 35 + $($ta[0]).height() / rootFsize + "rem");
            // $('#chat-btm').height(parseInt(rootFsize) * 30 + $($ta[0]).height());
            $('#chat-msg-container').height($($ta[0]).height() + 35);
            $scope.initTxContainerSwipe();
        });


        $scope.setChatWith = function () {
            $http.post(baseAppUrl + '/getMyChatWith', {
                accessToken: access_token,
                otherUserId: $scope.otherUserId

            })
                .success(function (r) {

                })
                .error(function (e) {
                    console.log("error ", e);
                });
        };


        $scope.$on('onResume', function (scope) {
            $scope.setChatWith();
        });


        $scope.getMyChatWith = function (isLoadMore) {

            if ($scope.interactions1.length == 0 || isLoadMore) {
                Spinner.start();
            }


            $http.post(baseAppUrl + '/getMyChatWith', {
                accessToken: access_token,
                otherUserId: $scope.otherUserId,
                have: $scope.interactions1.length

            })
                .success(function (r) {
                    Spinner.complete();
                    $scope.interactions1 = sortChatArr(r);

                    $timeout(function () {
                        if (isLoadMore) {

                            scrollTo($scope.pagingData.goTo);
                        } else {
                            scrollTo('scroll-to');
                        }

                    }, 100);
                    //sortChatArr();

                })
                .error(function (e) {
                    console.log("error ", e);
                });
        };

        $scope.initCitem = function (citem) {
            //new Citem(doc)
            return new Citem(citem);
        };


        $scope.getMyChatWith();


        $scope.pagingData = {
            have: 0,
            count: 0,
            posWas: 0,
            initializing: false,
            isFirstTime: true
        };


        $scope.getDir = function (citem) {
            var res = '';

            if (citem.requestType == 'GIVE' && citem.direction == 'incoming') {
                res = 'in';
            } else {
                res = 'out';
            }
            return res;
            //citem.requestType == 'GIVE' ? 'out' : 'in'
        };

        $scope.getBubImg = function (citem) {
            var res = '';


            if (citem.sign == 'minus' && citem.direction == 'outgoing') {
                res = 'img/ui/bub/bubble-full-right-orange.png';
            } else if (citem.sign == 'minus' && citem.direction == 'incoming') {
                res = 'img/ui/bub/bubble-full-left-orange.png';
            } else if (citem.sign == 'plus' && citem.direction == 'outgoing') {
                res = 'img/ui/bub/bubble-full-right-light-green.png';
            } else if (citem.sign == 'plus' && citem.direction == 'incoming') {
                res = 'img/ui/bub/bubble-full-left-light-green.png';
            }


            return res;
            //citem.requestType == 'GIVE' ? 'out' : 'in'
        };

        $scope.getCoinImg = function (citem) {
            var res = '';

            if (citem.sign == 'plus' && citem.tnx) {
                res = 'img/ui/coins/coin-x-green.png';
            } else if (citem.sign == 'plus' && citem.sat) {
                res = 'img/ui/coins/coin-b-green.png';
            } else if (citem.sign == 'minus' && citem.sat) {
                res = 'img/ui/coins/coin-b-orange.png';
            } else if (citem.sign == 'minus' && citem.tnx) {
                res = 'img/ui/coins/coin-x-orange.png';
            }

            return res;
            //citem.requestType == 'GIVE' ? 'out' : 'in'
        };


        $scope.getCoinSide = function (citem) {
            var res = '';

            if (citem.sign == 'minus') {
                res = 'right';
            } else if (citem.sign == 'plus') {
                res = 'left';
            }

            return res;
            //citem.requestType == 'GIVE' ? 'out' : 'in'
        };


        $scope.myPovScheme = function (citem) {
            var res = '';

            if (citem.requestType == 'GIVE' && citem.direction == 'outgoing') {
                //+ to my account
                res = 'plus';
            } else {
                res = 'minus';
            }


            return res;
        };

        $scope.getDirectionText = function (citem) {
            var res = '';

            if (citem.direction == 'incoming') {
                res = citem.requestType == 'GIVE' ? 'out' : 'in';
            } else {
                res = citem.requestType == 'GIVE' ? 'in' : 'out';
            }
            return res;
            //citem.requestType == 'GIVE' ? 'out' : 'in'
        };

        /*
         $scope.$watch('direction', function (newValue, oldValue) {

         newValue == 'out' ? $scope.secondTx.direction = 'out' : null;

         });*/


        $scope.$watch('Theme.balanceUnits', function (newValue, oldValue) {
            $scope.units = newValue;

        });

        $scope.$watch('units', function (newValue, oldValue) {

            // newValue == 'tnx' ? $scope.secondTx.units = 'sat' : $scope.secondTx.units = 'tnx';

            Theme.setBalanceUnits(newValue);

            if ($scope.units == 'sat' && !$rootScope.user.address) {
                $rootScope.message = {
                    body: 'you do not have bitcoin address, create one now?',
                    action: function () {
                        $rootScope.message = null;
                        $location.path('/app/me').search({action: "btcaddress"});
                    },
                    cancel: function () {
                        //console.log("cancel");
                        ChatServices.btcmode = "tnx"
                    },
                    actiontext: 'yep',
                    canceltext: 'nope'
                };
                $scope.units = 'tnx';
                return;
            } else if ($scope.units == 'sat' && !otherUser.isAddress && !otherUser.address) {
                $rootScope.message = {
                    body: otherUser.fullname + ' has not generated a bitcoin address. would you like to send a message explaining how to do that?"',
                    action: function () {

                        $rootScope.message = null;
                        $scope.msg = "hi, please click [/app/me?action=btcaddress,here] to generate a bitcoin address. we'll then be able to send thanx as well as satoshi to each other. thanx :)";

                        $scope.sendMessage();
                        $scope.direction = null;
                        $scope.units = 'tnx';

                    },
                    cancel: function () {
                        //console.log("cancel");
                        $scope.units = 'tnx';
                    },
                    actiontext: 'yep',
                    canceltext: 'nope'
                };
            }
        });

        function drawOpen() {
            jQuery("#content-chat").css("bottom", "25.5rem");
            scrollTo('scroll-to');
        }

        function drawClose() {
            jQuery("#content-chat").css("bottom", "14.5rem");
            scrollTo('scroll-to');
            initMsgParams();
        }

        function closeChatBtm() {
            var chatBtm = $('#chat-btm');

            chatBtm.css({
                "transition": 'all .5s ease-in-out',
                "-webkit-transition": 'all .5s ease-in-out',
                "-webkit-transform": 'translate3d(0,0,0)'
            });


            $timeout(function () {
                chatBtm.css('transition', '');
                chatBtm.css('-webkit-transition', '');
            }, 500);

        }

        var initMainSlider = function () {


            if (isSuperUser || $scope.isOtherBtc)
                return;

            var res = {};

            var leftArrow = $('#main-arrow-left');
            var rightArrow = $('#main-arrow-right');
            var txSettingsContainer = $('.tx-settings-container');
            var cIcon = $('#main-c');


            var cIconPos = cIcon.position();


            var Container = jQuery('.slider-container');

            var x = (Container.width()) / 2 - cIcon.width() / 3;

            var distanceFromHalf = Math.abs(x);
            var halfWay = Container.width() / 4 - cIcon.width() / 2;
            var halfWidth = Container.width() / 2;


            var startx = null;
            var halfIcon = cIcon.width() / 2;
            var opacity = 0;
            var absDist = 0;
            var moveDist = 0;
            var endDist = 0;

            if ($scope.isOtherBtc) {

                txSettingsContainer.css('opacity', 1);

                cIcon.css({
                    "transition": 'all .5s ease-in-out',
                    "-webkit-transition": 'all .5s ease-in-out',
                    "-webkit-transform": 'translate3d(' + x + 'px,0,0)'
                });

                return;
            }


            var handleStart = function (evt) {
                //var touchobj = evt.changedTouches[0];

                //TweenMax.to(leftArrow, 0.5, {opacity: 0});
                //TweenMax.to(rightArrow, 0.5, {opacity: 0});

                leftArrow.css('opacity', '0');
                rightArrow.css('opacity', '0');
                // startx = parseInt(touchobj.clientX);
            };

            var handleMove = function handleMove(evt) {
                //  console.log("handleMove ", evt);
                evt.preventDefault();

                var touchobj = evt.changedTouches[0];
                moveDist = touchobj.clientX - Container.width() / 2 - 12;

                absDist = Math.abs(moveDist);
                opacity = absDist / halfWidth;
                txSettingsContainer.css('opacity', opacity);
                //console.log("opacity ", opacity);

                //TweenMax.to(thanxIcon, 0.1, { x: dist});

                moveDist > 0 ? $scope.direction = 'out' : $scope.direction = 'in';
                $scope.$safeApply();
                // absDist >= distanceFromHalf ? null : cIcon.css('-webkit-transform', 'translate3d(' + moveDist + 'px,0,0)');

                if (absDist <= distanceFromHalf) {
                    cIcon.css('-webkit-transform', 'translate3d(' + moveDist + 'px,0,0)');


                }


                //console.log("touchobj ", touchobj);


            };

            var handleEnd = function handleMove(evt) {


                var touchobj = evt.changedTouches[0];

                //console.log("touchobj ", touchobj);


                //var dist = parseInt(touchobj.clientX) - Container.width() / 2;
                endDist = touchobj.clientX - Container.width() / 2 - 12;

                if (Math.abs(endDist) > halfWay) {


                    if ((endDist < 0 && x > 0) || (endDist > 0 && x < 0)) {
                        x = -x;
                    }


                    txSettingsContainer.css('opacity', 1);

                    cIcon.css({
                        "transition": 'all .5s ease-in-out',
                        "-webkit-transition": 'all .5s ease-in-out',
                        "-webkit-transform": 'translate3d(' + x + 'px,0,0)'
                    });


                    $timeout(function () {
                        cIcon.css('transition', '');
                        cIcon.css('-webkit-transition', '');


                    }, 800);


                } else {
                    //TweenMax.to(thanxIcon, 0.5, { x: 0});

                    resetPos();
                    $scope.direction = null;
                    $scope.$safeApply();

                }


                //evt.preventDefault()

            };


            var resetPos = function () {
                txSettingsContainer.css('opacity', 0);


                cIcon.css({
                    "transition": 'all .5s ease-in-out',
                    "-webkit-transition": 'all .5s ease-in-out',
                    "-webkit-transform": 'translate3d(0px,0,0)'
                });


                leftArrow.css('opacity', '1');
                rightArrow.css('opacity', '1');

                //   TweenMax.to(leftArrow, 0.5, {opacity: 1});
                // TweenMax.to(rightArrow, 0.5, {opacity: 1});


                $timeout(function () {
                    cIcon.css({
                        transition: "",
                        '-webkit-transition': ''
                    });


                }, 800);
            };

            var el = document.getElementById("main-c");
            el.addEventListener("touchstart", handleStart, false);
            el.addEventListener("touchmove", handleMove, false);
            el.addEventListener("touchend", handleEnd, false);

            res.resetPos = resetPos;
            return res;
        };

        var mainSliderCtrl = initMainSlider();


        var initMsgParams = function () {

            if ($scope.isOtherBtc) {
                $scope.direction = 'out';
                $scope.units = Theme.balanceUnits;
                $scope.amount = $location.path().search('btc') > -1 && Theme.qrAmount ? Theme.qrAmount : 1;
                $scope.txType = 'oneWay';
                return;
            }

            $scope.msg = null;
            $scope.direction = null;
            $scope.units = "tnx";
            $scope.amount = 1;
            $scope.txType = 'oneWay';
            if (mainSliderCtrl)
                mainSliderCtrl.resetPos();
        };

        var semiInitMsgParams = function () {


            $scope.msg = null;
            //$scope.direction = null;
            //$scope.units = "tnx";
            $scope.amount = 1;
            $scope.txType = 'oneWay';
            //if (mainSliderCtrl)
            //mainSliderCtrl.resetPos();
        };


        initMsgParams();

        $scope.initTxContainerSwipe = function () {

            if (isSuperUser || $scope.isOtherBtc)
                return;

            var chatBtm = $('#chat-btm');

            var chatMsgContainer = $('#chat-msg-container'),
                mainSliderContainer = $('#main-slider-container');


            var chatMsgContainerH = chatMsgContainer.height(),
                mainSliderContainerH = mainSliderContainer.height(),
                mainSliderContainerMT = parseInt(mainSliderContainer.css('marginTop')),
                mainSliderContainerMN = parseInt(mainSliderContainer.css('marginBottom')),
                mainSliderContainerTH = mainSliderContainerH + mainSliderContainerMT + mainSliderContainerMN,

                moveDistAbs = 0,
                endDist = 0,
                endDistAbs = 0,
                startY = null,
                maxH = mainSliderContainerTH;

            var chatBtmTop = chatBtm.position().top, moveDist = 0;

            var handleStart = function (evt) {
                var touchobj = evt.changedTouches[0];
                startY = touchobj.clientY;
            };


            var handleMove = function handleMove(evt) {
                //  console.log("handleMove ", evt);
                evt.preventDefault();

                var touchobj = evt.changedTouches[0];

                moveDist = touchobj.clientY - chatBtmTop;
                moveDistAbs = Math.abs(moveDist);

                // console.log("touchobj.clientY  ", touchobj.clientY);

                moveDistAbs < maxH && moveDist < 0 ? chatBtm.css('-webkit-transform', 'translate3d(0px,' + moveDist + 'px,0)') : null;

                // console.log("moveDistAbs ", moveDistAbs);
                // console.log("maxH ", maxH);
                // console.log("moveDist ", moveDist);


            };

            var handleEnd = function handleMove(evt) {


                var touchobj = evt.changedTouches[0];

                // console.log("endDistAbs ", endDistAbs);
                // console.log("mainSliderContainerTH ", mainSliderContainerTH);


                //var dist = parseInt(touchobj.clientX) - Container.width() / 2;
                endDist = touchobj.clientY - chatBtmTop;
                endDistAbs = Math.abs(endDist);

                if (endDistAbs < mainSliderContainerTH / 2) {


                    chatBtm.css({
                        "transition": 'all .5s ease-in-out',
                        "-webkit-transition": 'all .5s ease-in-out',
                        "-webkit-transform": 'translate3d(0,0,0)'
                    });

                    drawClose();


                    $timeout(function () {
                        chatBtm.css('transition', '');
                        chatBtm.css('-webkit-transition', '');
                    }, 500);

                } else if (endDistAbs > mainSliderContainerTH / 2 && endDistAbs < mainSliderContainerTH / 2) {

                    $scope.txType = 'oneWay';
                    // console.log("txType", 'ha');

                    chatBtm.css({
                        "transition": 'all .5s ease-in-out',
                        "-webkit-transition": 'all .5s ease-in-out',
                        "-webkit-transform": 'translate3d(0,' + (-mainSliderContainerTH) + 'px,0)'
                    });


                    $timeout(function () {
                        chatBtm.css('transition', '');
                        chatBtm.css('-webkit-transition', '');
                    }, 500);

                } else if (endDistAbs > mainSliderContainerTH / 2 && endDist < 0) {
                    $scope.txType = 'oneWay';
                    drawOpen();
                    //  console.log("txType", 'oneWay');
                    chatBtm.css({
                        "transition": 'all .5s ease-in-out',
                        "-webkit-transition": 'all .5s ease-in-out',
                        "-webkit-transform": 'translate3d(0,' + (-mainSliderContainerTH ) + 'px,0)'
                    });


                    $timeout(function () {
                        chatBtm.css('transition', '');
                        chatBtm.css('-webkit-transition', '');

                    }, 500);

                    $scope.$safeApply();

                } else {

                    chatBtm.css({
                        "transition": 'all .5s ease-in-out',
                        "-webkit-transition": 'all .5s ease-in-out',
                        "-webkit-transform": 'translate3d(0,0,0)'
                    });


                    $timeout(function () {
                        chatBtm.css('transition', '');
                        chatBtm.css('-webkit-transition', '');
                    }, 500);
                }


                evt.preventDefault()

            };


            var el = document.getElementById("chat-container-toggle");
            el.addEventListener("touchstart", handleStart, false);
            el.addEventListener("touchmove", handleMove, false);
            el.addEventListener("touchend", handleEnd, false);

        };

        $scope.initTxContainerSwipe();


        $scope.toggleUnits = function () {
            // console.log("toggleUnits ", otherUser);


            $scope.units == 'sat' ? $scope.units = 'tnx' : $scope.units = 'sat';


        };

        $scope.getCoinImgUrl = function () {

            var res = '';
            $scope.units == 'tnx' ? res = 'img/ui/thanx_icon.png' : res = 'img/ui/bitcoin_icon.png';
            return res;
        };


        var Citem = function (citem) {
            _.extend(this, citem);
            this.time = new Date(this.timestamp * 1000);
            this.isInit = true;

            if (angular.isDefined(this.sender) && this.sender.id === $rootScope.user.id) {
                //this.direction = 'outgoing';
                this.direction = 'incoming';
            } else {
                //this.direction = 'incoming';
                this.direction = 'outgoing';
            }


            this.sign = '';
            if (this.requestType == 'GIVE' && this.direction == 'outgoing') {
                //+ to my account
                this.sign = 'plus';
            } else if (this.requestType == 'GET' && this.direction == 'outgoing') {
                this.sign = 'minus';
            } else if (this.requestType == 'GET' && this.direction == 'incoming') {
                this.sign = 'plus';
            } else if (this.requestType == 'GIVE' && this.direction == 'incoming') {
                this.sign = 'minus';
            }

            this.iconSide = '';

            if (this.sign == 'minus') {
                this.iconSide = 'right';
            } else if (this.sign == 'plus') {
                this.iconSide = 'left';
            }


            this.isLoss = (angular.isDefined(this.payer) && this.payer.id === $rootScope.user.id)
                || (this.requestType === RequestTypes.GET && this.direction === 'incoming')
                || (this.requestType === RequestTypes.GIVE && this.direction === 'outgoing');
            this.isGain = (angular.isDefined(this.payee) && this.payee.id === $rootScope.user.id) ||
                (this.requestType === RequestTypes.GIVE && this.direction === 'incoming') ||
                (this.requestType === RequestTypes.GET && this.direction === 'outgoing');

        };


        /*
         var sortChatArr = function () {


         $scope.interactions1 = _.sortBy($scope.interactionsObj, function (item) {
         return item.timestamp;
         });


         $scope.swipe = function (citem) {
         // citem.direction == 'incoming' ? citem.direction = 'outgoing' : citem.direction = 'incoming';
         // return citem;
         };


         ///var now = new Date().getTime();

         //  $scope.interactions1[0].showLine = true;

         //  var timeStr = moment($scope.interactions1[0].timestamp * 1000).calendar();

         // $scope.interactions1[0].formatTime = timeStr.toLowerCase();

         // $scope.interactions1[0].showLine = true;
         ///  var timeStr = moment($scope.interactions1[0].timestamp * 1000).calendar();
         //  $scope.interactions1[0].formatTime = timeStr.toLowerCase();


         for (var i = 1; i < $scope.interactions1.length; ++i) {
         var time1 = $scope.interactions1[i].timestamp * 1000;
         var time2 = $scope.interactions1[i - 1].timestamp * 1000;


         var mTime1 = moment(time1);
         var mTime2 = moment(time2);


         var diff = Math.abs(mTime1.diff(mTime2));


         //console.log("Math.abs((time1 * 1000 ) - now)", Math.abs((time1 * 1000 ) - now));

         //   console.log("time1 ", time1);
         //    console.log("time2 ", time2);


         //   console.log("moment(time1).format() ", moment(time1).format());
         //   console.log("moment(time2).format()  ", moment(time2).format());

         // console.log("diff ", diff);
         // var t1 = new Date();
         // var inputDate = new Date("11/21/2011");


         if (diff < 1000 * 1 * 60 * 60 * 24) {
         // console.log("Math.abs((time1 * 1000 ) - now)", diff);
         //   console.log("smaller");
         //    console.log("absDiff", absDiff);
         //    console.log("message", $scope.interactions1[i].message);

         if (diff > 1000 * 60 * 3) {
         $scope.interactions1[i].showLine = true;
         var timeStr = moment($scope.interactions1[i].timestamp * 1000).calendar();
         $scope.interactions1[i].formatTime = timeStr.toLowerCase();
         }

         } else {
         if (diff > 1000 * 60 * 60) {
         $scope.interactions1[i].showLine = true;

         var timeStr = moment($scope.interactions1[i].timestamp * 1000).calendar();
         $scope.interactions1[i].formatTime = timeStr.toLowerCase();
         }
         }


         }
         $scope.$safeApply();
         console.log("about to scroll");

         $timeout(function () {
         scrollTo('scroll-to');
         }, 100);
         };*/

        var sortChatArr = function (chatArr) {


            if (chatArr[0] && !chatArr[0].isInit)
                chatArr[0] = new Citem(chatArr[0]);

            for (var i = 1; i < chatArr.length; ++i) {
                if (!chatArr[i].isInit)
                    chatArr[i] = new Citem(chatArr[i]);

                var time1 = chatArr[i].timestamp * 1000;
                var time2 = chatArr[i - 1].timestamp * 1000;


                var mTime1 = moment(time1);
                var mTime2 = moment(time2);


                var diff = Math.abs(mTime1.diff(mTime2));


                //console.log("Math.abs((time1 * 1000 ) - now)", Math.abs((time1 * 1000 ) - now));

                //   console.log("time1 ", time1);
                //    console.log("time2 ", time2);


                //   console.log("moment(time1).format() ", moment(time1).format());
                //   console.log("moment(time2).format()  ", moment(time2).format());

                // console.log("diff ", diff);
                // var t1 = new Date();
                // var inputDate = new Date("11/21/2011");


                if (diff < 1000 * 1 * 60 * 60 * 24) {
                    // console.log("Math.abs((time1 * 1000 ) - now)", diff);
                    //   console.log("smaller");
                    //    console.log("absDiff", absDiff);
                    //    console.log("message", $scope.interactions1[i].message);

                    if (diff > 1000 * 60 * 3) {
                        chatArr[i].showLine = true;
                        var timeStr = moment(chatArr[i].timestamp * 1000).calendar();
                        chatArr[i].formatTime = timeStr.toLowerCase();
                    }

                } else {
                    if (diff > 1000 * 60 * 60) {
                        chatArr[i].showLine = true;

                        var timeStr = moment(chatArr[i].timestamp * 1000).calendar();
                        chatArr[i].formatTime = timeStr.toLowerCase();
                    }
                }


            }

            HistoryService.setLocalStorage($routeParams.otherUserId, chatArr);
            return chatArr;

        };


        $scope.scrollBtm = function () {
            var content = jQuery('.content'),
                chatContainer = jQuery('#chat-container');

            content.scrollTop(
                    chatContainer.height() + content.height()
            );
        };


        $scope.$on('newChatMsg', function (scope, message) {
            console.log("newChatMsg", message);

            var isNew = true;
            for (var i = 0; i < $scope.interactions1.length; i++) {
                if ($scope.interactions1[i].id == message.id) {
                    $scope.interactions1[i] = new Citem(message);
                    $scope.$safeApply();
                    isNew = false;
                    break;
                    return;
                }
            }

            if (isNew) {
                $scope.interactions1.push(message);
                $scope.interactions1 = sortChatArr($scope.interactions1);
                $timeout(function () {
                    scrollTo('scroll-to');
                }, 100);
            }


            $scope.$safeApply();

        });

        $scope.$on('updateChatMsg', function (scope, message) {
            // console.log("updateChatMsg", message);

            for (var i = 0; i < $scope.interactions1.length; i++) {
                if ($scope.interactions1[i].id == message.id) {
                    $scope.interactions1[i] = new Citem(message);
                    $scope.$safeApply();
                    break;
                }
            }


            $scope.$safeApply();

        });

        $scope.reject = function (citem, direction) {
            requests.rejectRequest(citem, direction);
        };

        $scope.accept = function accept(citem) {
            requests.acceptRequest(citem);
        };

        $scope.acceptTwoWay = function accept(citem) {
            console.log("acceptTwoWay ", citem);
            requests.acceptTwoWayRequest(citem);
        };


        $scope.lastSeenId = null;

        /*
         $scope.add_change_doc = function (doc) {


         if (doc.lastSeen) {
         $scope.lastSeenId = doc.id;

         }

         $scope.interactionsObj[doc.id] = new Citem(doc);
         sortChatArr();
         //HistoryService.setLocalStorage($routeParams.otherUserId, $scope.interactionsObj);
         };

         $scope.$on('updateRequest', function (scope, request) {
         $scope.add_change_doc(request);
         });*/


        jQuery(".content").bind('scroll', function () { //when the user is scrolling...
            var pos = jQuery(".content").scrollTop(); //position of the scrollbar

            if (pos > $scope.pagingData.posWas) { //if the user is scrolling down...
                //do something
            }
            if (pos < 50 && pos < $scope.pagingData.posWas) { //if the user is scrolling up...
                //do something
                $scope.getMyChatWith(true);
                $scope.pagingData.goTo = $scope.interactions1[0].id;
                //  Ddp.unSubscribe('chat');
                //$scope.subChat();
                //console.log("its time to get more chat !!!", $scope.pagingData);
            }
            $scope.pagingData.posWas = pos; //save the current position for the next pass
        });


        $scope.$watch('ChatServices.btcmode', function (newValue, oldValue) {
            //console.log("newValue", newValue);
            // console.log("oldValue", oldValue);

            if (newValue == 'sat' && !$rootScope.user.address) {
                $rootScope.message = {
                    body: 'you do not have bitcoin address, create one now?',
                    action: function () {
                        $rootScope.message = null;
                        $location.path('/app/me').search({action: "btcaddress"});
                    },
                    cancel: function () {
                        //console.log("cancel");
                        ChatServices.btcmode = "tnx"
                    },
                    actiontext: 'yep',
                    canceltext: 'nope'
                };

                return;
            }

            if (newValue == 'sat' && !otherUser.isAddress && !otherUser.address) {

                $rootScope.message = {
                    body: otherUser.fullname + ' has not generated a bitcoin address. would you like to send a message explaining how to do that?"',
                    action: function () {

                        $rootScope.message = null;
                        var msg = "hi, please click [/app/me?action=btcaddress,here] to generate a bitcoin address. we'll then be able to send thanx as well as satoshi to each other. thanx :)";
                        $scope.tx.tnx = "";
                        $scope.tx.message = msg;
                        $scope.sendMessage();
                        ChatServices.btcmode = "tnx";

                    },
                    cancel: function () {
                        //console.log("cancel");
                        ChatServices.btcmode = "tnx";
                    },
                    actiontext: 'yep',
                    canceltext: 'nope'
                };
            }


        });

        $scope.tx = {tnx: "", sat: "", message: ""};

        $scope.isMoneyTx = function isMoneyTx() {
            return ((!ChatServices.btcmode || ChatServices.btcmode == 'tnx') && $scope.tx.tnx) || (ChatServices.btcmode === 'sat' && $scope.tx.sat) || (ChatServices.btcmode === 'dollar' && $scope.tx.dollar);
        };

        function setSubmitDisabled(disabled) {
            $scope.submitDisabled = disabled;
        }

        function clearValues() {
            $scope.tx = {tnx: "", sat: "", message: ""};
        }

        function errHandler(err) {
            setSubmitDisabled(false);
            if (err) {
                $rootScope.errHandle(err);
            }
        }

        function onRequestSend() {
            $rootScope.message = {
                body: 'request sent!',
                canceltext: 'cool tnx'
            };
            setSubmitDisabled(false);
            clearValues();
        }


        $scope.requestMode = 'send';

        if (otherUser.isAddress) {
            ChatServices.btcmode = "sat";
        } else {
            ChatServices.btcmode = "tnx";
        }


        /*
         $scope.sendMessage = function sendMessage() {

         if ($scope.submitDisabled) return;

         if (ChatServices.btcmode == "tnx") {
         if (($scope.tx.tnx == "" ) && $scope.tx.message == "") {
         return
         }
         }
         else {
         if (($scope.tx.sat == ""  ) && $scope.tx.message == "") {
         return
         }
         }

         setSubmitDisabled(true);

         if (((!ChatServices.btcmode || ChatServices.btcmode === 'tnx') && parseInt($scope.tx.tnx) > 0) ||
         ((ChatServices.btcmode === 'sat') && parseInt($scope.tx.sat) > 0)) {
         if ($scope.requestMode === 'receive') {
         $scope.get();
         } else {
         $scope.give();
         }
         return;
         }

         var tmpTx = $scope.tx;
         $scope.tx = {tnx: "", sat: "", message: ""};

         $http.post(baseAppUrl + '/mkrequest', {
         tnx: 0,
         accessToken: access_token,
         giveTo: $routeParams.otherUserId,
         message: tmpTx.message,
         requestType: RequestTypes.GIVE
         })
         .success(function (r) {
         r.isNew = true;
         $scope.add_change_doc(r);
         setSubmitDisabled(false);
         //clearValues();
         })
         .error(errHandler);
         };
         */

        $scope.getActionImage = function () {

            //console.log("getActionImage");

            if ($scope.direction && $scope.direction == 'out') {
                return "out";
            } else if ($scope.direction && $scope.direction == 'in') {
                return "in";
            } else if ($scope.msg) {
                return "sendMsg";
            } else {
                return "sendOneTnx";
            }

        };

        $scope.Keypress = function (e) {

            // console.log('$(e.target).val().length', $(e.target).val().length);


            var char = String.fromCharCode(e.which);
            if (e.keyCode == 13) {

                e.preventDefault();

                $scope.sendMessage();

            }


        };

        $scope.numKeypress = function (e) {


            if (e.keyCode == 13) {

                e.preventDefault();

                $scope.sendMessage();

            } else if (!String.fromCharCode(e.which).match(/\d/)) {
                e.preventDefault();
            }


        };


        $scope.give = function give() {
            setSubmitDisabled(true);
            if ((!ChatServices.btcmode || ChatServices.btcmode === 'tnx') && parseInt($scope.tx.tnx) > 0) {
                giveTnxNotSafe();
            } else if (ChatServices.btcmode == 'dollar' && parseFloat($scope.tx.dollar) > 0.01) {
                $scope.tx.tnx = ((parseFloat($scope.tx.dollar) * 100000000) / $rootScope.price).toFixed();
                giveTnxNotSafe();
            } else if (ChatServices.btcmode == 'sat' && parseFloat($scope.tx.sat) > 0) {
                giveSatNotSafe();
                setSubmitDisabled(false);
            }
        };

        $scope.get = function get() {
            setSubmitDisabled(true);

            if ((!ChatServices.btcmode || ChatServices.btcmode === 'tnx') && parseInt($scope.tx.tnx) > 0) {
                getTnxNotSafe();
            } else if (ChatServices.btcmode == 'dollar' && parseFloat($scope.tx.dollar) > 0.01) {
                $scope.tx.tnx = ((parseFloat($scope.tx.dollar) * 100000000) / $rootScope.price).toFixed();
                getTnxNotSafe();
            } else if (ChatServices.btcmode == 'sat' && parseFloat($scope.tx.sat) > 0) {
                getSatNotSafe();
            }
        };

        function makeTwoWayNotSafe() {
            closeChatBtm();
            var tx = null;
            if ($scope.direction == 'out' && $scope.units == 'sat') {

                $rootScope.bitcoinTwoWay($routeParams.otherUserId, parseInt($scope.amount), 10000, $scope.msg, undefined).then(function (txS) {
                    tx = txS;
                    console.log("tx ", tx);
                    mkTwoWatReq();
                });

            } else {
                mkTwoWatReq();
            }

            function mkTwoWatReq() {

                var reqObj = {
                    to: $routeParams.otherUserId,
                    accessToken: access_token,
                    tx: tx,
                    message: $scope.msg,
                    secondTx: $scope.secondTx
                };

                if ($scope.units == 'sat') {
                    reqObj['sat'] = parseInt($scope.amount)
                } else {
                    reqObj['tnx'] = parseInt($scope.amount)
                }

                if ($scope.direction == 'out') {
                    reqObj['requestType'] = RequestTypes.GIVE
                } else {
                    reqObj['requestType'] = RequestTypes.GET
                }


                $http.post(baseAppUrl + '/mkrequest', reqObj)
                    .success(function (r) {
                        r.isNew = true;
                        // $scope.add_change_doc(r);
                        setSubmitDisabled(false);
                        clearValues();
                    })
                    .error(errHandler);
            }


        }

        function getTnxNotSafe() {
            setSubmitDisabled(true);
            //closeChatBtm();
            $http.post(baseAppUrl + '/mkrequest', {
                tnx: parseInt($scope.amount),
                getFrom: $routeParams.otherUserId,
                accessToken: access_token,
                message: $scope.msg,
                requestType: RequestTypes.GET
            })
                .success(function (r) {
                    r.isNew = true;
                    // $scope.add_change_doc(r);
                    setSubmitDisabled(false);
                    semiInitMsgParams();
                    clearValues();
                })
                .error(errHandler);
        }

        function getSatNotSafe() {
            setSubmitDisabled(true);
            closeChatBtm();
            $http.post(baseAppUrl + '/mkrequest', {
                sat: parseInt($scope.amount),
                accessToken: access_token,
                getFrom: $routeParams.otherUserId,
                message: $scope.msg,
                requestType: RequestTypes.GET
            })
                .success(function (r) {
                    r.isNew = true;
                    // $scope.add_change_doc(r);
                    setSubmitDisabled(false);
                    initMsgParams();
                    clearValues();
                })
                .error(errHandler);
        }

        function giveTnxNotSafe() {
            // closeChatBtm();
            setSubmitDisabled(true);
            if ($rootScope.user.tnx < parseInt($scope.amount)) {
                $rootScope.message = {
                    body: 'not enough thanx to give',
                    canceltext: 'ok'
                };
                setSubmitDisabled(false);
                return;
            }
//?accessToken=" + restponse.authResponse.accessToken

            var obj = {
                tnx: parseInt($scope.amount),
                accessToken: access_token,
                giveTo: $routeParams.otherUserId,
                message: $scope.msg,
                requestType: RequestTypes.GIVE
            };

            $http.post(baseAppUrl + '/mkrequest', obj)
                .success(function (r) {

                    console.log(r);
                    console.log(obj);

                    r.isNew = true;
                    //$scope.add_change_doc(r);
                    setSubmitDisabled(false);
                    semiInitMsgParams();
                    clearValues();
                })
                .error(errHandler);
        }

        function giveSatNotSafe() {
            closeChatBtm();

            console.log("giveSatNotSafe", parseInt($scope.amount));
            $rootScope.bitcoinSend($routeParams.otherUserId, parseInt($scope.amount), 10000, $scope.msg, undefined, errHandler);
            initMsgParams();

        }

        function sendMsg() {
            if (!$scope.msg)
                return;

            setSubmitDisabled(true);
            closeChatBtm();
            $http.post(baseAppUrl + '/mkrequest', {
                tnx: 0,
                accessToken: access_token,
                giveTo: $routeParams.otherUserId,
                message: $scope.msg,
                requestType: RequestTypes.GIVE
            })
                .success(function (r) {
                    r.isNew = true;
                    // $scope.add_change_doc(r);
                    setSubmitDisabled(false);
                    initMsgParams();
                    //clearValues();
                })
                .error(errHandler);
        }

        $scope.sendMessage = function sendMessage() {

            console.log("$scope.txType ", $scope.txType);

            if ($scope.submitDisabled) return;


            if ($scope.direction && $scope.amount) {

                if ($scope.direction == 'in') {
                    if ($scope.units == 'sat') {
                        getSatNotSafe();
                        return;
                    } else {
                        getTnxNotSafe();
                        return;
                    }
                } else {
                    if ($scope.units == 'sat') {
                        giveSatNotSafe();
                        return;
                    } else {
                        giveTnxNotSafe();
                        return;
                    }
                }


            }

            sendMsg();


        };

        // var timer = setInterval(this.getInteraction, 5000);

        var that = this;


        /*$timeout(function () {
         that.getInteraction(true);
         });*/

        $scope.$on("$destroy", function () {
            Spinner.complete();

            $http.post(baseAppUrl + '/getMyChatWith', {
                accessToken: access_token,
                otherUserId: null

            })
                .success(function (r) {

                })
                .error(function (e) {
                    console.log("error ", e);
                });
        });
    }
]);

window.controllers.controller('HeaderChatController', ['$scope', 'RequestTypes', 'requests', '$rootScope', '$timeout', '$http', '$routeParams', 'HistoryService', 'me', 'bitcoin', 'ChatServices',
    function ($scope, RequestTypes, requests, $rootScope, $timeout, $http, $routeParams, HistoryService, me, bitcoin, ChatServices) {
        $scope.ChatServices = ChatServices;
        $scope.otherUser = ChatServices.otherUser;


    }
]);