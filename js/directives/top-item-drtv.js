window.app.directive('topHtml', ['$location', '$timeout', '$route',
    function ($location, $timeout, $route) {

        console.log("$route", $route);
        console.log("$route", $route.current && $route.current.$$route && $route.current.$$route.originalPath ? localHtml[$route.current.$$route.originalPath.split("/app/")[1] + 'Top'].html : "");
        return {

            template: $route.current && $route.current.$$route && $route.current.$$route.originalPath ? localHtml[$route.current.$$route.originalPath.split("/app/")[1] + 'Top'].html : "",
            link: function linkFn(scope, element) {


            }
        };
    }
]);