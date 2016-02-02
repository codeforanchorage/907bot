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
let monUser = require('./mongo.user'); // migrate this to process.user
let organization = require('./process.organization');
let sms = require('./sms.utility');
let l = require('./logger')();

module.exports = function() {
  return {
    Parser: function*(query, req, res, frm, txt, ckz) {
      let state = require('./cookie.state')(ckz);
      // Parse incoming text message.
      let phrase = phraseN.tag(txt);
      let tags = phrase.tags.asEnumerable();
      let responded = false;
      let st = state.get(ckz);
      l.c(`Parsing Cookie State: ${st}`);
      switch (st) {
        case state.states.REGISTER_USER:
          {
            // 1. Phrase tagged?
            if (tags.toArray().length !== 0) {
              // 1.1 Do we have a Yes/No answer?
              let yes = tags.where(x => x[0] === 'interjection')
                .toArray()[0]
                .asEnumerable()
                .where(x => x === 'yes')
                .toArray();
              if (yes.length === 1) {
                let tmp = state.getTemp();
                yield monUser.create(tmp, frm);
                sms.respond(ckz, req, res, copy.register.success
                  .replace('{0}', tmp));
                responded = true;
              } else {
                sms.respond(ckz, req, res, copy.register.spelling);
                responded = true;
              }
            } else {
              // 1.2 Not tagged, likely user's name.
              if (txt.tokenizeAndStem(true).length !== 2) {
                sms.respond(ckz, req, res, copy.register.firstlast);
                responded = true;
              } else {
                state.setTemp(txt);
                sms.respond(ckz, req, res, copy.register.confirm
                  .replace('{0}', txt));
                responded = true;
              }
            }
            break;
          }
        case state.states.ADD_ORGANIZATION:
          {

            // l.c(state.getTemp());
            // 1. Phrase tagged?
            // if (tags.toArray().length !== 0) {
            // // 1.1 Do we have a Yes/No answer?
            // let yes = tags.where(x => x[0] === 'interjection')
            //   .toArray()[0]
            //   .asEnumerable()
            //   .where(x => x === 'yes')
            //   .toArray();
            // if (yes.length === 1) {
            //   let tmp = state.getTemp();
            //   state.reset();
            //   let org = yield organization.select(tmp);
            //   let n = org[0].name.replace('"', '').replace('"', '');
            //   sms.respond(ckz, req, res, copy.register.orgadd
            //     .replace('{0}', n));
            //   responded = true;
            // } else {
            //   sms.respond(ckz, req, res, copy.register.spelling);
            //   responded = true;
            // }
            // } else {

            if (state.getTemp() !== undefined) {
              let org = organization.get(req, res, frm, ckz, txt);
              if (!org) {
                // sms.respond(ckz, req, res, 'copy.instructions.orgnotfound');
                  // .single(x => x.name == 'orgnotfound')
                  //   .copy
                  //   .replace('{0}', txt));
              } else {
                yield organization.find(req, res, frm, txt, ckz);
                sms.respond(ckz, req, res, copy.instructions.orgnotfound);
              }
            }
            responded = true;
            break;
          }
      }
      return responded;
    },
  }
};
