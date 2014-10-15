window.app.directive('whenScrolled', ["$rootScope",

    function ($rootScope) {
        return {

            link: function (scope, element, attrs) {


                element.bind('scroll', function () {
                    var raw = element[0];


                    if (raw.scrollTop + raw.offsetHeight + 200 >= raw.scrollHeight) {

                        // scope.loadMore();
                        scope.$apply(attrs.whenScrolled);
                    }
                });


            }
        };
    }
]);
