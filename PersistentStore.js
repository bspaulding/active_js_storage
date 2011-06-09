// PersistentStore.js
// Author: Bradley J. Spaulding
// Created On: 2011-06-08

function PersistentStore(name) {
  var store = {};
  
  store.initialize = function() {
    database.initialize(name);
    
    database.create_table('objects', {
      name:  { type: 'string' },
      value: { type: 'string' }
    });
  };
  
  store.set = function(key, value) {
    database.execute_sql("DELETE FROM objects WHERE name = '" + key + "';", function(transaction, results) {
      database.insert('objects', { 
        name: key,
        value: JSON.stringify( value, store.replacer )
      });      
    });
  }

  store.get = function(key, handler) {
    database.where('objects', "name = '" + key + "'", function(transaction, results) {
      handler( JSON.parse( results.rows.item(0).value, store.reviver ) );
    }); 
  }
  
  // Replacer function for JSON.stringify
  store.replacer = function(key, value) {
    if( typeof value == 'function' )
      return escape(value.toString());
    return value;
  }
  
  // Reviver function for JSON.parse
  store.reviver = function(key, value) {
    if( String(value).indexOf('function') == 0 )
      return store.reify_function({ name: key, value: value });
    return value;
  }
  
  store.reify_function = function(object) {
    eval( 'var ' + object.name + ' = ' + unescape(object.value) );
    return eval( object.name );
  }
  
  store.destroy = function() {
    database.drop_table('objects');
  }
  
  store.initialize();
  
  return store;
}

// Test
var store = new PersistentStore('persistent_store_test');
hello_object = { sayHello: function() { alert('Hello PersistentStore!') } }
store.set('hello', hello_object);