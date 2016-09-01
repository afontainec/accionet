//server/controllers/surveyController


var path = require('path');
var Surveys = require('../models/surveys.js');

var Response = require('../models/response.js');
var Answer = require('../models/answer.js');

const Places = require('../models/places');


exports.index = function(req, res) {
    Surveys.all(function(err, result) {
      console.log(result);
        if (err) {
            res.render(path.join(__dirname, '../', '../', 'client', 'views', 'surveys', 'index.ejs'), {
                error: "ERROR: " + err,
                surveys: []
            });
        }

        res.render(path.join(__dirname, '../', '../', 'client', 'views', 'surveys', 'index.ejs'), {
            surveys: result
        });

    });

};


exports.show = function(req, res) {
    Surveys.findById(req.params.id, function(err, survey) {
        if (err) {
            res.render(path.join(__dirname, '../', '../', 'client', 'views', 'surveys', 'index.ejs'), {
                error: "ERROR:" + err,
                survey: []
            });
        }
        res.render(path.join(__dirname, '../', '../', 'client', 'views', 'surveys', 'show.ejs'), {
            survey: survey
        });

    });
};


exports.responseSurvey = function(req, res) {
    //It has to have a survey_id and it must be equal to the one in the URL
    // console.log(req.body);
    if (req.body.survey_id && req.body.survey_id == req.params.id) {
        Response.save(req.body, function(err, response) {
            if (err) {
                return res.status(400).send({
                    error: err
                });
            }
            return res.status(200).send({
                success: "enviada con exito"
            });
        });
    } else {
        //Responder con attributos mal hechos
        return res.status(400).send({
            error: "ID no válido"
        });
    }


};
