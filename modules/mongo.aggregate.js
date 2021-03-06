'use strict';

let mongoose = require('mongoose');
let ssOrg = require('./../models/server.schema.organization');
let ssNotify = require('./../models/server.schema.notification');
let Notify = mongoose.model('Notification', ssNotify);
let Org = mongoose.model('Organization', ssOrg);

let l = require('./logger')();

let GetActiveNotifications = function*() {
  l.c('yielding mongo.aggregate.GetActiveNotifications');
  return yield Org.aggregate(
    [{
      $lookup: {
        from: 'activenotifications',
        localField: '_id',
        foreignField: '_id.orgid',
        as: 'notifications',
      },
    }, {
      $sort: {
        name: 1,
      },
    }, {
      $project: {
        _id: 1,
        name: 1,
        zipcode: 1,
        'notifications._id.command': 1,
        'notifications.value': 1,
        'notifications.created': 1,
      },
    }, ],
    function(err, data) {});
};

let WriteActiveNotifications = function*() {
  l.c('yielding mongo.aggregate.WriteActiveNotifications');
  return yield Notify.aggregate(
    [{
      $match: {
        created: {
          $gte: new Date(
            new Date().getFullYear() + '-' +
            new Date().getMonth() + '-' +
            (new Date().getDate())),
        },
      },
    }, {
      $sort: {
        created: -1,
      },
    }, {
      $group: {
        _id: {
          orgid: '$orgid',
          command: '$command',
        },
        weather: {
          $first: '$weather',
        },
        created: {
          $first: '$created',
        },
        value: {
          $first: '$parameter.value',
        },
      },
    }, {
      $sort: {
        name: 1,
        '_id.command': 1,
      },
    }, {
      $out: 'activenotifications',
    }, ],function(err, data) {});
}

exports.notifications = GetActiveNotifications;
exports.write = WriteActiveNotifications;
