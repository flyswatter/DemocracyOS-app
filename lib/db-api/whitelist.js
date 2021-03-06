/**
 * Extend module's NODE_PATH
 * HACK: temporary solution
 */

require('node-path')(module);

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Whitelist = mongoose.model('Whitelist');
var utils = require('lib/utils');
var pluck = utils.pluck;
var log = require('debug')('democracyos:db-api:whitelist');

/**
 * Get all whitelist
 *
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'whitelist' list whitelists found or `undefined`
 * @return {Module} `whitelist` module
 * @api public
 */

exports.all = function all(fn) {
  log('Looking for all whitelists')

  Whitelist
  .find({  })
  .select('id type value')
  .exec(function (err, whitelist) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    };

    log('Delivering whitelist %j', pluck(whitelist, 'id'));
    fn(null, whitelist);
  });

  return this;
};

/**
 * Get Whitelist form `id` string or `ObjectId`
 *
 * @param {String|ObjectId} id Whitelist's `id`
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'whitelist' found item or `undefined`
 * @api public
 */

exports.get = function get(id, fn) {
  log('Looking for whitelist %s', id);
  Whitelist
  .findById(id)
  .exec(function (err, whitelist) {
    if (err) {
      log('Found error %s', err);
      return fn(err);
    };

    if (!whitelist) {
      log('Whitelist %s not found', id);
      return fn(null);
    }
    log('Delivering whitelist %s', whitelist.id);
    fn(null, whitelist);
  });
};

/**
 * Search whitelists from query
 *
 * @param {Object} query filter
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'whitelists' list of whitelists objects found or `undefined`
 * @return {Module} `whitelist` module
 * @api public
 */

exports.search = function search(query, fn) {
  log('Searching for whitelists matching %j', query);

  Whitelist
    .find(query, function(err, whitelists) {
    if (err) {
      log('Found error: %j', err);
      return fn(err);
    }

    log('Found whitelists %j for %j', pluck(whitelists, 'id'), query);
    fn(null, whitelists);
  });

  return this;
};

/**
 * Creates whitelist
 *
 * @param {Object} data to create whitelist
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'whitelist' whitelist created or `undefined`
 * @return {Module} `whitelist` module
 * @api public
 */

exports.create = function create(data, fn) {
  log('Creating new whitelist %j', data);
  var whitelist = new Whitelist(data);
  whitelist.save(onsave);

  function onsave(err) {
    if (err) return log('Found error %s', err), fn(err);

    log('Saved whitelist %s', whitelist.id);
    fn(null, whitelist);
  }

  return this;
};

/**
 * Update whitelist by `id` and `data`
 *
 * @param {ObjectId|String} data to create whitelist
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'whitelist' item created or `undefined`
 * @return {Module} `whitelist` module
 * @api public
 */

exports.update = function update(id, data, fn) {
  log('Updating whitelist %s with %j', id, data);

  exports.get(id, onget);

  function onget(err, whitelist) {
    if (err) {
      log('Found error %s', err.message);
      return fn(err);
    };

    // update and save whitelist document with data
    whitelist.set(data);
    whitelist.save(onupdate);
  }

  function onupdate(err, whitelist) {
    if (!err) return log('Saved whitelist %s', whitelist.id), fn(null, whitelist);
    return log('Found error %s', err), fn(err);
  }

  return this;
};

/**
 * Remove whitelist
 *
 * @param {String} id
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 * @api public
 */

exports.remove = function remove(id, fn) {
  exports.get(id, function (err, whitelist) {
    if (err) return fn(err);

    whitelist.remove(function(err) {
      if (err) return log('Found error %s', err), fn(err);

      log('Whitelist %s removed', whitelist.id);
      fn(null);
    });
  })
};
