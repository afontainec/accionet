// server/models/table.js
'use strict';

const knex = require('../db/knex');
const utils = require('../services/utils');


class Table {

  constructor(table_name) {
    this.table_name = table_name;
  }

  toString() {
    return this.table_name;
  }

  table() {
    return knex(this.table_name);
  }


  // ################################################
  // CUD FROM CRUD
  // ################################################

  new() {
    const table_name = this.table_name;
    return new Promise((resolve, reject) => {
      knex('information_schema.columns').select('column_name').where({
        table_name,
      }).then((attributes) => {
          // check if attributes is an array
        if (!attributes || attributes.length === 0) {
          return reject(`Hubo un error creando un nuevo objeto: ${table_name}`);
        }
        const entry = {};
        attributes.forEach((attribute) => {
          entry[attribute.column_name] = null;
        });
        resolve(entry);
      })
        .catch((err) => {
          reject(err);
        });
    });
  }

  save(originalEntry) {
    const errorString = 'Something went wrong';

    // make a clone so if we delete stuff from entry it does not modify the original one
    const entry = utils.cloneJSON(originalEntry);
    return new Promise((resolve, reject) => {
      this.parseAttributesForUpsert(entry, true)
        .then((attributes) => {
          this.table().insert(attributes).returning('*').then((entry) => {
              // check if attributes is an array
            if (!entry || entry.length === 0) {
              return reject(errorString);
            }
            resolve(entry[0]);
          })
            .catch((err) => { //eslint-disable-line
              console.log(err);
              reject(errorString);
            });
        }).catch((err) => {
          reject(err);
        });
    });
  }

