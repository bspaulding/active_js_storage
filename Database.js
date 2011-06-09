// Database.js
// Author: Bradley J. Spaulding
// Created On: 2011-02-12

var database = {
  column_types: {
    'string': 'TEXT',
    'text': 'TEXT',
    'numeric': 'NUMERIC',
    'integer': 'INTEGER',
    'real': 'REAL'
  },
  transactions: {}
};

database.initialize = function(database_name, version, display_name, max_size) {
  try {
    if (!window.openDatabase) {
        alert('Offline Relational Database is not supported.');
    } else {
        this.database_name = database_name;
        this.version = version || '1.0';
        this.display_name = display_name || database_name;
        this.max_size = max_size || 65536; // in bytes
        this.db = openDatabase(this.database_name, this.version, this.display_name, this.max_size);
 
        return this.db;
    }
  } catch(e) {
      // Error handling code goes here.
      if (e == 2) {
          // Version number mismatch.
          alert("Invalid database version.");
      } else {
          alert("Unknown Error: " + e + ".");
      }
      return;
  }
};

database.error_handler = function(transaction, error) {
  console.log('Database Error: \n  ' + error.code + ': ' + error.message.capitalize() + '.');
};

database.null_data_handler = function(transaction, results) {
  console.log('database.null_data_handler has not yet been implemented.');
}

database.create_table = function(table_name, columns) {
  database.execute_unless_table_exists(table_name, function() {
    sql = 'CREATE TABLE ' + table_name + '(';
    
    column_definitions = new Array();
    column_definitions.push('id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT');
    
    for( var column_name in columns ) {
      column_definitions.push( database.column_definition(column_name, columns[column_name]) );
    }
    
    sql += column_definitions.join(', ') + ')';
    database.execute_sql( sql );
  });
};

database.column_definition = function(column_name, options) {
  column_definition_elements = new Array();
  column_definition_elements.push(column_name);
  column_definition_elements.push( database.column_types[options.type.toLowerCase()] );
  
  if( typeof options.allow_null == 'undefined' )
    options.allow_null = true;

  if( !options.allow_null )
    column_definition_elements.push('NOT NULL');
    
  if( typeof options.sql != 'undefined' )
    column_definition_elements.push(options.sql);
  
  return column_definition_elements.join(' ');
}

database.drop_table = function(table_name) {
  database.execute_if_table_exists(table_name, function() {
    database.execute_sql( 'DROP TABLE ' + table_name );
  });
}

database.add_column = function(table_name, name, type, not_null, default_value) {
  if(not_null == null)
    not_null = false;

  sql = 'ALTER TABLE ' + table_name + ' ADD COLUMN ' + name + ' ' + database.column_types[type.toLowerCase()];

  if(not_null)
    sql += ' NOT NULL ';
  
  if(default_value != null) 
    sql += ' DEFAULT "' + default_value + '" ';

  database.execute_sql( sql );
}

database.insert = function(table_name, object) {
  keys = []; values = [];
  for(i in object) {
    keys[keys.length] = i;
    values[values.length] = database.sanitize( object[i] );
  }

  database.execute_sql( 'INSERT INTO ' + table_name + '(' + keys.join() + ') VALUES(' + values.join() + ')' );
}

database.sanitize = function(string) {
  return "'" + string + "'";
}

database.where = function(table_name, where, data_handler) {
  var sql = 'SELECT * FROM ' + table_name + ' WHERE ' + where;

  database.execute_sql( sql, data_handler );
}

database.execute_sql = function(sql, data_handler) {
  if(data_handler == null)
    data_handler = database.null_data_handler;

  database.db.transaction( function(transaction) {
    transaction.executeSql( sql, [], data_handler, database.error_handler );
  });
}

database.execute_if = function(sql, test_handler, truth_handler, false_handler) {
  database.execute_sql(sql, function(transaction, results) {
    if( typeof test_handler == 'function' && test_handler(transaction, results) )
      if( typeof truth_handler == 'function' ) truth_handler();
    else
      if( typeof false_handler == 'function' ) false_handler();
  });
}

database.execute_if_table_exists = function(table_name, handler) {
  var sql = "select count(*) from sqlite_master where type = 'table' and name = '" + table_name + "';"
  database.execute_if(sql, function(transaction, results) {
    return ( results.rows.item(0)['count(*)'] == 1 );
  }, handler);
}

database.execute_unless_table_exists = function(table_name, handler) {
  var sql = "select count(*) from sqlite_master where type = 'table' and name = '" + table_name + "';"
  database.execute_if(sql, function(transaction, results) {
    return ( results.rows.item(0)['count(*)'] == 0 );
  }, null, handler);
}