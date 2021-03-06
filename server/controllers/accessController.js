//
const User = require('../models/users');
const Access = require('../models/access');
const httpResponse = require('../services/httpResponse');


exports.fromUser = function (req, res) {
  const user_id = req.params.id;
  Access.find({ user_id }, 'all', true).then((results) => {
    const json = httpResponse.success('Ok', 'data', results);
    return res.status(200).send(json);
  }).catch((err) => {
    return res.status(500).send({
      error: err,
    });
  });
};

exports.editFromUser = function (req, res) {
  const id = req.params.id;
  const newAccess = req.body;
  User.editAccess({ id }, newAccess).then((results) => {
    const json = httpResponse.success('Ok', 'data', results);
    return res.status(200).send(json);
  }).catch((err) => {
    return res.status(500).send({
      error: err,
    });
  });
};
