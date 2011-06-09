// JavascriptExtensions.js
// Author: Bradley J. Spaulding
// Created On: 2011-02-12

String.prototype.capitalize = function() {
  return this[0].toUpperCase() + this.substring(1, this.length);
}

String.prototype.titleize = function() {
  words = this.split(' ');
  
  for(i in words)
    words[i] = words[i].capitalize();

  return words.join(' ');
}

String.prototype.classize = function() {
  words = this.split(' ');
  
  for(i in words)
    words[i] = words[i].capitalize();

  return words.join('');  
}

// Object.prototype.inspect = function() {
//   str = '----------';

//   for(i in this)
//     str += '  ' + i + ': ' + this[i];

//   return str += '\n';
// }