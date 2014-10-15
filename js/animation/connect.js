window.app
    .animation('.show-hide-connect', function () {

        return {

            /*
             * make sure to call the done() function when the animation is complete.
             */
            beforeAddClass: function (element, className, done) {

                if (className == 'ng-hide') {


                    TweenMax.fromTo(element, 0.5, { x: 0}, {  x: -jQuery('#conversations-container').width() - 100 });

                    TweenMax.fromTo(jQuery('#conversations-container'), 0.5, { x: -jQuery(element).width()}, {  x: 0, onComplete: function () {
                        done();
                    }});

                } else {
                    done();
                }

            },

            /*
             * make sure to call the done() function when the animation is complete.
             */
            removeClass: function (element, className, done) {

                if (className == 'ng-hide') {

                    //  TweenMax.fromTo(jQuery('#conversations-container'), 0.5, { x: 0}, {  x: -jQuery('#conversations-container').width() - 100 });

                    TweenMax.fromTo(element, 0.5, { x: -jQuery(element).height()}, {  x: 0, onComplete: function () {
                        done();
                    }});

                } else {
                    done();
                }
            }
        }
    })
    .animation('.show-hide-top-bar', function () {

        return {

            /*
             * make sure to call the done() function when the animation is complete.
             */
            beforeAddClass: function (element, className, done) {

                if (className == 'ng-hide') {


                    TweenMax.fromTo(element, 0.5, { y: 0}, {  y: -jQuery(element).height(), onComplete: function () {
                        done();
                    }});

                } else {
                    done();
                }

            },

            /*
             * make sure to call the done() function when the animation is complete.
             */
            removeClass: function (element, className, done) {

                if (className == 'ng-hide') {

                    TweenMax.fromTo(element, 0.5, { y: -jQuery(element).height()}, {  y: 0, onComplete: function () {
                        done();
                    }});
                } else {
                    done();
                }
            }
        }
    });

