window.app.service('HistoryService', ['$http', '$rootScope', 'Ddp', '$timeout', 'Spinner',
    function ($http, $rootScope, Ddp, $timeout, Spinner) {

        //console.log("HistoryService Start!!");

        var history,
            interactions = {},
            conversations;


        var self = this;

        this.conversationsDdp = {};


        this.setLocalStorage = function (key, value) {
            if (typeof(Storage) !== "undefined") {
                // Code for localStorage/sessionStorage.

                if (typeof (value) !== "string") {
                    value = JSON.stringify(value);
                    localStorage.setItem(key, value);
                }

            }
            else {
                // Sorry! No Web Storage support..
            }
            $rootScope.$safeApply();
        };

        this.getLocalStorage = function (key, doParse) {
           // return {};


            if (typeof(Storage) !== "undefined") {
                // Code for localStorage/sessionStorage.

                var val = localStorage.getItem(key);
                if (val) {
                    if (doParse) {
                        return JSON.parse(val);
                    } else {
                        return val;
                    }
                } else {
                    return {};
                }


            }
            else {
                // Sorry! No Web Storage support..
            }
            $rootScope.$safeApply();
        };

        this.conversationsDdp = null;


        this.setConversations = function () {
            Spinner.start();

            $http.post(baseAppUrl + '/subme', {
                accessToken: access_token
            });

            $http.post(baseAppUrl + '/getmyconversations', {
                accessToken: access_token
            })
                .success(function (r) {
                    Spinner.complete();
                    self.conversations = r;

                })
                .error(function (e) {
                    Spinner.complete();
                    console.log("error ", e);
                });
        };


        this.getConversations = function () {
            // console.log("getConversations ");
            return _.sortBy(self.conversations, function (item) {
                return -(item.updateTimestamp ? item.updateTimestamp : item.timestamp);
            });
        };

        this.getConversationsDdp = function () {
            return _.sortBy(self.conversationsDdp, function (item) {
                return -item.timestamp;
            });
        };

        self.have = 0;
        var isFirstTime = true;

        var goToId = null;
        var scrollTo = function (el) {
            var container = jQuery('.content'),
                scrollTo = jQuery('#' + el);

            if (scrollTo.offset()) {
                container.scrollTop(
                        scrollTo.offset().top - container.offset().top + container.scrollTop()
                );
            }
        };

        $rootScope.$on('loggedIn', function (scope) {
            self.setConversations();
        });


        $rootScope.$on('onResume', function (scope) {
            self.setConversations();
        });

        var haveMore = true;

        this.loadMore = function () {


            //console.log(Ddp.client.getCollection("counters").latestinteractions.count);
            if (!haveMore)
                return;

            Spinner.start();
            try {


                $http.post(baseAppUrl + '/getNextBatch', {
                    accessToken: access_token
                })
                    .success(function (r) {

                        Spinner.complete();
                        if (r.length == 0) {
                            haveMore = false;
                        } else {
                            self.conversations = self.conversations.concat(r);

                        }


                    })
                    .error(function (e) {
                        Spinner.complete();
                        console.log("error ", e);
                    });
            } catch (err) {
                Spinner.complete();
                console.log("err", err);
            }

        };

        $rootScope.$on('watch_myConversations', function (scope, Conversation, message) {
            // console.log("latestinteractions changedDoc", Conversation);
            // console.log("latestinteractions message", message);


            if (message == "added" || message == "changed") {
                self.conversationsDdp[Conversation._id] = Conversation;
            }
            self.setLocalStorage("conversationsDdp", self.conversationsDdp);
            $rootScope.$safeApply();
        });

        $rootScope.$on('conversation', function (scope, obj) {

            //console.log("obj ", obj);

            var isNew = true;
            for (var i = 0; i < self.conversations.length; i++) {
                // console.log("self.conversations[i] ", self.conversations[i]);
                if (self.conversations[i].otherUserId == obj.otherUserId) {
                    isNew = false;
                    self.conversations[i] = obj;
                    break;
                }
            }

            if (isNew) {
                self.conversations.push(obj);
            }

            /*
             $timeout(function () {

             }, 100);*/

            $rootScope.$safeApply();
            // if(self.conversations[obj.id])
        });


        this.getHistory = function getHistory(cb) {
            $http.get('/rawhistory').success(function (h) {
                history = h;
                cb(h);
            });
        };

        this.getCachedHistory = function getCachedHistory() {
            if (history)
                return history;
            return null;
        };

        this.getHistoryItem = function getHistoryItem(id, cb) {
            var result,
                that = this,
                /**
                 *   Find the item in the cached history object.
                 *   Calls the callback and returns true if item was found, returns false otherwise.
                 */
                findHistoryItem = function findHistoryItem() {
                    result = jQuery.grep(history, function (item) {
                        return item.id == id;
                    });
                    if (result[0]) {
                        cb(result[0]);
                        return true;
                    }
                    return false;
                };
            if (!history) {
                // no history is cached - go to server
                this.getHistory(findHistoryItem);
            } else if (!findHistoryItem()) {
                // history is cached but specific item not found
                this.getHistory(findHistoryItem);
            }
        };

        this.getInteractionWithUser = function getInteractionWithUser(otherUserId, cb) {
            $http.get('/interaction?otherUserId=' + otherUserId).success(function (result) {
                interactions[otherUserId] = result;
                cb(null, result);
            }).error(function (err) {
                cb(err);
            });
        };

        this.getCachedInteractionWithUser = function getCachedInteractionWithUser(otherUserId, cb) {
            if (interactions[otherUserId]) {
                return interactions[otherUserId];
            }
            return null;
        };
        /*

         this.getConversations = function getConversations(cb) {
         $http.get('/latestinteractions').success(function (result) {
         conversations = result;
         cb(null, result);
         }).error(function (err) {
         cb(err);
         });
         };*/

        this.getCachedConversations = function getCachedConversations() {
            return conversations || null;
        }
    }
]);