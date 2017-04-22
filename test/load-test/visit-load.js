const requestify = require('requestify');

/* eslint-disable no-console*/
const domain = 'http://localhost:3000';
const path = '/visits/new';
const place_id = 41;


const VISITS_PER_ITERATION = 10;
const AMOUNT_OF_ITERATION = 20;
const TIME_BETWEEN_ITERATION = 1000;
let iteration = 0;

function createNewVisit() {
  return {
    macaddress: new Date(),
    place_id,
  };
}

let finished = false;
let finished_from_last_lap = 0;

function printFinishMessage() {
  finished_from_last_lap++;
  if (finished_from_last_lap === VISITS_PER_ITERATION) {
    console.log('SE TERMINO');
  }
}

const loop = setInterval(() => {
  iteration++;
  if (iteration === AMOUNT_OF_ITERATION) {
    clearInterval(loop);
    finished = true;
  }

  for (let i = 0; i < VISITS_PER_ITERATION; i++) {
    requestify.post(domain + path, createNewVisit()).then(() => {
      if (finished) {
        printFinishMessage();
      }
    }).catch((err) => {
      console.log(err);
    });
  }
}, TIME_BETWEEN_ITERATION);
