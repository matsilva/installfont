var installfont = require('../lib/installfont');
var path = require('path');
var assert = require("assert");
var fs = require('fs');
var os          = require('os');
var platform    = os.platform();
var sysFontDir  = 'c:/Windows/Fonts';

if(platform.toLowerCase().indexOf('darwin') != -1) sysFontDir = '/Library/Fonts';

if(platform.toLowerCase().indexOf('linux') != -1) {
    sysFontDir = '/usr/share/fonts';
    ttfDir = path.join(sysFontDir, 'truetype');
    otfDir = path.join(sysFontDir, 'opentype');
    if(!fs.existsSync(ttfDir)) fs.mkdirSync(ttfDir);
    if(!fs.existsSync(otfDir)) fs.mkdirSync(otfDir);
}

describe('Try Install all fonts in specified directory that already exist with opts param', function(){
  it('should return err object in callback and delete fonts in original directory', function(done){
    this.timeout(0);
    if(!fs.existsSync('./spec/temp-fonts-2')) fs.mkdirSync('./spec/temp-fonts-2');
    var tempFiles = [];
    var tempFilesByName =[];
    var fontDir = fs.readdirSync('./spec/spec-fonts2');

    for (var i = 0; i < fontDir.length; i++) {
      tempFiles.push(path.join('./spec/temp-fonts-2', fontDir[i]));
      tempFilesByName.push(fontDir[i]);
      fs.createReadStream(path.join('./spec/spec-fonts2', fontDir[i])).pipe(fs.createWriteStream(path.join('./spec/temp-fonts-2', fontDir[i])));
    }
    var opts = {};
    opts.removeFonts = true;
    installfont('./spec/temp-fonts-2', function(err){
      //if(err) console.log(err, err.stack);
      assert.equal(true, err !== 'undefined');
      assert.equal('All fonts already installed', err.message);
      for(var j = 0; j < tempFilesByName.length; j++){
          assert.equal(true, fs.existsSync(path.join(sysFontDir, tempFilesByName[j])));
      }

      setTimeout(function () {
        for(var i = 0; i < tempFiles.length; i++){
            assert.equal(false, fs.existsSync(tempFiles[i]));
        }
        done();
      }, 2000);
    }, opts);
  });
});


describe('Try Install all fonts in specified directory that already exist', function(){
  it('should return err object in callback and leave fonts in original directory', function(done){
    this.timeout(0);
    if(!fs.existsSync('./spec/temp-fonts-1')) fs.mkdirSync('./spec/temp-fonts-1');
    var tempFiles = [];
    var tempFilesByName =[];
    var fontDir = fs.readdirSync('./spec/spec-fonts');

    for (var i = 0; i < fontDir.length; i++) {
      tempFiles.push(path.join('./spec/temp-fonts-1', fontDir[i]));
      tempFilesByName.push(fontDir[i]);
      fs.createReadStream(path.join('./spec/spec-fonts', fontDir[i])).pipe(fs.createWriteStream(path.join('./spec/temp-fonts-1', fontDir[i])));
    }

    installfont('./spec/temp-fonts-1', function(err){
      //if(err) console.log(err, err.stack);
      assert.equal(true, err !== 'undefined');
      assert.equal('All fonts already installed', err.message);
      for(var i = 0; i < tempFiles.length; i++){
          assert.equal(true, fs.existsSync(tempFiles[i]));
      }
      for(var j = 0; j < tempFilesByName.length; j++){
          assert.equal(true, fs.existsSync(path.join(sysFontDir, tempFilesByName[j])));
      }
      done();
    });
  });
});
