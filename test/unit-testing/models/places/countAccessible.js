'use strict';
process.env.NODE_ENV = 'test';

const chai = require('chai');

const Place = require('../../../../server/models/places');
const User = require('../../../../server/models/users');
const Access = require('../../../../server/models/access');
const knex = require('../../../../server/db/knex');


// eslint-disable-next-line no-unused-vars
const assert = chai.assert;
// eslint-disable-next-line no-unused-vars
const should = chai.should();


function getUser() {
  const i = 3;
  return {
    username: `username for access place ${i}`,
    password: 'password',
    email_verified: 'true',
    email: 'a@a.cl',
  };
}

function getAdmin() {
  return {
    username: 'username for access place admin',
    password: 'password',
    email_verified: 'true',
    email: 'a@a.cl',
    is_admin: true,

  };
}

function getPlace() {
  return {
    name: 'name',
  };
}

function makeAccess(to, user_id, access_type) {
  return {
    to,
    user_id,
    in: Place.table_name,
    access_type,
  };
}

function clearBD() {
  return Promise.all([knex('users').del(), knex('places').del()]);
}


let user;
let admin;
let places;

// eslint-disable-next-line no-undef
describe('Get places to which he has access.', () => {
  // eslint-disable-next-line no-undef
  before((done) => {
    return clearBD().then(() => {
      Promise.all([Place.save(getPlace()), Place.save(getPlace()), Place.save(getPlace()), User.save(getUser()), User.save(getAdmin())]).then((results) => {
        user = results[3];
        admin = results[4];
        places = results.slice(0, 3);
        const promises = [];
        promises.push(Access.save(makeAccess(places[0].id, user.id, 'r')));
        promises.push(Access.save(makeAccess(places[1].id, user.id, 'r/w')));
        Promise.all(promises).then(() => {
          done();
        }).catch((err) => {
          done(err);
        });
      }).catch((err) => {
        done(err);
      });
    }).catch((err) => {
      done(err);
    });
  });

  // eslint-disable-next-line no-undef
  it('check count to be the correct amount', (done) => {
    return Place.countAccessibleBy(user.id).then((count) => {
      assert.equal(count, 2);
      done();
    }).catch((err) => {
      done(err);
    });
  });


  // eslint-disable-next-line no-undef
  it('If user is admin', (done) => {
    return Place.countAccessibleBy(admin.id).then((count) => {
      assert.equal(count, 3);
      done();
    }).catch((err) => {
      done(err);
    });
  });
});
