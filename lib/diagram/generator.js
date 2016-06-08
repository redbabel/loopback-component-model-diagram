'use strict';

const _ = require('lodash');
const Node = require('./node');
const Relation = require('./relation');

/**
 * Returns true if the given model is a built in model.
 */
function isBuiltInModel(modelName) {
  const builtInModelNames = [
    'Model',
    'PersistedModel',
  ];

  return builtInModelNames.indexOf(modelName) > -1;
}

/**
 * Get or set the given node entry in the given map looking for
 * the key node.name.
 */
function getOrCreateNodeEntry(map, node) {
  if (!map.has(node.name)) {
    map.set(node.name, node);
  }

  return map.get(node.name);
}

function containsObject(array, obj) {
  return array.some((element) => {
    if (element === obj) {
      return true;
    }

    return false;
  });
}

/**
 * If present, return the relation of the given types that is a logical
 * reflection of the given relation.
 */
function getRelationReflection(relation, types) {
  if (relation.modelTo && relation.modelTo.relations) {
    for (const modelToRelName in relation.modelTo.relations) {
      if (relation.modelTo.relations.hasOwnProperty(modelToRelName)) {
        const modelToRel = relation.modelTo.relations[modelToRelName];
        if ((types.indexOf(modelToRel.type) > -1
          && modelToRel.modelTo
          && modelToRel.modelTo === relation.modelFrom)
          || (types.indexOf(modelToRel.type) > -1
          && modelToRel.modelThrough
          && modelToRel.modelThrough === relation.modelFrom)
        ) {
          return modelToRel;
        }
      }
    }
  }

  return null;
}

/**
 * Handle the belongsTo non-polymorphic relation.
 */
function handleBelongsTo(nodes, node, relation, relationsToIgnore) {
  // check if it's a reflection
  const hasOneOrHasManyReflection = getRelationReflection(relation, ['hasOne', 'hasMany']);
  if (hasOneOrHasManyReflection) {
    relationsToIgnore.push(relation);
    return;
  }

  const destination = getOrCreateNodeEntry(nodes, new Node(relation.modelTo.modelName));
  const rel = new Relation(node, destination, 'belongsTo');
  node.addRelation(rel);
}

/**
 * Handle the hasOne non-polymorphic relation.
 */
function handleHasOne(nodes, node, relation) {
  const destination = getOrCreateNodeEntry(nodes, new Node(relation.modelTo.modelName));
  const rel = new Relation(node, destination, 'hasOne');
  node.addRelation(rel);
}

/**
 * Handle the hasOne polymorphic relation.
 */
function handleHasOnePolymorphic(nodes, node, relation) {
  const destination = getOrCreateNodeEntry(nodes, new Node(relation.modelTo.modelName));

  const asNode = getOrCreateNodeEntry(nodes, new Node(relation.polymorphic.as, null, true));
  const asNodeRelation = new Relation(asNode, destination, 'generalize');
  asNode.setRelation(asNodeRelation);
  nodes.set(asNode.name, asNode);

  const rel = new Relation(node, asNode, 'hasOne');
  rel.setPolymorphic(true);

  node.addRelation(rel);
}

/**
 * Handle the hasMany non-polymorphic relation.
 */
function handleHasMany(nodes, node, relation) {
  const destination = getOrCreateNodeEntry(nodes, new Node(relation.modelTo.modelName));
  const rel = new Relation(node, destination, 'hasMany');
  node.addRelation(rel);
}

/**
 * Handle the hasMany polymorphic relation.
 */
function handleHasManyPolymorphic(nodes, node, relation) {
  const destination = getOrCreateNodeEntry(nodes, new Node(relation.modelTo.modelName));

  const asNode = getOrCreateNodeEntry(nodes, new Node(relation.polymorphic.as, null, true));
  const asNodeRelation = new Relation(asNode, destination, 'generalize');
  asNode.setRelation(asNodeRelation);
  nodes.set(asNode.name, asNode);

  const rel = new Relation(node, asNode, 'hasMany');
  rel.setPolymorphic(true);

  node.addRelation(rel);
}

/**
 * Handle the hasManyThrough relation.
 */
