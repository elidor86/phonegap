window.app.directive('renderChatMsg', ["$timeout", '$rootScope', '$location', 'RequestTypes', 'requests',

    function ($timeout, $rootScope, $location, RequestTypes, requests) {
        return {

            link: function ($scope, element, attrs) {


                String.prototype.escape = function () {

                    var tagsToReplace = {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;'
                    };

                    return this.replace(/[&<>]/g, function (tag) {
                        return tagsToReplace[tag] || tag;
                    });

                };

                var pattern = /\[(.*?)\]/;
                var linkRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
                var html = $scope.citem.message ? $scope.citem.message.escape() : "";
                var brPtrn = new RegExp("&lt;br&gt;", 'igm');
                html = html.replace(brPtrn, "<br>");
                var link = html.match(pattern);

                if (link) {
                    //
                    var data = link[1].split(",");
                    // console.log("link ", data[0]);
                    data[0] = '/#' + data[0];
                    html = html.replace(pattern, '<a class="msg-link" href="' + data[0] + '" target="_self">' + data[1] + '</a>');
                }
                var links = html.match(linkRegex);
                if (links) {

                    //console.log("link ", data[0]);
                    for (var i = 0; i < links.length; i++) {
                        var str = links[i];
                        if (str.search("http") == -1) {
                            str = 'http://' + str;
                        }
                        html = html.replace(links[i], '<a class="msg-link" onclick="window.open(\'' + str + '\', \'_blank\');" >' + links[i] + '</a>');
                    }

                }


                jQuery(element[0]).html(html);

            }
        };
    }
]);

