//todos
//handle no callback and no options
// handle no callback but options
//compensate if all font files are already installed

/*======= Loaded Modules =======*/
var exec = require('child_process').exec;
var fs = require('fs');
var spawn = require('child_process').spawn;
var path = require('path');

/*====== Module Properties ======*/
var fontCount, currentFontCount = 0;
var acceptedExtensions = ['ttf', 'otf'];
var localFontDir = path.join(__dirname, '/fonts');
var configOptions = {};
configOptions.removeFonts = false;
var invokeCallBack;

/*======= Installs Fonts =======*/
module.exports = function (fontPath, callback, options) {
  invokeCallBack = callback;
  if(!fs.existsSync(localFontDir)) fs.mkdirSync(localFontDir);

  if(options){
    if(options.removeFonts === true) configOptions.removeFonts = true;
  }

  var stats = fs.statSync(fontPath);

  if(stats.isDirectory()){
    return installFontsByDirectory(fontPath);
  } else {
    return installFontFile(fontPath);
  }
};

function installFontsByDirectory(fontPathDir) {
  /*Checks For Fonts Folder In fontPathDir*/
  fs.exists(fontPathDir, function (exists) {
    if (exists) {
      return getFontFiles(fontPathDir);
    } else {
      return invokeCallBack(new Error("Specified directory does not exist: " + fontPathDir));
    }
  });
}

function installFontFile(fontFilePath){
  /*Checks if font file exists*/
  fs.exists(fontFilePath, function (exists) {
    if (exists) {
      return checkInstalledFontsForFile(fontFilePath);
    } else {
      return invokeCallBack(new Error("Specified font file does not exist: " + fontFilePath));
    }
  });
}

/*======= Reads All Files In Fonts Folder =======*/
function getFontFiles(fontPathDir) {
  fs.readdir(fontPathDir, function (err, files) {
    fontCount = files.length;
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < files.length; i++) {
        checkInstalledFonts(fontPathDir, files[i]);
      }
    }
  });
}

/*======= Checks To See If Font Is Installed Already =======*/
function checkInstalledFonts(fontPathDir, fontName) {
  fs.readdir('c:/Windows/Fonts', function (err, files) {
    var isInstalled = false;
    for (var i = 0; i < files.length; i++) {
      if (files[i].indexOf(fontName) != -1) isInstalled = true;
    }
    copyFontFiles(fontPathDir, fontName, isInstalled);
  });
}

function checkInstalledFontsForFile(fontFilePath) {
  fs.readdir('c:/Windows/Fonts', function (err, files) {
    var isInstalled = false;
    for (var i = 0; i < files.length; i++) {
      if (files[i].indexOf(path.basename(fontFilePath)) != -1) isInstalled = true;
    }
    if(isInstalled) return; //fail silently
    copyFontFile(fontFilePath);
  });
}

/*======= Copies Font Files To Local Font Directory If It Isn't Installed Already =======*/
function copyFontFiles(fontPathDir, fileName, installed) {
  if(installed) {
    currentFontCount++;
    //console.log(fileName + 'font already installed'); //Just fail silently
    tryInstallFonts(fontPathDir);
  } else {
    var fontExt = fileName.split('.');
    fontExt = fontExt[fontExt.length -1];
    if (acceptedExtensions.indexOf(fontExt) == -1) {
      currentFontCount++;
      tryInstallFonts(fontPathDir);
    } else {
      fs.createReadStream(path.join(fontPathDir, fileName)).pipe(fs.createWriteStream(path.join(localFontDir, fileName)));
      currentFontCount++;
      tryInstallFonts(fontPathDir);
    }
  }

}

function copyFontFile(fontFilePath) {
  var fontExt = fontFilePath.split('.');
  fontExt = fontExt[fontExt.length -1];
  if (acceptedExtensions.indexOf(fontExt) == -1) {
    return invokeCallBack(new Error("Not an accepted font extension"));
  } else {
    fs.createReadStream(fontFilePath).pipe(fs.createWriteStream(path.join(localFontDir, path.basename(fontFilePath))));
    tryInstallFontFile(fontFilePath);
  }
}

/*======= Installs Fonts In C:\renderfonts Folders If Font Count Matches Current Count =======*/
function tryInstallFonts(fontPathDir) {
  if (fontCount == currentFontCount) {
    if(fs.readdirSync(localFontDir).length === 0) return; //fail silently
    var addFont = exec(
      'cscript ' +
      path.join(__dirname, 'addFontInDirectory.vbs') +
      ' ' + localFontDir
    );

    addFont.stdout.on('data', function (data) {
      //console.log('addFont stdout: ' + data);
    });

    addFont.stderr.on('data', function (data) {
      console.log('addFont stderr: ' + data);
    });

    addFont.on('close', function (code) {
      //delete font files here
      cleanFontDirectory(fontPathDir);
      return invokeCallBack();
    });
  }

}

function tryInstallFontFile(fontFilePath) {

  var addFont = exec(
    'cscript ' +
    path.join(__dirname, 'addFontFile.vbs') +
    ' "' + fontFilePath + '"'
  );

  addFont.stdout.on('data', function (data) {
    //console.log('addFont stdout: ' + data);
  });

  addFont.stderr.on('data', function (data) {
    //console.log('addFont stderr: ' + data);
  });

  addFont.on('close', function (code) {
    //delete font files here
    cleanFontDirectory(fontFilePath, true);
    return invokeCallBack();
  });
}

/*======= Deletes Installed Fonts From localFontDir and User Defined Directory =======*/
function cleanFontDirectory(fontPath, isSingleFile) {
  if(configOptions.removeFonts === true){
    if(isSingleFile){
      fs.unlinkSync(fontPath);
    }else{
      fs.readdir(fontPath, function (err, files) {
        if (err) {
          console.log(err);
        } else {
          for (var j = 0; j < files.length; j++) {
            fs.unlinkSync(path.join(fontPath, files[j]));
          }
        }
      });
    }
  }
  fs.readdir(localFontDir, function (err, files) {
    if (err) {
      console.log(err);
    } else {
      for (var j = 0; j < files.length; j++) {
        fs.unlinkSync(path.join(localFontDir, files[j]));
      }
    }
  });
}