  update(id, originalAttributes) {
    const attr = utils.cloneJSON(originalAttributes);
    const errorString = 'Something went wrong';
    return new Promise((resolve, reject) => {
      this.findById(id).then(() => {
        if (attr && attr.id && id !== attr.id) {
          return reject('Given IDs differ');
        }
        this.parseAttributesForUpsert(attr, false).then((attributes) => {
          this.table().where({
            id,
          }).update(attributes).returning('*')
            .then((entry) => {
              // check if attributes is an array
              if (!entry || entry.length === 0) {
                return reject(errorString);
              }
              resolve(entry[0]);
            })
            .catch(() => {
              reject(errorString);
            });
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      this.table().where({
        id,
      }).del().returning('*')
        .then((entry) => {
          // check if attributes is an array
          if (!entry || entry.length === 0) {
            return reject('Hubo un error eliminando la entrada');
          }
          resolve(entry[0]);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }


  // ################################################
  // Find (R from CRUD)
  // ################################################
  all(columns) {
    return this.find({}, columns);
  }

  parseToSend(entry) {
    return new Promise((resolve) => {
      resolve(entry);
    });
  }

  find(attributes, columns) {
    return new Promise((resolve, reject) => {
      // If it speciffically say that columns.table_name is an empty array then he is asking for no columns
      let columnsForThisTable;
      if (columns) {
        columnsForThisTable = columns[this.table_name];
      } else {
        columnsForThisTable = undefined;
      }
      if (columns && Array.isArray(columns[this.table_name]) && columns[this.table_name].length === 0) {
        resolve([]);
        return;
      }
      this.filterColumns(columnsForThisTable).then((columnsOfThisTable) => {
        this.filterAttributes(attributes)
            .then((filteredAttributes) => {
              this.table().select(columnsOfThisTable).where(filteredAttributes).then((results) => {
                const promises = [];
                for (let i = 0; i < results.length; i++) {
                  promises.push(this.parseToSend(results[i], columns));
                }
                const allPromises = Promise.all(promises);
                allPromises.then((response) => {
                  resolve(response);
                }).catch((err) => {
                  reject(err);
                });
                  // return resolve(results);
              })
                .catch(() => {
                  reject('Find parameter was not defined correctly');
                });
            })
            .catch((err) => {
              reject(err);
            });
      })
        .catch((err) => {
          reject(err);
        });
    });

    //
  }

  findById(id, columns) {
    const attributes = {
      id,
    };
    return new Promise((resolve, reject) => {
      this.find(attributes, columns).then((entries) => {
        if (entries.length !== 0) {
          return resolve(entries[0]);
        }
        reject(`No se encontró una entrada con id = ${id}`);
      })
        .catch((error) => {
          reject(error);
        });
    });
  }


  // ################################################
  // Miscelaneous
  // ################################################

  getFirstDate() {
    return new Promise((resolve, reject) => {
      this.table().select('created_at').orderBy('created_at', 'asc').first()
        .then((results) => {
          if (results && results.created_at) {
            return resolve(results.created_at);
          }
          return reject('No se encontró una respuesta válida');
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getAttributesNames() {
    const table_name = this.table_name;
    return new Promise((resolve, reject) => {
      knex('information_schema.columns').select('column_name').where({
        table_name,
      }).then((results) => {
          // check if results is an array
        if (!results || results.length === 0) {
          return reject(`Hubo un error creando un nuevo objeto: ${table_name}`);
        }
        const attributes = [];
        results.forEach((attribute) => {
          attributes.push(attribute.column_name);
        });
        resolve(attributes);
      })
        .catch((err) => {
          reject(err);
        });
    });
  }

  filterColumns(columns) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(columns)) {
        resolve([]);
        return;
      }
      this.getAttributesNames().then((attributes) => {
        const thisTableColumns = [];
        for (let i = 0; i < attributes.length; i++) {
          if (columns.indexOf(attributes[i]) > -1) {
            thisTableColumns.push(attributes[i]);
          }
        }
        resolve(thisTableColumns);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  count(attr) {
    if (!attr) {
      attr = {};
    }
    return new Promise((resolve, reject) => {
      this.table().count('*').where(attr)
        .then((results) => {
          if (results[0].count) {
            return resolve(results[0].count);
          }
          reject('No se encontró una respuesta válida');
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // ################################################
  // 'Private' methods (static)
  // ################################################

  // eslint-disable-next-line
  static addTimestamps(attr, isNew) {
    if (isNew) {
      attr.created_at = new Date();
    }
    attr.updated_at = new Date();
  }

  // Makes sure not to go searching for wierd stuff
  filterAttributes(attributes) {
    return new Promise((resolve, reject) => {
      if (!utils.isJSON(attributes)) {
        return reject('Parameter should be a valid json');
      }

      this.getAttributesNames().then((attributeNames) => {
        const filteredAttributes = {};
        for (let i = 0; i < attributeNames.length; i++) {
          const attributeName = attributeNames[i];
          if (attributeName in attributes) {
            filteredAttributes[attributeName] = attributes[attributeName];
              // remove the key
            delete attributes[attributeName];
          }
        }
          // if there are still keys left its because there where attributes that do not correspond
        if (Object.keys(attributes).length !== 0) {
          let attr = '';
          for (let i = 0; i < Object.keys(attributes).length; i++) {
            attr += ` ${Object.keys(attributes)[i]}.`;
          }
          return reject(`Cannot add attribute: ${attr}`);
        }
        return resolve(filteredAttributes);
      })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  static removeUnSetableAttributes(attributes) {
    delete attributes.id;
    delete attributes.created_at;
    delete attributes.updated_at;
  }

  parseAttributesForUpsert(attributes, isNew) {
    return new Promise((resolve, reject) => {
      Table.removeUnSetableAttributes(attributes);
      this.filterAttributes(attributes).then((filteredAttributes) => {
        Table.removeUnSetableAttributes(filteredAttributes);

        if (utils.isEmptyJSON(filteredAttributes)) {
          return reject('Paremeter should not be empty');
        }

        Table.addTimestamps(filteredAttributes, isNew);
        resolve(filteredAttributes);
      })
        .catch((err) => {
          reject(err);
        });
    });
  }

}

module.exports = Table;
