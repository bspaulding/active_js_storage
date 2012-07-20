// PersistentStore.js
// Author: Bradley J. Spaulding
// Created On: 2011-06-08

function PersistentStore(name) { var store = new BoundObject({
  initialize: function() {
    if( window.openDatabase ) {
      this.store_type = 'database';
      this.database = new Database(name);
      
      this.database.create_table('objects', {
        name:  { type: 'string' },
        value: { type: 'string' }
      });
    } else {
      this.store_type = 'localStorage';
    }

    this.store_type = 'localStorage';

    console.log('PersistentStore(' + name + ') is using store type "' + this.store_type + '"');
  },

  set: function(key, value) {
    this['set_using_' + this.store_type](key, value);
  },
  
  set_using_database: function(key, value) {
    this.database.execute_sql("DELETE FROM objects WHERE name = '" + key + "';", function(transaction, results) {
      this.database.insert('objects', { 
        name: key,
        value: JSON.stringify( value, this.replacer )
      });      
    }.bind(store));
  },

  set_using_localStorage: function(key, value) {
    console.log('set_using_localStorage, value => ')
    console.log(value);
    var keystr = key.toString();
    var valuestr = JSON.stringify( value, this.replacer );

    console.log('key => "' + keystr + '"')
    console.log('value => "' + valuestr + '"');
    localStorage.setItem( keystr, valuestr );
  },

  get: function(key, handler) {
    this['get_using_' + this.store_type](key, handler);
  },

  get_using_database: function(key, handler) {
    this.database.where('objects', "name = '" + key + "'", function(transaction, results) {
      handler( JSON.parse( results.rows.item(0).value, this.reviver ) );
    }); 
  },

  get_using_localStorage: function(key, handler) {
    handler( JSON.parse( localStorage.getItem(key), this.reviver ) );
  },
  
  // Replacer function for JSON.stringify
  replacer: function(key, value) {
    console.log('replacer ->')
    console.log('value => ');
    console.log(value);
    if( typeof value == 'function' ) {
      var valuestr = escape( value.toString() );
      console.log('valuestr => ' + valuestr);
      return valuestr;
    }
    return value;
  },
  
  // Reviver function for JSON.parse
  reviver: function(key, value) {
    if( String(value).indexOf('function') == 0 )
      return this.reify_function({ name: key, value: value });
    return value;
  },
  
  reify_function: function(object) {
    eval( 'var ' + object.name + ' = ' + unescape(object.value) );
    return eval( object.name );
  },
  
  destroy: function() {
    this.database.drop_table('objects');
  }
}); store.initialize(); return store; };

// Test
var store = new PersistentStore('persistent_store_test');
hello_object = { sayHello: function() { alert('Hello PersistentStore!') } }
store.set('hello', hello_object);