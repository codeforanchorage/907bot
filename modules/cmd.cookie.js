'use strict';

// jscs:disable disallowNewlineBeforeBlockStatements
// jscs:disable maximumLineLength
// jscs:disable requireCapitalizedComments

// Third party
let natural = require('natural');
natural.PorterStemmer.attach();
require('linq-es6');

// Internal
let copy = require('./../data/copy.instructions');
let phraseN = require('./phrase.natural')();
let monUser = require('./mongo.user');
let sms = require('./sms.utility');
let l = require('./logger')();

module.exports = function() {
  return {
    Parser: function*(req, res, frm, txt, ckz) {
      let state = require('./cookie.state')(ckz);
      // Parse incoming text message.
      let phrase = phraseN.tag(txt);
      let tags = phrase.tags.asEnumerable();
      switch (state.get(ckz)) {
        case state.states.REGISTER_USER:
          {
            // 2.1 Was phrase tagged?
            if (tags.toArray().length !== 0) {
              // 2.1 Do we have a Yes/No answer?
              if (tags.where(x => x[0] === 'interjection').toArray().length) {
                let yn = tags.where(x => x[0] === 'interjection').toArray()[0][1];
                if (yn == 'yes') {
                  let tmp = state.getTemp();
                  yield monUser.create(tmp, frm);
                  state.reset();
                  l.c(`Added: ${tmp} from ${frm}`);
                  sms.respond(ckz, req, res, copy.register.success
                    .replace('{0}', tmp));
                } else {
                  sms.respond(ckz, req, res, copy.register.spelling);
                }
              }
            } else {
              // 2.2 Phrase has no tags.
              if (txt.tokenizeAndStem(true).length !== 2) {
                sms.respond(ckz, req, res, copy.register.firstlast);
              } else {
                state.setTemp(txt);
                sms.respond(ckz, req, res, copy.register.confirm
                  .replace('{0}', txt));
              }
            }
            break;
          }
        case 'ADD_ORGANIZATION':
          {
            l.c('ADD_ORGANIZATION');
            break;
          }
        case 'SUBSCRIBE_RESOURCE':
          {
            l.c('SUBSCRIBE_RESOURCE');
            break;
          }
        case 'UNSUBSCRIBE_RESOURCE':
          {
            l.c('UNSUBSCRIBE_RESOURCE');
            break;
          }
      }

      return sms.responded();
    },
  }
};
