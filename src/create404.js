var fs = require("fs");

let read = fs.createReadStream("dist/civis/index.html");
let write = fs.createWriteStream("dist/civis/404.html");

read.pipe(write);
