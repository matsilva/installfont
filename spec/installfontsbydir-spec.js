var installfont = require('../lib/installfont');
var path = require('path');
var assert = require("assert");
var fs = require('fs');

describe('Install all fonts in specified directory', function(){
  it('should install fonts and leave fonts in original directory', function(done){
    this.timeout(10000);
    if(!fs.existsSync('./spec/temp-fonts-1')) fs.mkdirSync('./spec/temp-fonts-1');
    var tempFiles = [];
    var tempFilesByName =[];
    var fontDir = fs.readdirSync('./spec/spec-fonts');

    console.log(fontDir)
    for (var i = 0; i < fontDir.length; i++) {
      tempFiles.push(path.join('./spec/temp-fonts-1', fontDir[i]));
      tempFilesByName.push(fontDir[i]);
      fs.createReadStream(path.join('./spec/spec-fonts', fontDir[i])).pipe(fs.createWriteStream(path.join('./spec/temp-fonts-1', fontDir[i])))
    }

    installfont('./spec/temp-fonts-1', function(err){
      if(err) console.log(err, err.stack)
        for(var i = 0; i < tempFiles.length; i++){
            assert.equal(true, fs.existsSync(tempFiles[i]))
        }
        for(var i = 0; i < tempFilesByName.length; i++){
            assert.equal(true, fs.existsSync(path.join('c:/Windows/Fonts', tempFilesByName[i])));
        }
        done();
    })


  })
})
