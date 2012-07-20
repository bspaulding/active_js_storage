// this.js
// Author: Bradley J. Spaulding
// Created On: 2011-02-12

function Database(database_name, version, display_name, max_size) { var database = new BoundObject({
  column_types: {
    'string': 'TEXT',
    'text': 'TEXT',
    'numeric': 'NUMERIC',
    'integer': 'INTEGER',
    'real': 'REAL'
  },

  transactions: {},

  initialize: function() {
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
        if (e == 2)
          alert("Invalid database version."); // Version number mismatch.
        else
          alert("Unknown Error: " + e + ".");
        return;
    }
  },

  error_handler: function(transaction, error) {
    console.log('Database Error: \n  ' + error.code + ': ' + error.message.capitalize() + '.');
  },

  null_data_handler: function(transaction, results) {
    console.log('this.null_data_handler has not yet been implemented.');
  },

  create_table: function(table_name, columns) {
    this.execute_unless_table_exists(table_name, function() {
      sql = 'CREATE TABLE ' + table_name + '(';
      
      column_definitions = new Array();
      column_definitions.push('id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT');
      
      for( var column_name in columns ) {
        column_definitions.push( this.column_definition(column_name, columns[column_name]) );
      }
      
      sql += column_definitions.join(', ') + ')';
      this.execute_sql( sql );
    }.bind(this));
  },

  column_definition: function(column_name, options) {
    column_definition_elements = new Array();
    column_definition_elements.push(column_name);
    column_definition_elements.push( this.column_types[options.type.toLowerCase()] );
    
    if( typeof options.allow_null == 'undefined' )
      options.allow_null = true;

    if( !options.allow_null )
      column_definition_elements.push('NOT NULL');
      
    if( typeof options.sql != 'undefined' )
      column_definition_elements.push(options.sql);
    
    return column_definition_elements.join(' ');
  },

  drop_table: function(table_name) {
    this.execute_if_table_exists(table_name, function() {
      this.execute_sql( 'DROP TABLE ' + table_name );
    });
  },

  add_column: function(table_name, name, type, not_null, default_value) {
    if(not_null == null)
      not_null = false;

    sql = 'ALTER TABLE ' + table_name + ' ADD COLUMN ' + name + ' ' + this.column_types[type.toLowerCase()];

    if(not_null)
      sql += ' NOT NULL ';
    
    if(default_value != null) 
      sql += ' DEFAULT "' + default_value + '" ';

    this.execute_sql( sql );
  },

  insert: function(table_name, object) {
    keys = []; values = [];
    for(i in object) {
      keys[keys.length] = i;
      values[values.length] = this.sanitize( object[i] );
    }

    this.execute_sql( 'INSERT INTO ' + table_name + '(' + keys.join() + ') VALUES(' + values.join() + ')' );
  },

  sanitize: function(string) {
    return "'" + string + "'";
  },

  where: function(table_name, where, data_handler) {
    var sql = 'SELECT * FROM ' + table_name + ' WHERE ' + where;

    this.execute_sql( sql, data_handler );
  },

  execute_sql: function(sql, data_handler) {
    if(data_handler == null)
      data_handler = this.null_data_handler;

    this.db.transaction( function(transaction) {
      transaction.executeSql( sql, [], data_handler, this.error_handler );
    });
  },

  execute_if: function(sql, test_handler, truth_handler, false_handler) {
    this.execute_sql(sql, function(transaction, results) {
      if( typeof test_handler == 'function' && test_handler(transaction, results) )
        if( typeof truth_handler == 'function' ) truth_handler();
      else
        if( typeof false_handler == 'function' ) false_handler();
    });
  },

  execute_if_table_exists: function(table_name, handler) {
    var sql = "select count(*) from sqlite_master where type = 'table' and name = '" + table_name + "';"
    this.execute_if(sql, function(transaction, results) {
      return ( results.rows.item(0)['count(*)'] == 1 );
    }, handler);
  },

  execute_unless_table_exists: function(table_name, handler) {
    var sql = "select count(*) from sqlite_master where type = 'table' and name = '" + table_name + "';"
    this.execute_if(sql, function(transaction, results) {
      return ( results.rows.item(0)['count(*)'] == 0 );
    }, null, handler);
  }
}); database.initialize(); return database; };