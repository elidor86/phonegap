window.fbAsyncInit = function () {
    // init the FB JS SDK

    console.log("fb is ready");

    FB.init({
        appId: '761433597207088',                    // App ID from the app dashboard
        channelUrl: 'https://bitcoinnect.me/channel.html', // Channel file for x-domain comms
        status: true,                                 // Check Facebook Login status
        xfbml: true                                  // Look for social plugins on the page
    });

    FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {


        } else if (response.status === 'not_authorized') {

        } else {

        }
    });


    // Additional initialization code such as adding Event Listeners goes here
};
console.log("facebook start");
// Load the SDK asynchronously
(function () {
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=761433597207088";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'))
}());

