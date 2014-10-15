if (!window.cordova) {
// This should override the existing facebookConnectPlugin object created from cordova_plugins.js
    var facebookConnectPlugin = {

            getLoginStatus: function (s, f) {
                // Try will catch errors when SDK has not been init


                try {
                    FB.getLoginStatus(function (response) {

                        s(response);
                    });
                } catch (error) {
                    if (!f) {
                        console.error(error.message);
                    } else {
                        f(error.message);
                    }
                }
            },

            showDialog: function (options, s, f) {

                if (!options.name) {
                    options.name = "";
                }
                if (!options.caption) {
                    options.caption = "";
                }
                if (!options.description) {
                    options.description = "";
                }
                if (!options.link) {
                    options.link = "";
                }
                if (!options.picture) {
                    options.picture = "";
                }
                if (!options.message) {
                    options.message = "";
                }

                // Try will catch errors when SDK has not been init
                try {
                    FB.ui({
                            method: options.method,
                            name: options.name,
                            caption: options.caption,
                            message: options.message,
                            description: (
                                options.description
                                ),
                            link: options.link,
                            picture: options.picture
                        },
                        function (response) {
                            if (response && !response.error_code) {
                                s(response);
                            } else {
                                f(response);
                            }
                        });
                } catch (error) {
                    if (!f) {
                        console.error(error.message);
                    } else {
                        f(error.message);
                    }
                }
            },
// Attach this to a UI element, this requires user interaction.
            login: function (permissions, s, f) {
                // JS SDK takes an object here but the native SDKs use array.
                var permissionObj = {};
                if (permissions && permissions.length > 0) {
                    permissionObj.scope = permissions.toString();
                }

                FB.login(function (response) {
                    if (response.authResponse) {
                        s(response);
                    } else {
                        f(response.status);
                    }
                }, permissionObj);
            },

            getAccessToken: function (s, f) {
                var response = FB.getAccessToken();
                if (!response) {
                    if (!f) {
                        console.error("NO_TOKEN");
                    } else {
                        f("NO_TOKEN");
                    }
                } else {
                    s(response);
                }
            },

            logout: function (s, f) {
                // Try will catch errors when SDK has not been init
                try {
                    FB.logout(function (response) {
                        s(response);
                    })
                } catch (error) {
                    if (!f) {
                        console.error(error.message);
                    } else {
                        f(error.message);
                    }
                }
            },

            api: function (graphPath, permissions, s, f) {
                // JS API does not take additional permissions

                // Try will catch errors when SDK has not been init
                try {
                    FB.api(graphPath, function (response) {

                        console.log("fb.api ", response);

                        if (response.error) {
                            f(response);
                        } else {
                            s(response);
                        }
                    });
                } catch (error) {
                    if (!f) {
                        console.error(error.message);
                    } else {
                        f(error.message);
                    }
                }
            },

// Browser wrapper API ONLY
            browserInit: function (appId, version) {
                if (!version) {
                    version = "v2.0";
                }
                FB.init({
                    appId: appId,
                    xfbml: true,
                    version: "v1.0"
                })
            }
        }
        ;


} else {

    //var exec = require("cordova/exec");

    var facebookConnectPlugin = {

        getLoginStatus: function (s, f) {
            cordova.exec(s, f, "FacebookConnectPlugin", "getLoginStatus", []);
        },

        showDialog: function (options, s, f) {
            cordova.exec(s, f, "FacebookConnectPlugin", "showDialog", [options]);
        },

        login: function (permissions, s, f) {
            console.log("facebookConnectPlugin.js login suc", s);
            console.log("facebookConnectPlugin.js login f", f);
            cordova.exec(s, f, "FacebookConnectPlugin", "login", permissions);
        },

        getAccessToken: function (s, f) {
            cordova.exec(s, f, "FacebookConnectPlugin", "getAccessToken", []);
        },

        logout: function (s, f) {
            cordova.exec(s, f, "FacebookConnectPlugin", "logout", []);
        },

        api: function (graphPath, permissions, s, f) {
            cordova.exec(s, f, "FacebookConnectPlugin", "graphApi", [graphPath, permissions]);
        }
    };

    //module.exports = facebookConnectPlugin;
}