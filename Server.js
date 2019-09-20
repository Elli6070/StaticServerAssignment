// Built in Node.js modules
var fs = require("fs");
var http = require("http");
var path = require("path");

var port = 8000;
var public_dir = path.join(__dirname, "\\Public");

//req = object with request info
//res = where the response is sent to
function NewRequest(req, res)
{
    // req.url is whatever is after localhost:8000
    console.log("Received request from " + req.url);

    var filename = req.url.substring(1); // '/' isn't in filename

    // if no specific request is made, assume the request is for index.html
    if(filename == '')
    {
        filename = "index.html";
    }
    //get full filepath for index.html
    var fullpath = path.join(public_dir, filename);
    //read filepath with success/exception callback function
    fs.readFile(fullpath, (err, data) => 
    {
        //if err is null, it will be false, and true if err isn't null
        if(err)
        {
            // send error response, 404 means file not found
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.write("File Not Found");
            res.end();
        }
        else
        {
            // 200 means success, write index.html as html text
            res.writeHead(200, { "content-Type": "Text/html" });
            res.write(data);
            res.end();
        }
    });
}

// parameter is callback function that gets triggered whenever a request is received
var server = http.createServer(NewRequest);

console.log("Now Listening for requests");

//0.0.0.0 is a special ip address that means all ip addresses on this machine (wifi, ethernet, self-referential)
server.listen(port, "0.0.0.0");