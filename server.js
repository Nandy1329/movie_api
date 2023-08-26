let http = require("http");
fs = require("fs");
url = require("url");
// Create a server object
http.createServer((request, response) => {
  let addr = request.url,
    q = url.parse(addr, true),
    filePath = "";
  // Check if the request is for the home page
  fs.appendFile(
    "log.txt",
    "URL: " + addr + "\nTimestamp: " + new Date() + "\n\n",
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Added to log.");
      }
    }
  );
  // Check if the request is for the home page
  if (q.pathname.includes("documentation")) {
    filePath = __dirname + "/documentation.html";
  } else {
    filePath = "index.html";
  }
  // Send the requested file

  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;
    }
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(data);
    response.end();
  })
    // Listen for requests on port 8080
    .listen(8080);
  console.log("My first Node test server is running on Port 8080.");
});
