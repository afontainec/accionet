// server/models/questions.js
'use strict';


const q = require('q');
const base = require('../models/base');

const Options = require('../models/options');

const table_name = 'questions';


// Return all the entries active or not
exports.all = function getAllQuestions(callback) {
    base.all(table_name, callback);
};

// Creates a json representing an empty entry
exports.new = function newQuestion(callback) {
    base.new(table_name, callback);
};

// Creates a json with the attr in attr
exports.save = function saveQuestionAndOptions(attr, callback) {
    const deferrer = q.defer();
    base.save(attr, table_name, (err, question) => {
        const options = attr.options;

        let saved = 0;

        if (options && options.length && options.length > 0) {
            for (let i = 0; i < options.length; i++) {
                options[i].question_id = question.id;
                Options.save(options[i], (err_opt) => {
                    if (err_opt) {
                        deferrer.reject(err_opt);
                    }
                    saved += 1;
                    if (saved === options.length) {
                        deferrer.resolve(question);
                    }
                });
            }
        } else {
            deferrer.resolve(question);
        }
        deferrer.promise.nodeify(callback);
        return deferrer.promise;
    });
};

exports.update = function updateQuestion(id, attr, callback) {
    base.update(id, attr, table_name, callback);
};

exports.updateQuestionsOfSurvey = function (survey, callback) {
    const attr = {
        survey_id: survey.id,
    };

    base.find(attr, table_name, (err, questions) => {
        if (err) {
            return callback(err);
        }

        const totalQueries = questions.length;
        let finishedQueries = 0;
        for (let i = 0; i < questions.length; i++) {
            let indexOfUpdate = -1;
            for (let j = 0; j < survey.questions.length; j++) {
                if (questions[i].id === survey.questions[j]) {
                    indexOfUpdate = j;
                    break;
                }
            }

            // if it doesnt have an update then it has to be deleted
            if (indexOfUpdate === -1) {
                base.delete(questions.id, table_name, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    finishedQueries++;
                    if (finishedQueries === totalQueries) {
                        return callback(null, survey.questions);
                    }
                });
            }
        }
        callback(null, questions);
    });
};

exports.findById = function findQuestionById(id, callback) {
    base.findById(id, table_name, callback);
};

exports.findOne = function findFirstQuestion(id, attr, callback) {
    base.findOne(id, attr, table_name, callback);
};

exports.columnNames = function getAttributes(callback) {
    base.columnNames(table_name, callback);
};
