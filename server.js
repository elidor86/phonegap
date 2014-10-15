var http = require('http');
var fs = require('fs');


var static = require('/usr/local/lib/node_modules/node-static');

//
// Create a node-static server instance to serve the './public' folder
//
var file = new static.Server('/Users/Elidor/Dropbox/Elidor Ben Simon - Ofir Dotan/thanx_io_new/thanxio/www');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(7900);


