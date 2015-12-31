'use strict';
// jscs:disable requireCapitalizedComments

require('linq-es6');
let natural = require('natural');
natural.PorterStemmer.attach();

let monUser = require('./mongo.organization');
let sms = require('./sms.utility');
let data = require('./data.sources')();
let l = require('./logger')();
let copy = require('./../data/copy.sms')
  .services
  .asEnumerable();

let GetOrganization = function*(req, res, frm, ckz, txt) {
  // 1. See if org is in PCG Charity list.
  let pcglist = yield data.csv('./data/charities.csv');
  let charity = [];
  charity = pcglist.asEnumerable().where(x => x == txt).toArray();
  if (charity.length == 1) {
    // Save / Find
    let dbOrg = require('./mongo.organization');
    let org = yield dbOrg.get(txt);

    l.c(`Found an organization (${txt}), notify user, ask follow-up.`);

    // We found an Organization.
    ckz.set('temp', org._id); // Save Org ID
    sms.respond(ckz, req, res, copy
      .single(x => x.name == 'orgfound')
      .copy
      .replace('{0}', txt));

    // Follow-up - Can we associate you to this Organization?
    sms.send(frm, process.env.TWILIO_PHONENUMBER, copy
      .single(x => x.name == 'associateorg')
      .copy
      .replace('{0}', org.name));

  } else {

    l.c(`No match for organization (${txt}).`);

    // Organization name wasn't found
    ckz.set('temp', undefined);
    sms.respond(ckz, req, res, copy
      .single(x => x.name == 'orgnotfound')
      .copy
      .replace('{0}', txt));
  }
};

let FindOrganization = function*(query, req, res, frm, txt, ckz) {
  ckz.set('state', 'addOrganization');
  sms.respond(ckz, req, res, copy
    .single(x => x.name == 'addorg')
    .copy);
};

exports.get = GetOrganization;
exports.find = FindOrganization;