function handleHasManyThrough(nodes, node, relation, relationsToIgnore) {
  // get the hasMany relation from modelTo to modelFrom
  const hasManyReflection = getRelationReflection(relation, ['hasMany']);
  if (hasManyReflection) {
    relationsToIgnore.push(hasManyReflection);
  }

  const destinationThrough = getOrCreateNodeEntry(nodes, new Node(relation.modelThrough.modelName));
  const destinationTo = getOrCreateNodeEntry(nodes, new Node(relation.modelTo.modelName));

  const relThrough = new Relation(node, destinationThrough, 'belongsTo');
  const relTo = new Relation(node, destinationTo, 'hasAndBelongsToMany');
  relTo.setPolymorphic(true);

  const relToToThrough = new Relation(destinationTo, destinationThrough, 'belongsTo');

  node.addRelation(relThrough);
  node.addRelation(relTo);
  destinationTo.addRelation(relToToThrough);
}

/**
 * Handle the hasAndBelongsToMany non-polymorphic relation.
 */
function handleHasAndBelongsToMany(nodes, node, relation, relationsToIgnore) {
  // get the hasMany relation from modelTo to modelFrom
  const hasManyReflection = getRelationReflection(relation, ['hasMany']);
  if (hasManyReflection) {
    relationsToIgnore.push(hasManyReflection);
  }

  const destination = getOrCreateNodeEntry(nodes, new Node(relation.modelTo.modelName));
  const rel = new Relation(node, destination, 'hasAndBelongsToMany');

  node.addRelation(rel);
}

/**
 * Handle the hasAndBelongsToMany polymorphic relation.
 */
function handleHasAndBelongsToManyPolymorphic(nodes, node, relation) {
  const destinationThrough = getOrCreateNodeEntry(nodes, new Node(relation.modelThrough.modelName));
  const destinationTo = getOrCreateNodeEntry(nodes, new Node(relation.modelTo.modelName));

  const relThrough = new Relation(node, destinationThrough, 'belongsTo');
  const relTo = new Relation(node, destinationTo, 'hasMany');
  relTo.setPolymorphic(true);

  node.addRelation(relThrough);
  node.addRelation(relTo);
}

/**
 * Returns a string with the arrow in between the
 * source and the destination node nomnoml code.
 */
function printConnection(relation, arrow) {
  return `${relation.source.getNomnomlSource()} ${arrow} ${relation.destination.getNomnomlSource()}\n`;
}

/**
 * Returns the nomnoml source for the given nodes.
 */
function getNomnomlSourceFromNodes(nodes) {
  let nomnomlSource = '';

  nodes.forEach((node) => {
    /**
     * Write the inheritance connection if exists.
     */
    if (node.specialize && !isBuiltInModel(node.specialize.name)) {
      nomnomlSource += `${node.getNomnomlSource()} -:> ${node.specialize.getNomnomlSource()}\n`;
    }

    /**
     * Write the relations.
     */
    if (node.relations.length > 0) {
      node.relations.forEach((rel) => {
        if (rel.type === 'belongsTo' || rel.type === 'generalize') {
          nomnomlSource += printConnection(rel, '->');
        } else if (rel.type === 'hasOne') {
          if (rel.polymorphic) {
            nomnomlSource += printConnection(rel, '--');
          } else {
            nomnomlSource += printConnection(rel, '-');
          }
        } else if (rel.type === 'hasMany') {
          if (rel.polymorphic) {
            nomnomlSource += printConnection(rel, '--:>');
          } else {
            nomnomlSource += printConnection(rel, '<-');
          }
        } else if (rel.type === 'hasAndBelongsToMany') {
          if (rel.polymorphic) {
            nomnomlSource += printConnection(rel, '<-->');
          } else {
            nomnomlSource += printConnection(rel, '<->');
          }
        }
      });
    }
  });

  return nomnomlSource;
}

function getNodePropertyTypeFromRelation(propertyName, loopbackRelations) {
  let nodePropertyType = '';

  const found = loopbackRelations.some((loopbackRelation) => {
    if (loopbackRelation.keyFrom === propertyName) {
      // if it's an embedded relation
      if (loopbackRelation.embed) {
        if (loopbackRelation.type === 'embedsMany') {
          nodePropertyType = `${loopbackRelation.modelTo.modelName}\\[\\]`;
        } else {
          nodePropertyType = loopbackRelation.modelTo.modelName;
        }

      // if it's a referencesMany relation
      } else if (loopbackRelation.type === 'referencesMany') {
        nodePropertyType = `*${loopbackRelation.modelTo.modelName}\\[\\]`;

      // if none of the above
      } else {
        throw new Error('Relation not identified');
      }

      return true;
    }

    return false;
  });

  if (!found) {
    throw new Error('Property name not found as keyFrom in relations');
  }

  return nodePropertyType;
}

