

export default class ControllerBase {
  
  constructor(router, app, tableName, pkField) {
    this.pg = app.get('pg');
    this.table = this.pg.table(tableName, pkField || (tableName + '_id'));
    
    // sometimes classes want to do their own set up if they are overriding behaviour
    if (router) {
      router
        .get('/', this.requireRole('admin'), this.getAll)
        .get('/:id', this.requireRole('admin'), this.getSingle)
        .post('/', this.requireRole('admin'), this.add)
        .put('/', this.requireRole('admin'), this.update)
        .delete('/:id', this.requireRole('admin'), this.remove);
    }
  }
  
  
  /**
   * Gets all entries in the underlying collection.
   */
  async getAll(request, response) {
    let items = await this.table.find();
    response.json({items});
  }
  
  
  /**
   * Gets a single item specified by the given ID
   */
  async getSingle(request, response) {
    let item = await this.table.findOne(request.params.id);
    response.json(item);
  }
  
  
  /**
   * Adds a new entity to the underlying collection.
   */
  async add(request, response) {
    // save the entity
    let entity = await this.table.insert(request.body);
    this._created(entity, response);
  }
  
  
  _created(entity, response) {
    // build the URL for the new entity
    let entityUrl = request.protocol + '://' + request.get('host') + request.originalUrl + '/' + entity.id;
    
    // send HTTP 201 Created
    response.set('Location', entityUrl);
    response.status(201).send();
  }
  
  
  /**
   * Finds an entity with the same key as the supplied entity, then
   * updates the other fields to match the new entity.
   */
  async update(request, response) {
    let result = await this.table.save(request.body);

    // if it doesn't exist, send HTTP 404 Not found
    if (result.length === 0) {
      response.status(404).send();
      return;
    }
    
    // otherwise send HTTP 204 No content
    response.status(204).send();
  }
  
  
  /**
   * Removes the entity with the specified ID from the underlying collection.
   */
  async remove(request, response) {
    let result = await this.table.remove(request.params.id);
    
    // if the entity doesn't exist, send HTTP 404 Not found
    if (result.count == 0) {
      response.status(404).send();
    }
    
    // otherwise send HTTP 204 No content
    response.status(204).send();
  }
  
  
  /**
   * Returns a middleware function that checks existence of the specified role.
   */
  requireRole(role) {
    return async function (request, response, next) {
      if (!request.ticket) {
        response.status(401).send();
      } else if (request.ticket.role !== role) {
        response.status(403).send();
      } else {
        next();
      }
    };
  }
  
  
  /**
   * Returns a handler function that gets the entities by time range on the specified time field.
   */
  getByTime(timeField) {
    return async function (request, response) {
      // get the query and return if invalid
      let query = this._getByTimeQuery(timeField, request, response);
      if (!query) return;
      
      // get the actuations
      let items = await this.table.find(query);
      response.json({items});
    };
  }
  
  
  _getByTimeQuery(timeField, request, response) {
    let minTime = new Date(request.params.mintime);
    let maxTime = new Date(request.params.maxtime);

    // check if the parameters are valid
    if (isNaN(minTime.getTime()) || isNaN(maxTime.getTime())) {
      response.status(400).json({error: "invalid time in URL"});
      return null;
    }

    // make a query
    let query = {};
    query[timeField] = {$gte: minTime, $lte: maxTime};
    return query;
  }
  
  
  /**
   * Returns a handler function that gets specified child entities of the table that this controller is for.
   */
  getChildEntities(childTable, fkField) {
    return async function (request, response) {
      // get the parent
      let parent = await this._getEntity(request, response);
      if (!parent) return;
      
      // return the child items
      let query = {}
      query[fkField] = request.params.id;
      
      let items = await pg.table(childTable).find(query);
      response.json({items});
    };
  }
  
  
  async _getEntity(request, response) {
    let parent = await this.table.findOne(request.params.id);

    // check if the parent exists, send 404 if it doesn't
    if (parent === null) {
      response.status(404).send();
    }
    
    return parent;
  }
  
  
  addChildEntity(pkField, childTable, fkField) {
    if (typeof fkField === 'undefined') fkField = pkField;
    
    return async function (request, response) {
      // check the entity and bail if it's not valid
      if (!this._checkChildEntity(request.body, pkField, fkField, response)) return;

      // save it
      let entity = await this.table.insert(request.body);
      
      // TODO: this sends the wrong Location header
      this._created(entity, response);
    };
  }
  
  
  addChildEntities(pkField, childTable, fkField) {
    if (typeof fkField === 'undefined') fkField = pkField;
    
    return async function (request, response) {
      let entities = request.body.items;
      
      // check all entities
      for (let i = 0; i < entities.length; i++) {
        if (!this._checkChildEntity(entities[i], pkField, fkField, response))
          return;
      }
      
      // save all the entities
      for (let i = 0; i < entities.length; i++) {
        await this.table.insert(entities[i]);
      }
      
      response.send();
    };
  }
  
  
  _checkChildEntity(entity, pkField, fkField, response) {
    // make sure primary key isn't set to prevent conflict
    if (typeof entity[pkField] !== 'undefined') {
      response.status(400).send();
      return false;
    }
    
    // prevent submitting entities for other parents
    if (entity[fkField] !== request.params.id) {
      response.status(403).send();
      return false;
    }
    
    return true;
  }
  
  
  /**
   * Returns a handler that gets child entities in the specified time range.
   */
  getChildEntitiesByTime(childTable, fkField, timeField) {
    return async function (request, response) {
      // make sure the parent exists
      let parent = await this._getEntity(request, response);
      if (!parent) return;

      // get the time query and return if invalid
      let query = this._getByTimeQuery(timeField, request, response);
      if (!query) return;

      query[fkField] = request.params.id;

      // get the children
      let items = await this.pg.table(childTable).find(query);
      response.json({items});
    }
  }
}