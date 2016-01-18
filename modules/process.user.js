'use strict';
// jscs:disable requireCapitalizedComments
// jscs:disable maximumLineLength

let monUser = require('./mongo.user');
let copy = require('./../data/copy.instructions');
let state = require('./cookie.state');
let sms = require('./sms.utility');
let l = require('./logger')();

let natural = require('natural');
natural.PorterStemmer.attach();

let Registered = function*(req, res, frm, ckz) {
  l.c('yielding process.user.Registered');
  let users = yield monUser.find(frm);
  return (users[0] === undefined ? false : true);
};

let Register = function*(req, res, frm, ckz, txt) {
  l.c('yielding process.user.Register');
  let user = undefined;
  // Has the user sent a message before?
  // let fc = ckz.get('firstContact');
  // if (fc === undefined) {
  //   l.c(`First time contact from number (${frm}).`);
  //   ckz.set('firstContact', true);
  //   // 2.1 Send help instructions to new users.
  //   sms.respond(ckz, req, res, copy.help.firstcontact);
  // } else {

  // Ask the user to register with their name.
  if (!state.get(ckz)) {
    state.set(ckz, state.enum().REGISTER_USER.value);
    sms.respond(ckz, req, res, copy.help.newuser);
  };

  //
  // // New user confirmation on name provided.
  // if (ckz.get('state') === 'registration' && txt.toLowerCase() !== 'yes') {
  //   ckz.set('temp', txt);
  //   sms.respond(ckz, req, res, `Is [${txt}] correct? (yes|another spelling)`);
  // } else if (ckz.get('temp')) { // Create user, say thanks!
  //   let name = ckz.get('temp');
  //   if (name !== undefined) {
  //     name = name.replace('"', '').replace('"', '');
  //   }
  //   if (name.tokenizeAndStem(true).length !== 2) {
  //     sms.respond(ckz, req, res, `Can I get a first and last name?`);
  //   } else {
  //     user = yield monUser.create(name, frm);
  //     ckz.set('state', undefined);
  //     ckz.set('temp', undefined);
  //     sms.respond(ckz, req, res, `Thanks [${name}], you are now a registered user! Use 'help' for a list of bot commands.`);
  //   }
  // }
  // }
};

let AddNotification = function*(orgid, frm, notify) {
  l.c('yielding process.user.AddNotification');
  return yield monUser.notify(orgid, frm, notify);
};

exports.registered = Registered;
exports.register = Register;
exports.notify = AddNotification;
