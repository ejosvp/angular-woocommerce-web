(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('auth', auth);

    /** @ngInject */
    function auth($rootScope, $http, $q, WORDPRESS_API_URL, LOGIN_ROLES, USER_ROLE) {

        var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=0;var c1=0; var c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);var c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

        var service = {
            USER_ROLE: USER_ROLE,
            getUser: getUser,
            login: doLogin,
            logout: logOut,
            userIsLoggedIn: userIsLoggedIn,
            userHasRole: userHasRole,
            isCurrentUser: isCurrentUser
        };

        function validateAuth(user) {
            var deferred = $q.defer();
            $http.jsonp(WORDPRESS_API_URL + 'user/validate_auth_cookie/' +
                    '?cookie=' + user.cookie +
                    '&callback=JSON_CALLBACK')
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function doLogin(user) {
            var deferred = $q.defer(),
                nonce_dfd = $q.defer();

            requestNonce("user", "generate_auth_cookie")
                .then(function (nonce) {
                    nonce_dfd.resolve(nonce);
                });

            nonce_dfd.promise.then(function (nonce) {
                //now that we have the nonce, ask for the new cookie
                generateAuthCookie(user.username, user.password, nonce)
                    .then(function (data) {
                        if (data.status == "error") {
                            // return error message
                            deferred.reject(data.error);
                        } else {
                            var user = {
                                cookie: data.cookie,
                                data: data.user,
                                user_id: data.user.id
                            };

                            // check if is a valid user
                            var unauthorized = true;
                            for (var i = 0; i < LOGIN_ROLES.length && unauthorized; i++) {
                                if (LOGIN_ROLES[i] in user.data.capabilities &&
                                    user.data.capabilities[LOGIN_ROLES[i]]) {
                                    unauthorized = false;
                                    break;
                                }
                            }

                            if (unauthorized) {
                                deferred.reject('Unauthorized User');
                                return;
                            }

                            // store the user's cookie in the local storage
                            saveUser(user);

                            deferred.resolve(user);
                        }
                    });
            });
            return deferred.promise;
        }

        function doRegister(user) {
            var deferred = $q.defer(),
                nonce_dfd = $q.defer();

            requestNonce("user", "register")
                .then(function (nonce) {
                    nonce_dfd.resolve(nonce);
                });

            nonce_dfd.promise.then(function (nonce) {
                registerUser(user.username, user.email,
                    user.displayName, user.password, nonce)
                    .then(function (data) {
                        if (data.status == "error") {
                            // return error message
                            deferred.reject(data.error);
                        } else {
                            // in order to get all user data we need to call this function
                            // because the register does not provide user data
                            doLogin(user).then(function () {
                                deferred.resolve(user);
                            });
                        }
                    });
            });

            return deferred.promise;
        }

        function requestNonce(controller, method) {
            var deferred = $q.defer();
            $http.jsonp(WORDPRESS_API_URL + 'get_nonce/' +
                    '?controller=' + controller +
                    '&method=' + method +
                    '&callback=JSON_CALLBACK')
                .success(function (data) {
                    deferred.resolve(data.nonce);
                })
                .error(function (data) {
                    deferred.reject(data.nonce);
                });
            return deferred.promise;
        }

        function doForgotPassword(username) {
            var deferred = $q.defer();
            $http.jsonp(WORDPRESS_API_URL + 'user/retrieve_password/' +
                    '?user_login=' + username +
                    '&callback=JSON_CALLBACK')
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function generateAuthCookie(username, password, nonce) {
            var deferred = $q.defer();
            $http.jsonp(WORDPRESS_API_URL + 'user/generate_auth_cookie/' +
                    '?username=' + username +
                    '&password=' + password +
                    '&nonce=' + nonce +
                    '&callback=JSON_CALLBACK')
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function saveUser(user) {
            window.localStorage.user = JSON.stringify(user);
            var keys = Base64.encode(user.data.ck + ':' + user.data.cs);
            window.localStorage.wc_keys = JSON.stringify(keys);
        }

        function getUser() {
            var rawdata = false,
                data = false,
                rawcookie = false,
                cookie = false;
            if (
                (rawdata = window.localStorage.user) && (data = JSON.parse(rawdata)) &&
                (rawcookie = window.localStorage.user) && (cookie = JSON.parse(rawdata))
            ) {
                return {
                    data: data.data,
                    cookie: cookie.cookie
                };
            }

            return false;
        }

        function userHasRole(roles) {
            var user = getUser();

            var access = false;

            if (user.data) {
                if (!Array.isArray(roles)) {
                    roles = [roles];
                }

                angular.forEach(roles, function (role) {
                    if (user.data && role in user.data.capabilities) {
                        access = access || user.data.capabilities[role];
                    }
                });
            }

            return access;
        }

        function registerUser(username, email, displayName, password, nonce) {
            var deferred = $q.defer();
            $http.jsonp(WORDPRESS_API_URL + 'user/register/' +
                    '?username=' + username +
                    '&email=' + email +
                    '&display_name=' + displayName +
                    '&user_pass=' + password +
                    '&nonce=' + nonce +
                    '&callback=JSON_CALLBACK')
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function userIsLoggedIn() {
            var deferred = $q.defer();

            var user = JSON.parse(window.localStorage.user || null);
            if (user !== null && user.cookie !== null) {
                validateAuth(user).then(function (data) {
                    deferred.resolve(data.valid);
                });
            }
            else {
                deferred.resolve(false);
            }
            return deferred.promise;
        }

        function logOut() {
            //empty user data

            window.localStorage.user = null;
            window.localStorage.wc_keys = null;
        }
        
        function isCurrentUser(user_id) {
            var user = service.getUser();

            return user.data.id == user_id
        }
        
        return service;
    }

})();