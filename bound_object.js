// bound_object.js
// Author: Bradley J. Spaulding
// Created On: 2011-06-09

function BoundObject(object) {
  for( key in object )
    if( typeof object[key] == 'function' )
      object[key] = object[key].bind(object);

  return object;
}