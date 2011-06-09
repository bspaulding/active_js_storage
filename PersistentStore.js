// PersistentStore.js
// Author: Bradley J. Spaulding
// Created On: 2011-06-08

function PersistentStore(name) {
  var store = {};
  
  store.initialize = function() {
    database.initialize(name);
    
    database.create_table('objects', {
      name:  { type: 'string' },
      value: { type: 'string' },
      type:  { type: 'string' }
    });
  };
  
  store.set = function(key, value) {
    database.execute_sql("DELETE FROM objects WHERE name = '" + key + "';", function(transaction, results) {
      database.insert('objects', { 
        name: key,
        type: (typeof value),
        value: escape(value.toString())
      });      
    });
  }

  store.get = function(key, handler) {
    database.where('objects', "name = '" + key + "'", function(transaction, results) {
      handler( store.reify( results.rows.item(0) ) );
    }); 
  }
  
  store.reify = function(object) {
    return store['reify_' + object.type](object);
  }
  
  store.reify_function = function(object) {
    eval( 'var ' + object.name + ' = ' + unescape(object.value) );
    return eval( object.name );
  }
  
  store.reify_string = function(object) {
    return object.value;
  }
  
  store.reify_number = function(object) {
    return parseFloat(object.value);
  }
  
  store.reify_object = function(object) {
    // TODO: how to do this asynchronously. :/
  }
  
  store.destroy = function() {
    database.drop_table('objects');
  }
  
  store.initialize();
  
  return store;
}

var store = new PersistentStore('persistent_store_test');
store.set('hello', function() { alert('Hello PersistentStore!') });


// KV Store Test
// database.initialize('persistent_store_test');
// database.drop_table('objects');
// database.create_table('objects');
// database.add_column('objects', 'name', 'string');
// database.add_column('objects', 'type', 'string');
// database.add_column('objects', 'value', 'string');
// 
// hello = function() { alert('Hello World!'); }
// objecthash = { 
//   name: 'hello',
//   type: (typeof hello),
//   value: escape(hello.toString())
// }
// database.insert('objects', objecthash);
// 
// database.where('objects', "name = 'hello'", function(transaction, results) {
//   obj = results.rows.item(0);
//   eval( obj.name + '=' + unescape(obj.value) );
// });