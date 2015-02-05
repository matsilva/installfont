/*======= Loaded Modules =======*/
var exec  = require('child_process').exec;
var fs    = require('fs');
var spawn = require('child_process').spawn;
var path  = require('path');
var os    = require('os');

/*====== Module Properties ======*/
var fontCount, currentFontCount = 0;
var acceptedExtensions          = ['ttf', 'otf'];
var localFontDir                = path.join(__dirname, '/fonts');
var configOptions               = {};
configOptions.removeFonts       = false;
var invokeCallBack              = function(){};
var platform                    = os.platform();
var sysFontDir									= 'c:/Windows/Fonts';
//Linux specific directories
var otfDir = '';
var ttfDir = '';

if(platform.toLowerCase().indexOf('darwin') != -1) sysFontDir = '/Library/Fonts';
if(platform.toLowerCase().indexOf('linux') != -1) {
    sysFontDir = '/usr/share/fonts';
    ttfDir = path.join(sysFontDir, 'truetype');
    otfDir = path.join(sysFontDir, 'opentype');
    if(!fs.existsSync(ttfDir)) fs.mkdirSync(ttfDir);
    if(!fs.existsSync(otfDir)) fs.mkdirSync(otfDir);
}

/*======== Module Utilities ========*/
var isFolder = function (fontPath) {
  // Before we check to see if it's a folder, let's make sure that bad boy exists
  fs.exists(fontPath, function (exists) {
    if (!exists) {
      return invokeCallBack(new Error("Specified path does not exist: " + fontPath));
    }
    else {
      var stats = fs.statSync(fontPath);
      return stats.isDirectory();
    }
  });  
};


/*======= Installs Fonts =======*/
module.exports = function (fontPath, callback, options) {
  if(typeof callback === 'function') invokeCallBack = callback;
  if(typeof callback === 'object') options = callback;
  if(!fs.existsSync(localFontDir)) fs.mkdirSync(localFontDir);

  //Map options to configOptions
  if(options){
    if(options.removeFonts === true) configOptions.removeFonts = true;
  }

  if(isFolder(fontPath)) {
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
    var _sysFontDir = sysFontDir;
    if(platform.toLowerCase().indexOf('linux') != -1) {
       _sysFontDir = getSysFontFolderLinux(fontName);
    }
  fs.readdir(_sysFontDir, function (err, files) {
    var isInstalled = false;
    for (var i = 0; i < files.length; i++) {
      if (files[i].indexOf(fontName) != -1) isInstalled = true;
    }
    copyFontFiles(fontPathDir, fontName, isInstalled);
  });
}

function checkInstalledFontsForFile(fontFilePath) {
    var _sysFontDir = sysFontDir;
    if(platform.toLowerCase().indexOf('linux') != -1) {
        _sysFontDir = getSysFontFolderLinux(fontFilePath);
    }
  fs.readdir(_sysFontDir, function (err, files) {
    var isInstalled = false;
    for (var i = 0; i < files.length; i++) {
      if (files[i].indexOf(path.basename(fontFilePath)) != -1) isInstalled = true;
    }
    if(isInstalled) {
      cleanFontDirectory(fontFilePath, true);
      return invokeCallBack(new Error('Font already installed'));
    }
    copyFontFile(fontFilePath);
  });
}

/*======= Copies Font Files To Local Font Directory If It Isn't Installed Already =======*/
function copyFontFiles(fontPathDir, fileName, installed) {
  if(installed) {
    currentFontCount++;
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
    return invokeCallBack(new Error(fontExt + " is not an accepted font extension"));
  } else {
    fs.createReadStream(fontFilePath).pipe(fs.createWriteStream(path.join(localFontDir, path.basename(fontFilePath))));
    tryInstallFontFile(fontFilePath);
  }
}

/*======= Installs Fonts In C:\renderfonts Folders If Font Count Matches Current Count =======*/
function tryInstallFonts(fontPathDir) {
  if (fontCount == currentFontCount) {
    if(fs.readdirSync(localFontDir).length === 0){
      cleanFontDirectory(fontPathDir);
      return invokeCallBack(new Error("All fonts already installed"));
    }
    if (platform.indexOf('darwin') != -1 || platform.toLowerCase().indexOf('linux') != -1) {
      return installFontFishHook(fontPathDir);
    }

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
  if (platform.indexOf('darwin') != -1 || platform.toLowerCase().indexOf('linux') != -1) {
    return installFontFishHook(fontFilePath);
  }
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

//Mac OS and Linx install font hook
function installFontFishHook(fontFilePath) {
    var _sysFontDir = sysFontDir;
  if (isFolder(fontFilePath)) {
    fs.readdir(localFontDir, function (err, files) {
      for (var i = 0; i < files.length; i++) {
        if (platform.toLowerCase().indexOf('linux') != -1) {
           _sysFontDir = getSysFontFolderLinux(files[i]); 
        }
        fs.createReadStream(path.join(localFontDir, files[i])).pipe(fs.createWriteStream(path.join(_sysFontDir, files[i])));
      }
    //delete font files here
    cleanFontDirectory(fontFilePath, true);
    return invokeCallBack();

    });
  }else{
    if (platform.toLowerCase().indexOf('linux') != -1) {
       _sysFontDir = getSysFontFolderLinux(fontFilePath); 
    }
    fs.createReadStream(fontFilePath).pipe(fs.createWriteStream(path.join(_sysFontDir, path.basename(fontFilePath))));
    //delete font files here
    cleanFontDirectory(fontFilePath, true);
    return invokeCallBack();

  }
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
function getSysFontFolderLinux(fontPath) {
    if (fontPath.indexOf('.ttf') != -1) {
        return ttfDir;
    }
    if (fontPath.indexOf('.otf') != -1) {
        return otfDir;
    }
}
