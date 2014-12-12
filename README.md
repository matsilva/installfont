installfont
===========

Nodejs module for installing system fonts.
This module is not tightly coupled to any specific font libraries or apis.
It also is not opinionated about how you get the fonts on your machine.
installfont is currently scoped to windows operating system.
You can find a mac solution here: [FTPM](http://heldr.github.io/ftpm/)

###Assumptions

* Assumes font file(s) are downloaded to your machine, but not yet installed.

### Installation

Open your command line and run `npm install installfont`

### Usage
*Installing a single font file*
```javascript
var installfont = require('installfont');

installfont('path/to/your/font.ttf', function(err) {
  if(err) console.log(err, err.stack);
  //handle callback tasks here
});


```

*Installing all font files within a specified directory*

```javascript
var installfont = require('installfont');

installfont('path/to/dir/containing/fonts', function(err) {
  if(err) console.log(err, err.stack);
  //handle callback tasks here
});
```


### Options
*Pass installfont an options parameter as a third argument*


```javascript
var installfont = require('installfont');

var options = {
  removeFonts: true
};

installfont('path/to/dir/containing/fonts', function(err) {
  if(err) console.log(err, err.stack);
  //handle callback tasks here
}, options);
```
`removeFonts` - Pass true or false to specify if you want your font file(s) to be deleted after they are installed. Defaults to false;
