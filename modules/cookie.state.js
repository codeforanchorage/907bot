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
module.exports = function(ckz) {

  let StateEnum = new Enum({
    UNDEFINED: 0,
    REGISTER_USER: 1,
    ADD_ORGANIZATION: 2,
    SUBSCRIBE_RESOURCE: 3,
    UNSUBSCRIBE_RESOURCE: 4,
  });
  return {
    states: StateEnum,
    get: function() {
      let val = ckz.get('state');
      if (val !== undefined) {
        let num = parseInt(val);
        return StateEnum.get(num);
      }
      return StateEnum.UNDEFINED;
    },
    set: function(state) {
      let self = this;
      ckz.set('state', state.value);
    },
    getTemp: function() {
      let tmp = ckz.get('temp');
      l.c(`(Get) Temp Cookie: ${tmp}`);
      if (tmp !== undefined) {
        return tmp;
      }
      return undefined;
    },
    setTemp: function(val) {
      l.c(`(Set) Temp Cookie: ${val}`);
      ckz.set('temp', val);
    },
    reset: function() {
      l.c('(Reset) Cookie');
      let self = this;
      self.setTemp(undefined);
      self.set(self.states.UNDEFINED);
    },
  }
}
