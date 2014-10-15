window.controllers.controller('ConversationsController', ['$scope', 'Spinner', 'Theme', '$rootScope', '$timeout', '$http', 'HistoryService',
    function ($scope, Spinner, Theme, $rootScope, $timeout, $http, HistoryService) {

        //  Theme.headerCenterState = 'balance';
        //  Theme.headerRightState = null;
        //   Theme.headerLeftState = null;

        Theme.setHeaderSrc("conversations");
        Theme.showHeader();

        $scope.searchText = $rootScope.searchText;

        $scope.HistoryService = HistoryService;

        $scope.loadMore = function () {
            HistoryService.loadMore();
        };

        $scope.conversation = [];


        var Item = function (item) {
            //console.log('item', item);

            this.pendingInCounter = item.pendingInCounter;
            this.pendingOutCounter = item.pendingOutCounter;

            if (typeof item.otherUser == 'string') {

                this.isUser = false;
                this.path = "btc/" + item.otherUser;
                this.username = item.otherUser;
                this.imageUrl = 'img/ui/bitcoin_icon.png';
            } else if (item.otherUser.id == '123456thanx') {
                this.isUser = false;
                this.path = "chat/123456thanx";
                this.imageUrl = 'img/ui/thanx_icon.png';
                this.username = 'thanx.io';
            } else {
                this.isUser = true;
                this.path = "chat/" + item.otherUser.id;
                this.imageUrl = $rootScope.getFbProfilePic(item.otherUser.id);
                this.username = item.otherUser.fbUser.first_name + " " + item.otherUser.fbUser.last_name;
            }

            this.message = item.message ? item.message.replace(/<br>/igm, "") : "";
            if (this.message.length == 0 && this.isUser) {
                var amount = item.amount;


                var dir = 'in';
                if (item.direction == 'incoming' && item.requestType == 'GIVE') {
                    dir = 'out';
                } else if (item.direction == 'outgoing' && item.requestType == 'GET') {
                    dir = 'out';
                }

                var units = item.units == 'tnx' ? 'thanx' : 'satoshi';
                this.message = amount + " " + units + " " + dir;
                // console.log('0 length');
            }

            var pattern = /\[(.*?)\]/;
            var link = this.message ? this.message.match(pattern) : null;

            if (link) {
                var data = link[1].split(",");
                this.message = this.message.replace(pattern, data[1]);
            }

        };

        $scope.setItem = function (item) {
            return new Item(item);
        };

        $scope.$on("$destroy", function () {
            Spinner.complete();

        });

        /*
         this.getConversations = function getConversations(firstTime) {
         function dumpConversation(c) {
         return {
         userId: c[c.otherUserKey].id,
         timestamp: c.timestamp
         };
         }
         if (firstTime) {
         var cachedConversations = HistoryService.getCachedConversations();
         if (cachedConversations) {
         $scope.conversations = cachedConversations;
         return;
         }
         }
         HistoryService.getConversations(function(err, conversations) {
         $scope.conversations = $scope.conversations || [];
         var oldConversations = $scope.conversations.map(dumpConversation);
         var newConversations = conversations.map(dumpConversation);
         if (!angular.equals(oldConversations, newConversations)) {
         $scope.conversations = conversations;
         }
         });
         };
         var timer = setInterval(this.getConversations, 5000),
         that = this;

         $timeout(function() {
         that.getConversations(true);
         });

         $scope.$on("$destroy", function() {
         clearInterval(timer);
         });*/


    }
]);