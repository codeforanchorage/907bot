'use strict';
// jscs:disable requireCapitalizedComments

require('linq-es6');
let natural = require('./../modules/phrase.natural')();
let sms = require('./../modules/sms.utility');
let l = require('./logger')();

exports.basic = function(ckz, req, res, message) {
  this.req = req;
  this.res = res;
  this.message = message;
  this.ckz = ckz;

  l.c(`Parsing phrase (${message}) into command query.`);

  let phrase = natural.stem(this.message); // Tokenize and Stem message.
  let query = {
    command: undefined, // Unknown
    message: this.message, // Original message
    phrase: phrase, // Stemmed message
    value: undefined, // Unknown
  };

  let copy = require('./../data/copy.instructions');
  switch (phrase[0]) {
    case 'help': {
      l.c(`help command found.`);
      sms.respond(this.ckz, this.req, this.res, copy.help.instructions);
      query.command = 'help';
      return query;
      break;
    }
    case 'show': {
      if (phrase.length == 1) {
        l.c(`show command found with no parameter.`);
        sms.respond(this.ckz, this.req, this.res, copy.show.noparameter);
        query.command = 'show';
      } else if (phrase.length >= 2) {
        delete phrase[0]; // Remove Command from Array
        query.command = 'show';
        query.value = phrase.join(' ').trim();
        l.c(`show command found with parameter (${query.value}).`);
      }
      return query;
      break;
    }
    case 'select': {
      if (phrase.length == 1) {
        l.c(`select command found with no parameter.`);
        sms.respond(this.ckz, this.req, this.res, copy.select.noparameter);
        query.command = 'select';
      } else if (phrase.length >= 2) {
        delete phrase[0]; // Remove Command
        query.command = 'select';
        query.value = phrase.join(' ').trim();
        l.c(`select command found with parameter (${query.value}).`);
      }
      return query;
      break;
    }
    case 'remov': { // Misspelled as a result of Stemming.
      if (phrase.length == 1) {
        l.c(`remove command found with no parameter.`);
        sms.respond(this.ckz, this.req, this.res, copy.remove.noparameter);
        query.command = 'remove';
      } else if (phrase.length >= 2) {
        delete phrase[0]; // Remove Command
        query.command = 'remove';
        query.value = phrase.join(' ').trim();
        l.c(`remove command found with parameter (${query.value}).`);
      }
      return query;
      break;
    }
    default: {
      console.log('phrase.command failed to parse: ' + query.message);
      return false;
      break;
    }
  }
}

exports.notice = function(ckz, req, res, message) {
  this.req = req;
  this.res = res;
  this.message = message;
  this.ckz = ckz;

  l.c(`Parsing notification (${message}) into command query.`);

  let phrase = natural.stem(this.message); // Tokenize and Stem message.
  let notify = {
    command: [], // Empty
    message: this.message, // Original message
    resource: undefined, // Unknown ID "101 04"
    phrase: phrase, // Stemmed message
    value: undefined, // Unknown
  };

  let cmds = require('./../data/cmd.resource')
    .commands
    .asEnumerable();
  if (phrase.length >= 3) {
    let cmd = cmds
      .where(x => x.phrase[0] === phrase[0] && x.phrase[1] === phrase[1])
      .toArray();
    if (cmd.length == 1) {
      notify.command.push(cmd[0].phrase[0]); // bed
      notify.command.push(cmd[0].phrase[1]); // count
      notify.resource = cmd[0].resource; // 101 04
      delete phrase[0]; // Remove First Command
      delete phrase[1]; // Remove Second Command
      notify.value = phrase.join(' ').trim();
      return notify;
    }
    return false;
  } {
    return false;
  }
  return notify;
}
