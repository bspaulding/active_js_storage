// ActiveObjectTest.js
// Author: Bradley J. Spaulding
// Created On: 2011-02-12

db = database.initialize('active_object_test');

database.create_table('people');

database.add_column('people', 'first_name', 'string');
database.add_column('people', 'last_name', 'string');
database.add_column('people', 'email', 'string');
database.add_column('people', 'mobile_number', 'string');

people = [
  {
    first_name: "Bradley",
    last_name: "Spaulding",
    email: "brad.spaulding@gmail.com",
    mobile_number: "9788077533"
  },{
    first_name: "Anthony",
    last_name: "Papia",
    email: "anthony.papia@gordon.edu",
    mobile_number: "9789944876"
  }
]

for(i in people)
  database.insert('people', people[i]);

database.where('people', 'id = 1', function(transaction, results) {
  console.log(transaction);
  for(var i = 0; i < results.rows.length; i++) {
    console.log( results.rows.item(i) );
  }
});