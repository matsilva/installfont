var installfont = require('../lib/installfont');
var path        = require('path');
var assert      = require("assert");
var fs          = require('fs');
var os          = require('os');
var platform    = os.platform();
var sysFontDir	= 'c:/Windows/Fonts';
var otfDir, ttfDir;

if(platform.toLowerCase().indexOf('darwin') != -1) sysFontDir = '/Library/Fonts';
if(platform.toLowerCase().indexOf('linux') != -1) {
    sysFontDir = '/usr/share/fonts';
    ttfDir = path.join(sysFontDir, 'truetype');
    otfDir = path.join(sysFontDir, 'opentype');
    if(!fs.existsSync(ttfDir)) fs.mkdirSync(ttfDir);
    if(!fs.existsSync(otfDir)) fs.mkdirSync(otfDir);
}

function getSysFontFolderLinux(fontPath) {
    if (fontPath.indexOf('.ttf') != -1) {
        return ttfDir;
    }
    if (fontPath.indexOf('.otf') != -1) {
        return otfDir;
    }
}

describe('Install single specified font', function(){
  it('should install specified font and leave it in original directory', function(done){
    this.timeout(0);
    if(!fs.existsSync('./spec/temp-fonts-3')) fs.mkdirSync('./spec/temp-fonts-3');
    var tempFiles       = [];
    var tempFilesByName = [];

    fs.createReadStream('./spec/spec-fonts3/Martyric_PersonalUse.ttf')
      .pipe(fs.createWriteStream('./spec/temp-fonts-3/Martyric_PersonalUse.ttf'));

    installfont('./spec/temp-fonts-3/Martyric_PersonalUse.ttf', function(err){
      if(err) console.log(err, err.stack);
       if (platform.toLowerCase().indexOf('linux') != -1) {
          sysFontDir = ttfDir; 
       }
      assert.equal(true, fs.existsSync('./spec/temp-fonts-3/Martyric_PersonalUse.ttf'));
      assert.equal(true, fs.existsSync(path.join(sysFontDir, 'Martyric_PersonalUse.ttf')));
      done();
    });
  });
});

describe('Install single specified font', function(){
  it('should install specified font and delete it in original directory', function(done){
    this.timeout(0);
    if(!fs.existsSync('./spec/temp-fonts-3')) fs.mkdirSync('./spec/temp-fonts-3');
    var tempFiles = [];
    var tempFilesByName =[];

    fs.createReadStream('./spec/spec-fonts3/Silver Bellybutton Ring Reg.ttf')
      .pipe(fs.createWriteStream('./spec/temp-fonts-3/Silver Bellybutton Ring Reg.ttf'));

    var opts = {};
    opts.removeFonts = true;

    installfont('./spec/temp-fonts-3/Silver Bellybutton Ring Reg.ttf', function(err){
      if(err) console.log(err, err.stack);
       if (platform.toLowerCase().indexOf('linux') != -1) {
          sysFontDir = ttfDir; 
       }
      assert.equal(true, fs.existsSync(path.join(sysFontDir, 'Martyric_PersonalUse.ttf')));
      setTimeout(function () {
        assert.equal(false, fs.existsSync('./spec/temp-fonts-3/Silver Bellybutton Ring Reg.ttf'));
        done();
      }, 500);

    }, opts);
  });
});
