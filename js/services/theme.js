window.app.service('Theme', ['$rootScope', '$timeout', '$location', function ($rootScope, $timeout, $location) {

    var theme = {};

    var header = jQuery('.header');

    var isHeaderVisible = false;

    theme.isConnectVisible = false;
    theme.isTopBarVisible = false;


    theme.headerLeftState = null;
    theme.headerRightState = null;
    theme.headerCenterState = 'balance';

    theme.isModalVisible = false;
    theme.modalUrl = 'partials/modals/confirm.html';

    theme.confirmText = 'are you sure?';

    theme.headerText = "";

    theme.confirmCb = null;
    theme.cancelCb = null;
    theme.modalFields = {};
    theme.otherUserId = '';

    theme.balanceUnits = 'tnx';

    theme.searchText = '';
    theme.otherUser = null;


    theme.headerSrc = null;


    theme.topBarMsg = null;

    var OtherUserId = null;

    theme.closeTopBar = function () {
        theme.isTopBarVisible = false;
        theme.topBarMsg = null;
        OtherUserId = null;
        $rootScope.$safeApply();
    };

    theme.showTopBar = function (msg, id) {

        if ($location.path().search(id) != -1) {
            return;
        }

        theme.topBarMsg = msg;
        OtherUserId = id;
        theme.isTopBarVisible = true;

        $timeout(function () {
            theme.closeTopBar();
        }, 1000 * 3);
        $rootScope.$safeApply();
    };

    var invalid = function () {
        theme.searchText = "invalid qr code";

        $timeout(function () {
            theme.searchText = "";
        }, 3000);
        $rootScope.$safeApply();
    };


    theme.setImg = function () {
        console.log("setImg");
        // jQuery('#qrcode').click();


        // var scanner = cordova.require("com.phonegap.plugins.barcodescanner.barcodescanner");

        var btcAddressRegex = /^[13][1-9A-HJ-NP-Za-km-z]{26,33}/;

        cordova.plugins.barcodeScanner.scan(
            function (result) {

                result = result.text;

                console.log("res ", result);


                if (btcAddressRegex.test(result)) {
                    theme.searchText = result;
                    $rootScope.$safeApply();
                    return;
                }

                var uri = new URIBitcoin(result);
                console.log('uri ', uri);

                if (uri.scheme != 'bitcoin') {
                    invalid();
                    return;
                }


                var address = uri.authority ? uri.authority : uri.path;
                var q = uri.query_form();
                if (q && q.amount) {
                    theme.qrAmount = q.amount;
                }
                if (address && btcAddressRegex.test(address)) {
                    console.log("address ", address);
                    theme.searchText = address;
                    $rootScope.goTo("btc/" + address);
                    $rootScope.$safeApply();
                    return;
                }

                invalid();


                /*
                 alert("We got a barcode\n" +
                 "Result: " + result.text + "\n" +
                 "Format: " + result.format + "\n" +
                 "Cancelled: " + result.cancelled);*/
            },
            function (error) {
                alert("Scanning failed: " + error);
            }
        );
    };

    theme.goToOtherUser = function () {
        if (!OtherUserId)
            return;


        $rootScope.goTo("chat/" + OtherUserId);
        theme.closeTopBar();
        $rootScope.$safeApply();
        //window.location.href = "#/app/chat/" + OtherUserId;

    };

    theme.getDisplayName = function () {

        var start_and_end = function (str) {
            if (str && str.length > 20) {
                return str.substr(0, 4) + '...' + str.substr(str.length - 4, str.length);
            }
            return str;
        };


        // console.log("getDisplayName");
        if (theme.otherUser.isAddress) {
            return start_and_end(theme.otherUser.id);
        } else {
            //console.log("theme.otherUser ", theme.otherUser);
            return theme.otherUser.first_name ? theme.otherUser.first_name.toLowerCase() : "";
        }
    };

    theme.setHeaderSrc = function (src) {

        console.log("setHeaderSrc src", src);
        theme.headerSrc = 'partials/header/' + src + '.html';

    };


    theme.getBalance = function () {

        if (theme.balanceUnits == 'tnx') {
            return $rootScope.user ? $rootScope.user.tnx : '0';
        } else {
            return $rootScope.balance;
        }

    };

    theme.setBalanceUnits = function (units) {

        // theme.balanceUnits = units;
        if (units) {
            theme.balanceUnits = units;
            return;
        }
        theme.balanceUnits == 'sat' ? theme.balanceUnits = 'tnx' : theme.balanceUnits = 'sat';

    };

    theme.confirmModalBtn = function (s, f) {

        theme.isModalVisible = false;
        if (theme.confirmCb)
            theme.confirmCb();


        theme.modalFields = {};
    };

    theme.cancelModalBtn = function (s, f) {
        theme.isModalVisible = false;
        if (theme.cancelCb)
            theme.cancelCb();
        theme.modalFields = {};
    };
    theme.hideModal = function () {
        theme.isModalVisible = false;
        theme.modalUrl = "";
    };

    theme.showConfirmModal = function (text, s, f) {
        theme.confirmText = text;
        theme.confirmCb = s;
        theme.cancelCb = f;
        theme.isModalVisible = true;
        theme.modalUrl = 'partials/modals/confirm.html';
    };

    theme.showSigninModal = function (s, f) {
        theme.confirmCb = s;
        theme.cancelCb = f;
        theme.isModalVisible = true;
        theme.modalUrl = 'partials/modals/signin.html';
    };

    theme.showNewAdressModal = function (s, f) {
        theme.confirmCb = s;
        theme.cancelCb = f;
        theme.isModalVisible = true;
        theme.modalUrl = 'partials/modals/new_adress.html';
    };

    theme.showNotificationModal = function (text) {
        theme.notificationText = text;
        theme.modalUrl = 'partials/modals/notification.html';
        theme.isModalVisible = true;
    };

    theme.showFaqModal = function () {
        theme.modalUrl = 'partials/modals/faq.html';
        theme.isModalVisible = true;
    };

    theme.setModalUrl = function (url) {
        theme.modalUrl = 'partials/modals/' + url + '.html';
    };

    theme.setHeaderCenterState = function (state) {
        theme.headerCenterState = state;
    };

    theme.setHeaderText = function (txt) {
        theme.headerText = txt;
    };

    theme.showConnect = function () {

        //theme.setHeaderText('tap the person to select');
        // teme.setHeaderCenterState('connect');
        // theme.headerRightState = 'selectAll';
        // theme.headerLeftState = 'invite';
        // theme.setHeaderSrc("connect");
        theme.isConnectVisible = true;

    };

    theme.hideConnect = function () {
        // theme.headerRightState = null;
        // theme.headerLeftState = null;
        /// theme.setHeaderCenterState(null);
        theme.setHeaderSrc("conversations");
        theme.isConnectVisible = false;
    };

    theme.showHeader = function () {

        // console.log("showHeader", jQuery('.header').length);
        jQuery('.header').css({
            "-webkit-transform": 'translate3d(0,14rem,0)'
        });

        isHeaderVisible = true;

    };

    theme.hideHeader = function () {

        jQuery('.header').css({
            "-webkit-transform": 'translate3d(0px,0,0)'
        });

        isHeaderVisible = false;

    };


    return theme;

}]);