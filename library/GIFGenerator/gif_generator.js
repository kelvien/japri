var fs = require("fs");
var GIFEncoder = require("gifencoder");
var pngFileStream = require("png-file-stream");
  
var dimensionX = process.argv[2];
var dimensionY = process.argv[3];
var framesPath = process.argv[4];
var destinationPath = process.argv[5];

var encoder = new GIFEncoder(dimensionX, dimensionY);
pngFileStream(framesPath)
  .pipe(encoder.createWriteStream({ repeat: 0, delay: 500, quality: 5 }))
  .pipe(fs.createWriteStream(destinationPath));