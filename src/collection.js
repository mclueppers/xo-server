var _ = require('underscore');
var Q = require('q');

//////////////////////////////////////////////////////////////////////

function Collection()
{
	// Parent constructor.
	Collection.super_.call(this);
}
require('util').inherits(Collection, require('events').EventEmitter);

Collection.prototype.model = require('./model');

/**
 * Adds new models to this collection.
 */
Collection.prototype.add = function (models, options) {
	var array = true;
	if (!_.isArray(models))
	{
		models = [models];
		array = false;
	}

	for (var i = 0, n = models.length; i < n; ++i)
	{
		var model = models[i];

		if ( !(model instanceof this.model) )
		{
			model = new this.model(model);
		}

		var error = model.validate();
		if (undefined !== error)
		{
			// @todo Better system inspired by Backbone.js.
			throw error;
		}

		models[i] = model.properties;
	}

	var self = this;
	return Q.when(this._add(models, options), function (models) {
		self.emit('add', models);

		if (!array)
		{
			return models[0];
		}
		return models;
	});
};

/**
 *
 */
Collection.prototype.first = function (properties) {
	if (!_.isObject(properties))
	{
		properties = (undefined !== properties)
			? { 'id': properties }
			: {}
		;
	}

	var self = this;
	return Q.when(this._first(properties), function (model) {
		if (!model)
		{
			return null;
		}

		return new self.model(model);
	});
};

/**
 * Find all models which have a given set of properties.
 *
 * /!\: Does not return instances of this.model.
 */
Collection.prototype.get = function (properties) {
	// For coherence with other methods.
	if (!_.isObject(properties))
	{
		properties = (undefined !== properties)
			? { 'id': properties }
			: {}
		;
	}

	/* jshint newcap: false */
	return Q(this._get(properties));
};


/**
 * Removes models from this collection.
 */
Collection.prototype.remove = function (ids) {
	if (!_.isArray(ids))
	{
		ids = [ids];
	}

	var self = this;
	return Q.when(this._remove(ids), function () {
		self.emit('remove', ids);
		return true;
	});
};

/**
 * Smartly updates the collection.
 *
 * - Adds new models.
 * - Updates existing models.
 * - Removes missing models.
 */
// Collection.prototype.set = function (/*models*/) {
// 	// @todo
// };

/**
 * Updates existing models.
 */
Collection.prototype.update = function (models) {
	var array = true;
	if (!_.isArray(models))
	{
		models = [models];
		array = false;
	}

	for (var i = 0, n = models.length; i < n; i++)
	{
		var model = models[i];

		if ( !(model instanceof this.model) )
		{
			// @todo Problems, we may be mixing in some default
			// properties which will overwrite existing ones.
			model = new this.model(model);
		}

		var id = model.get('id');

		// Missing models should be added not updated.
		if (!id)
		{
			return Q.reject('a model without an id cannot be updated');
		}

		var error = model.validate();
		if (undefined !== error)
		{
			// @todo Better system inspired by Backbone.js.
			throw error;
		}

		models[i] = model.properties;
	}

	var self = this;
	return Q.when(this._update(models), function (models) {
		self.emit('update', models);

		if (!array)
		{
			return models[0];
		}
		return models;
	});
};

//Collection.extend = require('extendable');

//////////////////////////////////////////////////////////////////////
// Methods to override in implentations.
//////////////////////////////////////////////////////////////////////

/**
 *
 */
Collection.prototype._add = function (models, options) {
	throw 'not implemented';
};

/**
 *
 */
Collection.prototype._get = function (properties) {
	throw 'not implemented';
};

/**
 *
 */
Collection.prototype._remove = function (ids) {
	throw 'not implemented';
};

/**
 *
 */
Collection.prototype._update = function (models) {
	throw 'not implemented';
};

//////////////////////////////////////////////////////////////////////
// Methods which may be overriden in implentations.
//////////////////////////////////////////////////////////////////////

/**
 *
 */
Collection.prototype.count = function (properties) {
	return this.get(properties).then(function (models) {
		return models.length;
	});
};

/**
 *
 */
Collection.prototype.exists = function (properties) {
	return this.first(properties).then(function (model) {
		return (null !== model);
	});
};

/**
 *
 */
Collection.prototype._first = function (properties) {
	return Q.when(this.get(properties), function (models) {
		if (0 === models.length)
		{
			return null;
		}

		return models[0];
	});
};

//////////////////////////////////////////////////////////////////////

module.exports = Collection;
