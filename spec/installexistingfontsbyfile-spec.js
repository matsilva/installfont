var installfont = require('../lib/installfont');
var path = require('path');
var assert = require("assert");
var fs = require('fs');
var os          = require('os');
var platform    = os.platform();
var sysFontDir  = 'c:/Windows/Fonts';

if(platform.toLowerCase().indexOf('darwin') != -1) sysFontDir = '/Library/Fonts';

describe('Try Install single existing specified font', function(){
  it('should return err object in callback and leave font in original directory', function(done){
    this.timeout(0);
    if(!fs.existsSync('./spec/temp-fonts-3')) fs.mkdirSync('./spec/temp-fonts-3');
    var tempFiles = [];
    var tempFilesByName =[];

    fs.createReadStream('./spec/spec-fonts3/Martyric_PersonalUse.ttf')
      .pipe(fs.createWriteStream('./spec/temp-fonts-3/Martyric_PersonalUse.ttf'));

    installfont('./spec/temp-fonts-3/Martyric_PersonalUse.ttf', function(err){
      //if(err) console.log(err, err.stack);
      assert.equal(true, err !== 'undefined');
      assert.equal('Font already installed', err.message);
      assert.equal(true, fs.existsSync('./spec/temp-fonts-3/Martyric_PersonalUse.ttf'));
      assert.equal(true, fs.existsSync(path.join(sysFontDir, 'Martyric_PersonalUse.ttf')));
      done();
    });
  });
});

describe('Try Install single existing specified font with options', function(){
  it('should return err object in callback and remove font in original directory', function(done){
    this.timeout(0);
    if(!fs.existsSync('./spec/temp-fonts-3')) fs.mkdirSync('./spec/temp-fonts-3');
    var tempFiles = [];
    var tempFilesByName =[];

    fs.createReadStream('./spec/spec-fonts3/Silver Bellybutton Ring Reg.ttf')
      .pipe(fs.createWriteStream('./spec/temp-fonts-3/Silver Bellybutton Ring Reg.ttf'));

    var opts = {};
    opts.removeFonts = true;

    installfont('./spec/temp-fonts-3/Silver Bellybutton Ring Reg.ttf', function(err){
      //if(err) console.log(err, err.stack);
      assert.equal(true, err !== 'undefined');
      assert.equal('Font already installed', err.message);
      assert.equal(true, fs.existsSync(path.join(sysFontDir, 'Martyric_PersonalUse.ttf')));
      setTimeout(function () {
        assert.equal(false, fs.existsSync('./spec/temp-fonts-3/Silver Bellybutton Ring Reg.ttf'));
        done();
      }, 500);

    }, opts);
  });
});
