'use strict';

// jscs:disable requireCapitalizedComments
// jscs:disable disallowNewlineBeforeBlockStatements

let Enum = require('enum');
let l = require('./logger')();

/*
cookie index
state: nature of the messages
      /-- Cookie 'State' List --/
      registration: new user registration.
      addResource: associate user with resource type.
      addOrganization: associate user with organization.
      firstContact: is this the first time number has SMS'd us?
      resourceId: user selects specific resource.
      undefined: un-used, reset status.
      temp: temporary value storage between messages.
*/

let GetState = function(ckz) {
  let val = ckz.get('state');
  if (val !== undefined) {
    let num = parseInt(val);
    return StateEnum().get(num);
  }
  return StateEnum.UNDEFINED;
};

let SetState = function(ckz, state) {
  let se = StateEnum().get(state);
  switch (se.key) {
    case 'UNDEFINED':
      {
        l.c('Setting state to UNDEFINED');
        ckz.set('state', state);
        break;
      }
    case 'REGISTER_USER':
      {
        l.c('Setting state to REGISTER_USER');
        ckz.set('state', state);
        break;
      }
    case 'ADD_ORGANIZATION':
      {
        l.c('Setting state to ADD_ORGANIZATION');
        ckz.set('state', state);
        break;
      }
    case 'SUBSCRIBE_RESOURCE':
      {
        l.c('Setting state to SUBSCRIBE_RESOURCE');
        ckz.set('state', state);
        break;
      }
    case 'UNSUBSCRIBE_RESOURCE':
      {
        l.c('Setting state to UNSUBSCRIBE_RESOURCE');
        ckz.set('state', state);
        break;
      }
    default:
      {
        l.c('SetState passed through to default:');
        break;
      }
  }
}

let GetTemp = function(ckz) {
  let tmp = ckz.get('temp');
  if (tmp !== undefined) {
    return tmp;
  }
  return undefined;
}

let SetTemp = function(ckz, val) {
  l.c(`Setting temp bag: ${val}`);
  ckz.set('temp', val);
}

let StateEnum = function() {
  let state = new Enum({
    UNDEFINED: 0,
    REGISTER_USER: 1,
    ADD_ORGANIZATION: 2,
    SUBSCRIBE_RESOURCE: 3,
    UNSUBSCRIBE_RESOURCE: 4,
  });
  return state;
}

exports.enum = StateEnum;
exports.temp = GetTemp;
exports.get = GetState;
exports.set = SetState;
