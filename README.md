installfont
===========

**currently under construction...**

Nodejs module for installing fonts. 
This module is not tightly coupled to any specific font libraries or apis. 
It also is not opinionated about how you get the fonts on your machine.
installfont is currently scoped to windows operation system. 
You can find a mac solution here: [FTPM](http://heldr.github.io/ftpm/)

###Assumptions

* Assumes font files are downloaded to your machine, but not yet installed.

### Installation

Open your command line and run `npm install installfont` 

### Usage
```javascript
var installfont = require('installfont');

installfont('path/to/your/font.ttf', function(err) {
  if(err) throw err;
  //handle callback tasks here
});


```
