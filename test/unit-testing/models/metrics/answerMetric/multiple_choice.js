'use strict';
process.env.NODE_ENV = 'test';

const chai = require('chai');
const dateChai = require('chai-datetime');

// const knex = require('../../../../../server/db/knex');
const AnswerMetric = require('../../../../../server/models/metrics/answerMetric');
const Answer = require('../../../../../server/models/answer');
const Question = require('../../../../../server/models/questions');

const utils = require('../../../../../server/services/utils');


// eslint-disable-next-line no-unused-vars
const assert = chai.assert;
// eslint-disable-next-line no-unused-vars
const should = chai.should();

chai.use(dateChai);


function getMultipleChoiceQuestion(questions) {
  let question = utils.randomEntry(questions);
  while (question.type !== Answer.MULTIPLE_CHOICE) {
    question = utils.randomEntry(questions);
  }
  return question;
}

// eslint-disable-next-line no-undef
describe('AnswerMetric of Question: type Multiple choice', () => {
  // eslint-disable-next-line no-undef
  it('type is not multiple_choice', (done) => {
    const question = { type: 'not multiple_choice' };
    return AnswerMetric.asMultipleOptions(question).then(() => {
      done('it should not get to here');
    }).catch((err) => {
      assert.equal(err, `Invalid type: ${question.type} is not a multiple option`);
      done();
    }).catch((err) => {
      done(err);
    });
  });

  // eslint-disable-next-line no-undef
  it('check contains all metrics', (done) => {
    return Question.all().then((questions) => {
      const question = getMultipleChoiceQuestion(questions);
      AnswerMetric.asMultipleOptions(question).then((metrics) => {
        metrics.should.be.object; // eslint-disable-line
        const options = question.options;
        for (let i = 0; i < options.length; i++) {
          const option = options[i];
          metrics.should.have.property(option.enumeration);
        }
        done();
      }).catch((err) => {
        done(err);
      });
    }).catch((err) => {
      done(err);
    });
  });
});
