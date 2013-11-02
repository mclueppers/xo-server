/*
 *  LDAP collection
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

function LDAP(options, models)
{
	if (!options)
	{
		options = {};
	}

	_.defaults(options, {
		'indexes': [],
	});

	LDAP.super_.call(this, models);

	this.indexes = options.indexes;
	this.prefix = options.prefix;
}
require('util').inherits(LDAP, require('../collection'));

// Private methods
LDAP.prototype._extract = function (ids)
{
	console.log('Not yet implemented');
};

LDAP.prototype._get = function (properties)
{
	console.log('Not yet implemented');
};

LDAP.prototype._add = function (models, options)
{
	throw "Adding information to LDAP is not supported. You can manage the entries by other means."
};

LDAP.prototype._remove = function (ids)
{
	throw "Removing information from LDAP is not supported. You can manage the entries by other means."
};

LDAP.prototype._update = function (models)
{
	throw "Updating information from LDAP is not supported. You can manage the entries by other means."
};

//////////////////////////////////////////////////////////////////////

LDAP.extend = require('extendable');
module.exports = LDAP;