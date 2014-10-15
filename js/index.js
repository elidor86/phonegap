/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var profile = null;


var lc_tes = location;
var html_con = null;
//var baseAppUrl = 'https://thanx.io';
//var baseAppUrl = 'http://test.thanx.io:7000';
var baseAppUrl = 'http://bitconnect.us';
var access_token = null;
var baseAppPath = document.URL.split("app.html")[0];

//alert("justch");

/*

 access_token = "CAAK0hRMU4jABACZBDuu1y25BsiZCKdZAd8PZAReoy1ZCrauAVAwDX3ejX2ub3FKPQw60wCDvue1rj52HWC6Vf7gdkH4I6JDxLKdteAUOXWlgXv1OKqoxWZBndgGXBMdvB4CKsS2T8JxxcQhq250ZCNVHx6QG5EJ0VpQTzOZAjobENLJ4ryj1aqeFmBMe5VXDl27EaODaez71ogX7R5FNpN7O5rimhdPDWDEZD";
 var localHtml = {
 connect: {
 url: 'partials/connect.html',
 html: ''
 },
 connectTop: {
 url: 'partials/top/connect.html',
 html: ''
 },

 conversations: {
 url: 'partials/conversations.html',
 html: ''
 },
 conversationsTop: {
 url: 'partials/top/conversations.html',
 html: ''
 },

 '123456thanx': {
 url: 'partials/super-chat.html',
 html: ''
 },

 '123456thanxTop': {
 url: 'partials/top/super-chat.html',
 html: ''
 },

 chat: {
 url: 'partials/chat.html',
 html: ''
 },

 chatTop: {
 url: 'partials/top/chat.html',
 html: ''
 },

 btc: {
 url: 'partials/addresschat.html',
 html: ''
 },

 btcTop: {
 url: 'partials/top/addresschat.html',
 html: ''
 },

 transaction: {
 url: 'partials/transaction.html',
 html: ''
 },

 me: {
 url: 'partials/me.html',
 html: ''
 },


 settings: {
 url: 'partials/me.html',
 html: ''
 },


 info: {
 url: 'partials/appprofile.html',
 html: ''
 }




 };


 var loadLocalHtml = function () {

 var conn = new jQuery.Deferred(), size = _.size(localHtml);

 _.each(localHtml, function (obj) {

 console.log(obj.url);
 jQuery.get(obj.url, function (data) {
 obj.html = data;

 });

 });


 return conn.promise();
 };
 */


var DeviceState = false;
document.addEventListener("pause", onPause, false);
document.addEventListener("resume", onResume, false);

function onResume() {
    DeviceState = true;
    angular.element(document.body).injector().get('$rootScope').$broadcast('onResume');
    // alert('onResume');
}

function onPause() {
    DeviceState = false;
    // alert('onpause');
}


var LoginWithFacebook = function () {

    console.log('LoginWithFacebook');

    facebookConnectPlugin.getLoginStatus(function (response) {


        console.log('getLoginStatus response', response);

        if (response.status === 'connected') {
            //  window.location.href = "app.html/#/";
            access_token = response.authResponse.accessToken;
            console.log('response connect', response);
            console.log('DdpClient connect');

            DdpClient.connect()
                .done(function () {
                    console.log('DdpClient connect done');


                    var jqxhr = jQuery.get(baseAppUrl + "/me?accessToken=" + response.authResponse.accessToken, function () {
                        //alert("success");
                    })
                        .done(function (data) {
                            console.log('Connected! angular.bootstrap');
                            window.profile = data;
                            profile = data;

                            angular.bootstrap(document, ['thanxbits']);


                        })
                        .fail(function (err) {
                            console.log('err ', err);
                        });


                })
                .fail(function (e) {

                    console.log('error', e);


                });


        } else {


            facebookConnectPlugin.login(["basic_info"], function (response) {
                if (response.authResponse) {
                    console.log('Welcome!  Fetching your information.... ');
                    window.location.href = location.href + "login";
                } else {
                    console.log('User cancelled login or did not fully authorize.');
                }
            });

        }
    });


};


function onNotificationAPN(event) {

    console.log("event ", event);

    if (event.alert) {
        /// navigator.notification.alert(event.alert);
    }

    if (event.otherUserId) {

        if (!DeviceState && typeof angular == 'object') {
            angular.element(document.body).injector().get('Theme').showTopBar(event.alert, event.otherUserId);
        }

    }

    if (event.badge) {
        //pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}

function onNotification(e) {

    console.log("onNotification event ", e);

    switch (e.event) {
        case 'registered':
            console.log("regID = " + e.regid);
            if (e.regid.length > 0) {


                $.ajax({
                    type: "POST",
                    url: baseAppUrl + '/updategcmtoken',
                    data: {token: e.regid, accessToken: access_token},
                    success: function () {

                    }
                });


            }
            break;

        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground) {

                angular.element(document.body).injector().get('Theme').showTopBar(e.payload.message, e.payload.payload.otherUserId);
                // $("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');

                // on Android soundname is outside the payload.
                // On Amazon FireOS all custom attributes are contained within payload
                //  var soundfile = e.soundname || e.payload.sound;
                // if the notification contains a soundname, play it.
                // var my_media = new Media("/android_asset/www/" + soundfile);
                //  my_media.play();
            }
            else {  // otherwise we were launched because the user touched a notification in the notification tray.
                if (e.coldstart) {



                    // $("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
                }
                else {

                    console.log("BACKGROUND  event ", e.payload.payload.otherUserId);

                    if (typeof angular == 'object' && e.payload && e.payload.payload && e.payload.payload.otherUserId) {
                        window.location.href = "#/app/chat/" + e.payload.payload.otherUserId;
                    }

                    //$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
                }
            }


            console.log("payload = ", e.payload);

            break;

        case 'error':
            console.log("ERROR = ", e.msg);

            break;

        default:

            break;
    }

}

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {


        //console.log("location cordova", cordova);
        console.log('onDeviceReady facebookConnectPlugin:', facebookConnectPlugin);


        setTimeout(function () {

            angular.bootstrap(document, ['thanxbits']);
        }, 0.1 * 1000);

        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {


        console.log('Received Event: ' + id);
    }
};

//app.initialize();

/*
 profile = {
 address: "1Fq98jGg1iB48HGYgtmVCaX8mkGLgMFAH3",
 createdAt: 1400163368.281,
 id: "641665226",
 username: "elidorbs.thanx.io",
 verificationSeed: "52589452146f911d5cfb",
 verified: true
 };*/

$(document).ready(function () {


    setTimeout(function () {

        if (window.cordova) {
            //  app.initialize();
            app.initialize();

        } else {


            window.fbAsyncInit = function () {
                FB.init({
                    appId: '761433597207088',
                    xfbml: false,
                    version: 'v1.0'
                });

                angular.bootstrap(document, ['thanxbits']);
            };

            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));


        }


        console.log('ready ');


    }, 0.0001 * 1000);


});








