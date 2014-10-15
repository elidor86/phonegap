window.app.service('Ddp', ['$rootScope', "$q",
    function ($rootScope, $q) {

        var subscribe = function () {

            if (realtimeClient && _.isObject(profile) && profile.id) {

                realtimeClient.subscribe(profile.id, false, function (ortc, channel, message) {

                    try {
                        var msg = JSON.parse(message);

                        console.log("Received message: ", msg);

                        if (msg && msg.action) {
                            $rootScope.$broadcast(msg.action, msg.obj);
                        }


                    } catch (err) {

                        console.log("Received message err ", err);
                    }
                    //$scope.messages.push(message);
                    //$scope.$apply();
                });
            }


        };

        loadOrtcFactory(IbtRealTimeSJType, function (factory, error) {
            if (error != null) {
                //alert("Factory error: " + error.message);
                console.log("Factory error ", error);
            } else {
                if (factory != null) {

                    realtimeClient = factory.createClient();
                    realtimeClient.setClusterUrl('http://ortc-developers.realtime.co/server/2.1/');


                    realtimeClient.onConnected = function (ortc) {
                        console.log("realtimeClient onConnected!!!!!!!!!!!!!");
                        subscribe();

                    };

                    realtimeClient.onException = function (ortc, exception) {
                        console.log("realtimeClient onException: ", exception);
                    };

                    realtimeClient.onDisconnected = function (ortc) {
                        console.log("realtimeClient onDisconnected: ");
                    };

                    realtimeClient.onReconnecting = function (ortc) {
                        console.log("realtimeClient onReconnecting: ");
                    };

                    realtimeClient.onReconnected = function (ortc) {
                        console.log("realtimeClient onReconnected: ");
                        subscribe();
                    };

                    realtimeClient.connect('lKrTYO', '6AgDJcLHH16T');
                }
            }
        });


        $rootScope.$on('loggedIn', function (scope) {
            subscribe();
        });


        var DdpServices = {};


        /*
         var subs = {},
         isFirstTime = true,
         client = null,
         isConnected = false,
         reconnectCount = 0,
         watchers = {};


         var InitSubs = function () {
         if (!profile)
         return;
         subs['me'] = {name: "me", params: [window.profile.id]};
         // subs['latestinteractions'] = {name: "latestinteractions", params: [window.profile.id]};
         };


         DdpServices.isConnected = false;

         var applyWatchers = function () {

         _.each(watchers, function (watch, key, list) {

         if (!client.watchers[watch.name]) {
         client.watch(watch.name, function (doc, message) {
         $rootScope.$broadcast("watch_" + watch.name, doc, message);
         })
         }

         });

         };

         DdpServices.addWatch = function (name) {
         watchers[name] = {name: name};

         if (client) {
         client.watchers = {};
         applyWatchers();
         }
         };

         DdpServices.removeWatch = function (name) {
         delete  watchers[name];
         if (client) {

         }
         };

         DdpServices.addWatch('InvitationStatus');
         DdpServices.addWatch('myConversations');
         DdpServices.addWatch('user');
         DdpServices.addWatch('chat');


         var applyInitSubs = function () {

         InitSubs();
         _.each(subs, function (sub, key, list) {

         client.subscribe(sub.name, sub.params)
         .done(function () {
         console.log("Successfully sub to ", sub.name);
         $rootScope.$broadcast('subscribeReady_' + sub.name);
         })
         .fail(function (err) {

         });

         });
         };

         var onConnect = function () {
         applyWatchers();
         applyInitSubs();
         };


         DdpServices.connect = function connect() {

         console.log("DdpServices connect");
         console.log("DdpServices isConnected", isConnected);

         var deferred = $q.defer();

         InitSubs();
         if (isConnected) {
         deferred.resolve();
         onConnect();
         return deferred.promise;
         }

         if (DdpClient && DdpClient.sock && DdpClient.sock.readyState == 1) {
         client = DdpClient;
         isConnected = true;
         reconnectCount = 0;
         isFirstTime = false;
         onConnect();
         deferred.resolve();
         return deferred.promise;
         } else {
         DdpClient = new MeteorDdp('https://thanx.io/websocket');

         var start = new Date();
         DdpClient.connect().done(function () {
         var end = new Date();
         console.log("login diff", end - start);

         isConnected = true;
         client = DdpClient;
         onConnect();
         deferred.resolve();
         console.log('Connected!');
         });
         }

         return deferred.promise;
         //client = new MeteorDdp('https://bitconnect.me/websocket');


         };

         //DdpServices.connect();

         DdpServices.call = function (name, params) {

         var deferred = $q.defer();

         // console.log("call to ", name);

         if (isConnected && client) {

         var promise = client.call(name, params);

         promise.done(function (data) {
         deferred.resolve(data);
         });


         }
         else {
         deferred.reject();
         }

         // $rootScope.$broadcast('updateRequest', r);

         return deferred.promise;
         };

         DdpServices.subscribe = function (name, params) {

         var deferred = $q.defer();
         subs[name] = {name: name, params: params};
         console.log("subscribe to ", name);
         console.log("subscribe to params ", params);

         if (isConnected) {
         client.subscribe(name, params)
         .done(function () {
         deferred.resolve();
         $rootScope.$broadcast('subscribeReady_' + name);
         console.log("Successfully subs to ", name);
         })
         .fail(function (err) {
         deferred.reject();
         });
         }
         else {
         console.log("failed to subscribe");
         deferred.reject();
         }

         // $rootScope.$broadcast('updateRequest', r);

         return deferred.promise;
         };

         DdpServices.unSubscribe = function (name) {
         delete  subs[name];
         client.unsubscribe(name);
         };


         jQuery(document).on("SockOnClose", function (event, CloseEvent) {


         console.log("SockOnClose", CloseEvent);
         if (CloseEvent.wasClean) {
         isConnected = false;
         }
         else {
         //reconnectCount
         var reconnect = setInterval(function () {
         if (client.sock.readyState == 1) {
         clearInterval(reconnect);
         return;
         }
         /*else {
         //if (reconnectCount >= 10)
         console.log("numOfTry >= 10");
         isConnected = false;
         clearInterval(reconnect);
         return;
         }
         DdpServices.connect();
         reconnectCount = reconnectCount + 1;
         }, 3000);
         }

         });

         // DdpServices.client = client;
         DdpServices.getClient = function () {
         return client;
         };

         */
        return DdpServices;
    }
]);