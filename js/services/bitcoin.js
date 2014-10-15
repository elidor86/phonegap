window.app.service('bitcoin', ['$rootScope', '$q', 'Theme', '$http', 'Ddp', 'Analytics', '$location', 'Spinner', function ($rootScope, $q, Theme, $http, Ddp, Analytics, $location, Spinner) {


    $rootScope.validateBbcAddress = function (address) {
        var decoded = base58_decode(address);
        if (decoded.length != 25) return false;

        var cksum = decoded.substr(decoded.length - 4);
        var rest = decoded.substr(0, decoded.length - 4);

        var good_cksum = hex2a(sha256_digest(hex2a(sha256_digest(rest)))).substr(0, 4);

        if (cksum != good_cksum) return false;
        return true;
    };

    function base58_decode(string) {
        var table = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        var table_rev = new Array();

        var i;
        for (i = 0; i < 58; i++) {
            table_rev[table[i]] = int2bigInt(i, 8, 0);
        }

        var l = string.length;
        var long_value = int2bigInt(0, 1, 0);

        var num_58 = int2bigInt(58, 8, 0);

        var c;
        for (i = 0; i < l; i++) {
            c = string[l - i - 1];
            long_value = add(long_value, mult(table_rev[c], pow(num_58, i)));
        }

        var hex = bigInt2str(long_value, 16);

        var str = hex2a(hex);

        var nPad;
        for (nPad = 0; string[nPad] == table[0]; nPad++);

        var output = str;
        if (nPad > 0) output = repeat("\0", nPad) + str;

        return output;
    }

    function hex2a(hex) {
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }

    function a2hex(str) {
        var aHex = "0123456789abcdef";
        var l = str.length;
        var nBuf;
        var strBuf;
        var strOut = "";
        for (var i = 0; i < l; i++) {
            nBuf = str.charCodeAt(i);
            strBuf = aHex[Math.floor(nBuf / 16)];
            strBuf += aHex[nBuf % 16];
            strOut += strBuf;
        }
        return strOut;
    }

    function pow(big, exp) {
        if (exp == 0) return int2bigInt(1, 1, 0);
        var i;
        var newbig = big;
        for (i = 1; i < exp; i++) {
            newbig = mult(newbig, big);
        }

        return newbig;
    }

    function repeat(s, n) {
        var a = [];
        while (a.length < n) {
            a.push(s);
        }
        return a.join('');
    }

    function pad(str, len, ch) {
        var padding = '';
        for (var i = 0; i < len - str.length; i++) {
            padding += ch;
        }
        return padding + str;
    }

    function getEncoded(pt, compressed) {
        var x = pt.getX().toBigInteger();
        var y = pt.getY().toBigInteger();
        var enc = integerToBytes(x, 32);
        if (compressed) {
            if (y.isEven()) {
                enc.unshift(0x02);
            } else {
                enc.unshift(0x03);
            }
        } else {
            enc.unshift(0x04);
            enc = enc.concat(integerToBytes(y, 32));
        }
        return enc;
    }

    var getPK = function () {
        var PRIVATE_KEY_VERSION = 0x80;
        var gen_compressed = null;

        var hash = Crypto.SHA256($rootScope.pk, { asBytes: true });
        hash = Crypto.util.bytesToHex(hash);


        var hash_str = pad(hash);
        var hash = Crypto.util.hexToBytes(hash_str);
        eckey = new Bitcoinjs.ECKey(hash);
        gen_eckey = eckey;


        var curve = getSECCurveByName("secp256k1");
        gen_pt = curve.getG().multiply(eckey.priv);
        gen_eckey.pub = getEncoded(gen_pt, gen_compressed);
        gen_eckey.pubKeyHash = Bitcoinjs.Util.sha256ripe160(gen_eckey.pub);


        var eckey = gen_eckey;


        var payload = hash;

        /*
         if (compressed)
         payload.push(0x01);*/

        var sec = new Bitcoinjs.Address(payload);
        sec.version = PRIVATE_KEY_VERSION;

        return $('<input type="text">').val(sec).val();
        console.log("sec!!!!!!!!!! ", $('<input type="text">').val(sec).val());
    };

    $rootScope.bitcoinLogin = function (pw, callback, errback) {

        Analytics.clickTrack({
            eventCategory: "bitcoin",
            eventAction: "bitcoinLogin"

        });

        var key = new Bitcoin.Key(Bitcoin.Crypto.SHA256($rootScope.user.seed + pw)),
            address = key.getBitcoinAddress().toString();

        var success = function () {
            $rootScope.key = key;
            $rootScope.pk = $rootScope.user.seed + pw;
            $rootScope.user.address = address;

            getPK();
            if (callback) callback();
        };

        var fail = errback || $rootScope.errHandle;

        if ($rootScope.user && $rootScope.user.address) {
            if (address == $rootScope.user.address) success();
            else fail();
        } else if ($rootScope.user) {

            // console.log("submitaddress");
            $http.post(baseAppUrl + '/submitaddress', {
                accessToken: access_token,
                address: address
            })
                .success(success)
                .error(fail);
        } else $rootScope.errHandle("not logged in");
    };


    $rootScope.checkBitcoinLoggedIn = function (callback) {
        if (!$rootScope.user)
            return;
        if ($rootScope.key)
            return callback();
        var fields = {
            'password': {
                type: 'password'
            }
        };
        if (!$rootScope.user.address)
            fields.confirm = {
                type: 'password'
            };

        Theme.showSigninModal(function () {

            if (!$rootScope.user.address) {
                $rootScope.message.body = 'passwords don\'t match, please try again';
            } else {
                $rootScope.bitcoinLogin(Theme.modalFields.password, function () {
                    $rootScope.message = null;
                    if (callback) callback();
                }, function (e) {
                    console.log("bitcoinLogin error", e);

                    Theme.showNotificationModal('wrong password');
                });
            }


        });
        /*
         $rootScope.message = {
         body: 'please enter password',
         fields: fields,
         canceltext: 'no thanx',
         action: function () {

         },
         actiontext: 'log me in'
         };*/
    };


    $rootScope.bitcoinSend = function (userWalletAddr, satoshis, fee, message, requestId, cb) {

        Analytics.clickTrack({
            eventCategory: "bitcoin",
            eventAction: "bitcoinSend",
            eventLabel: satoshis

        });

        function sendToUser(user) {
            if (!user) return cb('user not found');
            if (!user.address) return cb('getter has no address');


            Theme.showConfirmModal('send ' + satoshis + ' satoshi to ' + user.username + '? a transaction fee of ' + fee + ' satoshi will be added', function () {
                try {
                    $rootScope.rawSend(user.address, satoshis, fee, '/sendbtc', {
                        to: user.username,
                        message: message,
                        requestId: requestId
                    }, function (item) {
                        $rootScope.message = {};
                        // $rootScope.$broadcast('updateRequest', item);


                        // cb(err);
                    });
                } catch (e) {
                    cb(e.toString());
                }
            });

            /*
             $rootScope.message = {
             body: 'send ' + satoshis + ' satoshi to ' + user.username + '? a transaction fee of ' + fee + ' satoshi will be added',
             action: function () {
             try {
             $rootScope.rawSend(user.address, satoshis, fee, '/sendbtc', {
             to: user.username,
             message: message,
             requestId: requestId
             }, function (item) {
             $rootScope.message = {};
             $rootScope.$broadcast('updateRequest', item);


             // cb(err);
             });
             } catch (e) {
             cb(e.toString());
             }
             },
             actiontext: 'yep',
             canceltext: 'nope'
             };*/
        }

        if (!fee) fee = 10000;
        satoshis = Math.ceil(satoshis);
        if (!$rootScope.key) {
            $rootScope.checkBitcoinLoggedIn(function () {
                $rootScope.bitcoinSend(userWalletAddr, satoshis, fee, message, requestId, cb);
            });
        } else if (!userWalletAddr) {
            cb('giving satoshi to whom?');
        } else if (satoshis < 5430) {
            cb('must send at least 5430 satoshis');
        } else if ($rootScope.balance < satoshis + fee) {
            cb('not enough balance! this transaction have extra fee :' + fee);
        } else if (userWalletAddr.indexOf('.') >= 0) {
            $http.get(baseAppUrl + '/user?username=' + encodeURIComponent(userWalletAddr))
                .success(sendToUser)
                .error(cb);
        } else if (/^[0-9]+$/.test(userWalletAddr)) {
            $http.get(baseAppUrl + '/user?userId=' + encodeURIComponent(userWalletAddr))
                .success(sendToUser)
                .error(cb);
        } else try {
            $rootScope.rawSend(userWalletAddr, satoshis, fee, '/sendbtc', {
                message: message,
                to: userWalletAddr,
                requestId: requestId
            }, function (item) {
                if (typeof item == "object") {
                    // $rootScope.$broadcast('updateRequest', item);
                } else {
                    cb(item);
                }

            });
        } catch (e) {
            $rootScope.message.body = e.toString();
        }
    };


    /*
     var gentx = function (address, satoshis, fee) {
     var utxo = get_enough_utxo_from_history($rootScope.txouts, satoshis + fee);
     console.log(" satoshis + fee", satoshis + fee);
     console.log("$rootScope.txouts", $rootScope.txouts);
     console.log("utxo", utxo);

     var needsplit = Object.keys($rootScope.txouts).length < 5 ? 1 : 2,
     change = _.range(needsplit).map(function (x) {
     return $rootScope.user.address;
     }),

     tx = make_sending_transaction(utxo,
     address,
     satoshis,
     change,
     fee,
     $rootScope.key);

     return tx;
     };*/

    var bitcore = require('bitcore');

    var satToBtc = function (sat) {
        sat = parseInt(sat);
        return sat * 0.00000001;
    };

    var btcToSat = function (btc) {
        btc = parseFloat(btc);
        return btc / 0.00000001;
    };

    $rootScope.getUTO = function (cb) {
        jQuery.ajax({

            url: 'https://chain.so/api/v2/get_tx_unspent/BTC/' + $rootScope.user.address,
            //url: 'https://api.biteasy.com/blockchain/v1/addresses/' + $rootScope.user.address + '/unspent-outputs?per_page=200',
            //url: 'https://mainnet.helloblock.io/v1/addresses/1PmzajjJtrsiJh6jQ7X58fvLdNAt8FVaui/unspents?limit=100',
            type: "GET",
            crossDomain: true,
            dataType: "json",
            success: function (h) {
                var unspent = [];
                if (h && h.data && h.data.txs) {
                    unspent = h.data.txs.map(function (item) {
                        return {
                            "address": profile.address,
                            "scriptPubKey": item.script_hex,
                            "txid": item.txid,
                            "vout": item.output_no,
                            "amount": item.value, //satToBtc(item.value),
                            "confirmations": item.confirmations
                        }
                    })

                }

                console.log("unspent ", unspent);
                cb(unspent);
            },
            error: function (xhr, status) {
                console.log("status", status);
                console.log("xhr", xhr);
                cb({error: true});
            }

        });

    };

    var gentx = function (address, satoshis, fee) {

        var deferred = $q.defer();

        $rootScope.getUTO(function (res) {

            if (res.error) {
                deferred.reject();
                $rootScope.$safeApply();
                return;
            }

            var Builder = bitcore.TransactionBuilder;
            var opts = {
                spendUnconfirmed: true
            };

            var outs = [
                {
                    address: address,
                    amount: satToBtc(satoshis)
                }
            ];

            var tx = new Builder(opts)
                .setUnspent(res)
                .setOutputs(outs)
                .sign([getPK()])
                .build();

            TXTOBJ = tx;
            deferred.resolve(tx.serialize().toString('hex'));
            $rootScope.$safeApply();

        });


        return deferred.promise;
    };

    var processtx = function (tx) {
        var txhash = tx.getHash();
        for (var i = 0; i < tx.outs.length; i++) {
            if (tx.outs[i].address == $rootScope.user.address) {
                $rootScope.txouts[txhash + ':' + i] = {
                    output: txhash + ':' + i,
                    value: tx.outs[i].value,
                    timestamp: new Date().getTime() / 1000,
                    pending: true
                };
            }
        }
        for (i = 0; i < tx.ins.length; i++) {
            var op = tx.ins[i].outpoint;
            var o = $rootScope.txouts[op.hash + ':' + op.index];
            if (o) {
                o.spend = true;
                o.timestamp = new Date().getTime() / 1000;
            }
        }
    };

    /*
     $rootScope.rawSend = function (address, satoshis, fee, url, aux, callback) {
     var tx = gentx(address, satoshis, fee);
     $http.post(baseAppUrl + url, _.extend(aux, {
     accessToken: access_token,
     tx: tx.serializeHex()
     }))
     .success(function (r) {
     processtx(tx);
     callback(r);
     })
     .error(callback);
     };*/

    $rootScope.rawSend = function (address, satoshis, fee, url, aux, callback) {

        gentx(address, satoshis, fee).then(function (tx) {
            $http.post(baseAppUrl + url, _.extend(aux, {
                accessToken: access_token,
                tx: tx
            }))
                .success(function (r) {
                    // processtx(tx);
                    callback(r);
                })
                .error(callback);
        });

    };


    $rootScope.getSerializedTx = function (address, satoshis, fee) {
        var tx = gentx(address, satoshis, fee);
        return tx.serializeHex();
    };


    $rootScope.txouts = {};

    $rootScope.gettxouts = function (callback) {
        if (!$rootScope.user || !$rootScope.user.address) {
            return;
        }

        //console.log("gettxouts");
        jQuery.ajax({

            url: 'https://mainnet.helloblock.io/v1/addresses/' + $rootScope.user.address + '/unspents?limit=100',
            //url: 'https://mainnet.helloblock.io/v1/addresses/1PmzajjJtrsiJh6jQ7X58fvLdNAt8FVaui/unspents?limit=100',
            type: "GET",
            crossDomain: true,
            dataType: "json",
            success: function (h) {
                //   console.log("response", h);
                $rootScope.balance = 0;
                $rootScope.txouts = {};
                var unspent_outputs = h.data.unspents;

                //  console.log("h", h);
                //    console.log("unspent_outputs ", unspent_outputs);

                for (var i = 0; i < unspent_outputs.length; i++) {


                    var o = unspent_outputs[i];
                    var key = o.txHash + ':' + o.index;
                    //console.log("key ", key);
                    //console.log("$rootScope.txouts ", $rootScope.txouts);
                    if (!$rootScope.txouts[key]) {

                        var hitem = {
                            address: o.txHash,
                            output: key,
                            value: o.value,
                            confirmations: o.confirmations
                        };

                        $rootScope.txouts[key] = hitem;
                    }
                }


                for (var v in $rootScope.txouts) {
                    var out = $rootScope.txouts[v];
                    // console.log("out ", out);
                    $rootScope.balance += out.value;
                }


            },
            error: function (xhr, status) {
                console.log("status", status);
                console.log("xhr", xhr);
            }

        });


        /*
         $http.post('/addressoutputs', {
         address: $rootScope.user.address
         })
         .success(function (h) {
         //  console.log("h", h);

         h.map(function (hitem) {
         if (!$rootScope.txouts[hitem.output]) {
         $rootScope.txouts[hitem.output] = hitem;
         }
         if ($rootScope.txouts[hitem.output].pending)
         $rootScope.txouts[hitem.output].pending = false;
         });
         var curtime = new Date().getTime() / 1000;
         $rootScope.balance = 0;
         $rootScope.unconfirmed = 0;
         for (var v in $rootScope.txouts) {
         var out = $rootScope.txouts[v];
         if (!out.pending && !out.spend) $rootScope.balance += out.value;
         if (out.pending) $rootScope.unconfirmed += out.value;
         if (out.timestamp && out.timestamp < curtime - 600) {
         delete $rootScope.txouts[v];
         }
         }
         if (callback) callback();

         });
         */

    };

    $rootScope.getBitcoinBalance = function (callback) {
        if (!$rootScope.user || !$rootScope.user.address) {
            return;
        }

        //console.log("gettxouts");
        jQuery.ajax({

            url: 'https://chain.so/api/v2/get_address_balance/BTC/' + $rootScope.user.address,
            //url: 'http://www.corsproxy.com/blockchain.info/address/' + $rootScope.user.address + '?format=json&limit=1',
            // url: 'https://api.biteasy.com/blockchain/v1/addresses/' + $rootScope.user.address,
            //url: 'https://mainnet.helloblock.io/v1/addresses/1PmzajjJtrsiJh6jQ7X58fvLdNAt8FVaui/unspents?limit=100',
            type: "GET",
            crossDomain: true,
            dataType: "json",
            success: function (h) {
                //   console.log("h.final_balance ", h.data.confirmed_balance);
                $rootScope.balance = parseInt(btcToSat(h.data.confirmed_balance) + btcToSat(h.data.unconfirmed_balance));
               // $rootScope.balance = parseInt(btcToSat(parseFloat(h.data.confirmed_balance) + parseFloat(h.data.unconfirmed_balance)));
                $rootScope.$safeApply();
            },
            error: function (xhr, status) {
                console.log("status", status);
                console.log("xhr", xhr);
            }

        });


        /*
         $http.post('/addressoutputs', {
         address: $rootScope.user.address
         })
         .success(function (h) {
         //  console.log("h", h);

         h.map(function (hitem) {
         if (!$rootScope.txouts[hitem.output]) {
         $rootScope.txouts[hitem.output] = hitem;
         }
         if ($rootScope.txouts[hitem.output].pending)
         $rootScope.txouts[hitem.output].pending = false;
         });
         var curtime = new Date().getTime() / 1000;
         $rootScope.balance = 0;
         $rootScope.unconfirmed = 0;
         for (var v in $rootScope.txouts) {
         var out = $rootScope.txouts[v];
         if (!out.pending && !out.spend) $rootScope.balance += out.value;
         if (out.pending) $rootScope.unconfirmed += out.value;
         if (out.timestamp && out.timestamp < curtime - 600) {
         delete $rootScope.txouts[v];
         }
         }
         if (callback) callback();

         });
         */

    };

    /*
     setInterval($rootScope.gettxouts, 1000 * 10);
     $rootScope.gettxouts();*/

    setInterval($rootScope.getBitcoinBalance, 1000 * 3);
    $rootScope.getBitcoinBalance();


    $rootScope.buyTnx = function (amount, callback) {
        if (!parseInt(amount)) return;
        $rootScope.checkBitcoinLoggedIn(function () {
            if ($rootScope.balance === null) {
                $rootScope.message = {
                    body: 'getting balance',
                    canceltext: 'cool thanx'
                };
                $rootScope.gettxouts(function () {
                    $scope.buyTnx(amount);
                });
            }
            if ($rootScope.balance < amount + 10000) {
                return $rootScope.errHandle('not enough funds');
            }
            Spinner.start();
            $http.get(baseAppUrl + '/thanxaddress')
                .success(function (r) {
                    $rootScope.rawSend(r.address, amount, 10000, '/buytnx', {}, function () {
                        Spinner.complete();
                        $location.path("/app/chat/123456thanx");
                        $rootScope.$safeApply();
                        //$rootScope.user.tnx += amount;
                        //callback();
                    });
                });
        });
    };

    $rootScope.thanxSend = function (username, userWalletAddr, tnx, request, message, txType, successCB) {


        var body;
        if ($rootScope.user.tnx >= tnx) {
            body = 'send ' + tnx + ' thanx to ' + username + '?';
            $rootScope.confirmDialog(body, function () {
                $http.post(baseAppUrl + '/sendtnx', {
                    tnx: tnx,
                    accessToken: access_token,
                    to: userWalletAddr,
                    request: request ? request.id : null,
                    txType: txType,
                    message: message || ((request && request.message) ? 'Re: ' + request.message : '')
                })
                    .success(function (r) {
                        $rootScope.$broadcast('updateRequest', r);
                        $rootScope.message = {};
                        $rootScope.user.tnx -= tnx;
                        if (successCB) {
                            successCB();
                        }
                    })
                    .error(function (e) {
                        $rootScope.message = {
                            body: 'failed sending ' + tnx + ' to user ' + userWalletAddr + ' error: ' + e,
                            canceltext: 'close'
                        };
                    });

            });
            return;
        }
        var shortfall = Math.max(10000, tnx - $rootScope.user.tnx);
        if ($rootScope.balance >= shortfall + 10000) {
            body = 'you don\'t have enough thanx to give this many, but you certainly can convert some satoshi. do it now?';
            $rootScope.confirmDialog(body, function () {
                $rootScope.buyTnx(shortfall, function () {
                    $rootScope.thanxSend(userWalletAddr, tnx, request, message, txType, successCB);
                });
            });
        } else {
            $rootScope.errHandle('you don\' have enough thanx or satoshi to give');
        }
    };

    $rootScope.checkBitcoinData = function () {
        /*
         var promise = Ddp.call('getPrice');

         promise.then(function (price) {
         //  console.log("price", price);
         $rootScope.price = price;
         });
         */
        //
    };
    setInterval($rootScope.checkBitcoinData, 60000);
    $rootScope.checkBitcoinData();
}]);