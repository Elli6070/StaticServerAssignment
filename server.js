// Drew Elliott 9/20/2019
// Serves correct types of files: YES, writeData method does this
// Differentiates between pull and post reuests: YES, if(req.method === "post") does this
// post handles sign up
//      - Serializes additional JSON member: NO, I tried to follow a tutorial that edits 
//        JSON files by deserializing, parsing and then adding a property to the new java object,
//        but I had issues getting the syntax to work. The property name having to be the email
//        to match the other members is most likely what I can't get working.
//      - Goes to Join.html after saving member data: NO, I tried to manually make a new
//        GET request for Join.html, but couldn't figure out the syntax.
// Differentiates between content-type without using if-else: YES, I used a switch statment instead
// Deals with race condition: NO, maybe there's a way to remake the writeData method as an async task

// built-in Node.js modules
var fs = require('fs');
var http = require('http');
var path = require('path');

var port = 8000;
var public_dir = path.join(__dirname, 'public');

function NewRequest(req, res)
{
    if (req.method === 'POST')
    {
        let body = '';

        req.on('data', (chunk) =>
        {
            body += chunk.toString(); // convert binary buffer to string
        });
        req.on('end', () =>
        {
            //Deserialize JSON
            var datapath = path.join(public_dir, "data", "members.json");

            jsonReader(datapath, (err, dataObjects) => {
                if (err) {
                    console.log('Error reading file:',err)
                    return
                }

                // add new member property to dataObjects (name is email like the rest)
                var key = body.substring(body.indexOf("email=") + 6, body.indexOf("&gender="));
                dataObjects[key] =
                {
                   fname: body.substring(body.indexOf("fname=") + 6, body.indexOf("&lname=")),
                   lname: body.substring(body.indexOf("lname=") + 6, body.indexOf("&email=")),
                   gender: body.substring(body.indexOf("gender=") + 7, body.indexOf("gender=") + 8),
                   birthday: body.substring(body.indexOf("birthday=") + 9)
                };
         
                fs.writeFile(datapath, JSON.stringify(dataObjects, null, 4), (err) =>
                {
                    if (err) console.log("ERROR");
                });

                //go to sign in window
                req.url = "/join.html";
                req.method = "GET";
                NewRequest(req, res);
            });
        });
        
        res.end();
    }
    else
    {
        var filename = req.url.substring(1);
        if (filename == '') {
            filename = "index.html";
        }

        var fullpath = path.join(public_dir, filename);
        fs.readFile(fullpath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.write('Oh no! Could not find file');
                res.end();
            }
            else {
                WriteData(req, res, fullpath, data);
                res.end();
            }
        });
    }
}

function WriteData(req, res, filepath, data)
{
    switch(path.extname(filepath))
    {
        case (".html"):
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            break;

        case (".jpg"):
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.write(data);
            break;

        case (".js"):
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            res.write(data);
            break;

        case (".css"):
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.write(data);
            break;

        case (".json"):
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(data);
            break;

        case (".png"):
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.write(data);
            break;
    }
}

// from https://medium.com/@osiolabs/read-write-json-files-with-node-js-92d03cc82824
function jsonReader(filePath, cb) {
    fs.readFile(filePath, (err, fileData) => {
        if (err) {
            return cb && cb(err)
        }
        try {
            const object = JSON.parse(fileData)
            return cb && cb(null, object)
        } catch (err) {
            return cb && cb(err)
        }
    })
}

var server = http.createServer(NewRequest);

console.log('Now listening on port ' + port);
server.listen(port, '0.0.0.0');