function extractNodeProperties(properties, loopbackRelations) {
  const nodeProperties = [];

  for (const propertyName in properties) {
    if (properties.hasOwnProperty(propertyName)) {
      const property = properties[propertyName];
      const nodeProperty = {
        name: propertyName,
      };

      // if it's a loopback type
      if (typeof property.type.name === 'string' && property.type.name !== 'ModelConstructor') {
        nodeProperty.type = property.type.name;
      } else {
        nodeProperty.type = getNodePropertyTypeFromRelation(propertyName, loopbackRelations);
      }

      nodeProperties.push(nodeProperty);
    }
  }

  return nodeProperties;
}

function getRelations(models) {
  const relations = [];

  models.forEach((model) => {
    for (const relation in model.relations) {
      if (model.relations.hasOwnProperty(relation)) {
        relations.push(model.relations[relation]);
      }
    }
  });

  return relations;
}

/**
 * Returns an array of nodes representing the models.
 */
function mapModelsToNodes(loopbackApplication) {
  const models = loopbackApplication.models();
  const loopbackRelations = getRelations(models);
  const nodes = new Map();
  const relationsToIgnore = [];

  models.forEach((model) => {
    const modelName = model.modelName;

    /**
     * Set base node model.
     */
    const base = model.base;
    const baseNode = getOrCreateNodeEntry(nodes, new Node(base.modelName));

    const node = getOrCreateNodeEntry(nodes, new Node(modelName, baseNode));
    node.setProperties(extractNodeProperties(model.definition.properties, loopbackRelations));

    if (!_.isEmpty(model.relations)) {
      for (const relationName in model.relations) {
        if (model.relations.hasOwnProperty(relationName)) {
          const rel = model.relations[relationName];

          if (containsObject(relationsToIgnore, rel)) {
            console.log(`Relation ignored: ${rel.name}, from ${rel.modelFrom.modelName} to ${(rel.modelTo || {}).modelName}`);

            // hasOne relation
          } else if (rel.type === 'hasOne' && !rel.polymorphic) {
            handleHasOne(nodes, node, rel);

            // hasOne polymorphic relation
          } else if (rel.type === 'hasOne' && rel.polymorphic) {
            handleHasOnePolymorphic(nodes, node, rel);

            // hasMany relation
          } else if (rel.type === 'hasMany' && !rel.polymorphic && !rel.modelThrough) {
            handleHasMany(nodes, node, rel);

            // hasMany polymorphic relation
          } else if (rel.type === 'hasMany' && rel.polymorphic && !rel.modelThrough) {
            handleHasManyPolymorphic(nodes, node, rel);

            // hasManyThrough relation
          } else if (rel.type === 'hasMany' && !rel.polymorphic && rel.modelThrough && containsObject(models, rel.modelThrough)) {
            handleHasManyThrough(nodes, node, rel, relationsToIgnore);

            // hasAndBelongsToMany relation
          } else if (rel.type === 'hasMany' && !rel.polymorphic && rel.modelThrough && !containsObject(models, rel.modelThrough)) {
            handleHasAndBelongsToMany(nodes, node, rel, relationsToIgnore);

            // hasAndBelongsToMany polymorphic relation
          } else if (rel.type === 'hasMany' && rel.polymorphic && rel.modelThrough) {
            handleHasAndBelongsToManyPolymorphic(nodes, node, rel);

            // belongsTo relation
          } else if (rel.type === 'belongsTo' && !rel.polymorphic) {
            handleBelongsTo(nodes, node, rel, relationsToIgnore);
          }
        }
      }
    }
  });

  const nodeArray = [];

  for (const n of nodes.values()) {
    nodeArray.push(n);
  }

  return nodeArray;
}

/**
 * Generate the nomnoml source of the given models.
 */
function generate(loopbackApplication) {
  const nodes = mapModelsToNodes(loopbackApplication);
  return getNomnomlSourceFromNodes(nodes);
}

exports.generate = generate;
