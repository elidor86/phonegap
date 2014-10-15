//$( ".selector" ).draggable({ axis: "x" });

window.controllers.controller('welcomeCtrl', ['$scope', 'Spinner', '$rootScope', '$timeout', '$location', 'UsersService',
    function ($scope, Spinner, $rootScope, $timeout, $location, UsersService) {


        $scope.initMainSlider = function () {


            var leftArrow = $('#main-arrow-left');
            var rightArrow = $('#main-arrow-right');
            var txSettingsContainer = $('.tx-settings-container');
            var cIcon = $('#main-c');


            var cIconPos = cIcon.position();


            var Container = jQuery('.welcome-slider-container');

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


                    loginWithFacebook();

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

                    cIcon.css({
                        "transition": 'all .5s ease-in-out',
                        "-webkit-transition": 'all .5s ease-in-out',
                        "-webkit-transform": 'translate3d(0px,0,0)'
                    });


                    //   TweenMax.to(leftArrow, 0.5, {opacity: 1});
                    // TweenMax.to(rightArrow, 0.5, {opacity: 1});

                    leftArrow.css('opacity', '1');
                    rightArrow.css('opacity', '1');
                    $timeout(function () {
                        cIcon.css({
                            transition: "",
                            '-webkit-transition': ''
                        });


                    }, 800);

                    $scope.$safeApply();

                }


                //evt.preventDefault()

            };


            var el = document.getElementById("main-c");
            el.addEventListener("touchstart", handleStart, false);
            el.addEventListener("touchmove", handleMove, false);
            el.addEventListener("touchend", handleEnd, false);

        };

        $scope.initMainSlider();


        var loginWithFacebook = function () {

            Spinner.start();
            $rootScope.$safeApply();

            UsersService.loginWithFacebook(true).then(
                function () {
                    console.log("welcomeCtrl loginWithFacebook success");
                    UsersService.getUsersFbFriends();
                    Spinner.complete();
                    $rootScope.goTo('conversations');
                    $rootScope.$safeApply();

                    /*
                     thanxIcon.css({
                     "-webkit-transform": 'translate3d(' + 0 + 'px,0,0)'
                     });*/

                },
                function () {
                    console.log("welcomeCtrl loginWithFacebook error");
                    Spinner.complete();
                    $rootScope.$safeApply();

                    /*
                     thanxIcon.css({
                     "-webkit-transform": 'translate3d(' + 0 + 'px,0,0)'
                     });*/
                }
            )

        };


    }
]);


