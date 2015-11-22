var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    set: function(n){
      this.internal.names = n.split(" ");
    }

  },
  courses: [{ type: String, ref: 'Course' }],
  internal: {
    names: [String]
  }
});

var names = String(this.name).split(" ")

/* Returns the student's first name, which we will define
 * to be everything up to the first space in the student's name.
 * For instance, "William Bruce Bailey" -> "William" */

schema.virtual('firstName').get(function() {
  return this.internal.names[0];
});

/* Returns the student's last name, which we will define
 * to be everything after the last space in the student's name.
 * For instance, "William Bruce Bailey" -> "Bailey" */
schema.virtual('lastName').get(function() {
  var indexOfLastName = this.internal.names.length - 1;
  return this.internal.names[indexOfLastName];
});

module.exports = schema;
