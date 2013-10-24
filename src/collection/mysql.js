/*
 *  MySQL collection
 *  Copyright (C) 2013 Martin Dobrev <martin.dobrev@unixsol.co.uk>
 *  UNIXSOL LTD, registered company in UK and Wales
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  @autor: Martin Dobrev <martin.dobrev@unixsol.co.uk>
**/

var _ = require('underscore');
var Q = require('q');

function MySQL(options, models)
{
	if (!options)
	{
		options = {};
	}

	if (!options.uri)
	{
		throw 'MySQL missing option: uri';
	}

	_.defaults(options, {
		'indexes': [],
	});

	MySQL.super_.call(this, models);

	this.uri = options.uri;
	this.indexes = options.indexes;
	this.prefix = options.prefix;
}
require('util').inherits(MySQL, require('../collection'));

// Private methods
MySQL.prototype._extract = function (ids)
{
	var knex = require('knex').knex;
	
	// @todo make it global
	var perms = {
			0: 'none',
			1: 'read',
			2: 'write',
			3: 'admin',
		};

	var promises = [];

	_.each(ids, function (id) {
		promises.push(knex('users').where('email', id).andWhere('active', 1).select('password', 'email', 'permissions').then(function (model)
		{
			if (_.isEmpty(model))
			{
				return null;
			}
			// Return the model
			var result = 
			{
				id: id,
				email: model[0].email,
				pw_hash: model[0].password,
				permission: perms[model[0].permissions],
			};
			return result;
		}));
	});

	return Q.all(promises).then(function (models) {
		return _.filter(models, function (model) {
			return (null !== model);
		});
	});
};

MySQL.prototype._get = function (properties)
{
	var knex = require('knex').knex;
	var self = this;

	if (_.isEmpty(properties))
	{
		return knex('users').select('email').then(function (ids) {
			var result = [];
			for (var i=0, n=ids.length; i<n; i++)
			{
				result.push(ids[i].email);
			}
			return self._extract(result);
		});
	}

	// Special treatment for 'id'.
	var id = properties.id;
	delete properties.id;

	// Special case where we only match against id.
	if (_.isEmpty(properties))
	{
		return this._extract([id]);
	}

	var indexes = this.indexes;
	var unfit = _.difference(_.keys(properties), indexes);
	if (0 !== unfit.length)
	{
		throw 'not indexed fields: '+ unfit.join();
	}

	var keys = _.map(properties, function (value, index) {
		return [value];
	});

	return knex('users').where('email', keys).andWhere('active', 1).select('email').then(function (ids) {
		if (undefined !== id)
		{
			if (!_.contains(ids, id.email))
			{
				return [];
			}

			ids = [id];
		}

		return self._extract([ids[0].email]);
	});
};

MySQL.prototype._add = function (models, options)
{
	// @todo Temporary mesure, implement “set()” instead.
	var replace = !!(options && options.replace);

	var knex = require('knex').knex;
	var indexes = this.indexes;

	var promises = [];
	
	// @todo dirty
	var perms = {
			'none': 0,
			'read': 1,
			'write': 2,
			'admin': 3,
		};

	_.each(models, function (model) {
		var promise;

		// Extend the schema adding missing values
		var tday = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); // @todo: use of nodejs library maybe?!

		var data = {
			email: model.email,
			password: model.pw_hash,
			permissions: perms[model.permission],
			username: model.email,
			created: tday,
			lastlogin: '0000-00-00 00:00:00',
			active: 1,
			activationtoken: null
		};

		console.log(data);

		if (!replace) {
			promises.push(knex('users').insert(data));
		} else {
			promises.push(knex('users').where('email', model.email).update(data));
		}
	});

	return Q.all(promises);
};

MySQL.prototype._remove = function (ids)
{
	var knex = require('knex').knex;
	var prefix = this.prefix;

	var promises = [];

	var keys = [];
	for (var i = 0, n = ids.length; i < n; ++i)
	{
		keys.push(ids[i]);
	}

	console.log(keys);
	console.log(ids);

	// @todo Handle indexes.
	//promises.push(knex('users').whereIn('email', keys).del());

	promises.push(true);

	return Q.all(promises);
};

MySQL.prototype._update = function (models)
{
	console.info('Not yet implemented: _update');
};


//////////////////////////////////////////////////////////////////////

MySQL.extend = require('extendable');
module.exports = MySQL;
