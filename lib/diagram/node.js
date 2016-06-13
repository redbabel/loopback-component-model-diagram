'use strict';

class Node {
  constructor(name, specialize, generalization) {
    this.name = name;

    /**
     * Refer to the node which it inherites from. Can be null,
     * for example, for the node that represents an "abstract"
     * node like the ones generated from the "as" parameter in
     * a polymorphic relation.
     */
    this.specialize = specialize || null;

    /**
     * If true, this node is a generalization in a polymorphic
     * relation.
     */
    this.generalization = generalization || false;

    this.relations = [];
  }

  /**
   * Add a relation. If this is a generalization node, see the setRelation
   * method.
   */
  addRelation(relation) {
    this.relations.push(relation);
  }

  /**
   * This is the function that should be used to add (or set) the relation
   * when the node is a generalization.
   */
  setRelation(relation) {
    this.relations.length = 0; // avoid the issue originated by the referece sharing
    this.relations.push(relation);
  }

  /**
   * One property is an object like:
   * {
   *  name: String,
   *  type: String
   * }
   */
  setProperties(properties) {
    this.properties = properties;
  }

  setMethods(methods) {
    this.methods = methods;
  }

  getNomnomlSource() {
    let source = '[';

    // add type if any
    if (this.generalization) {
      source += '<state> ';
    }

    // add name
    source += this.name;

    // add properties if any
    if (this.properties) {
      source += '|';

      // sort for readability
      this.properties.sort((a, b) => {
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }

        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });

      this.properties.forEach((property) => {
        source += `${property.name}: ${property.type};`;
      });

      // remove last semicolon
      source = source.substring(0, source.length - 1);
    }

    source += ']';

    return source;
  }
}

module.exports = Node;
