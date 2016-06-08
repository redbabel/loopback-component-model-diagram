'use strict';

class Relation {
  constructor(source, destination, type) {
    this.source = source;
    this.destination = destination;

    /**
     * Valid types are:
     * - hasOne
     * - hasMany
     * - belongsTo
     * - hasAndBelongsToMany
     * - generalize (used in a polymorphic relation from the generalization
     * model to the concrete model)
     */
    this.type = type;

    this.polymorphic = false;
  }

  setPolymorphic(polymorphic) {
    this.polymorphic = true;
  }
}

module.exports = Relation;
