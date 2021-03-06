const pg = require('pg');
const path = require('path');


const connectionString = require(path.join(__dirname, '../', '../', '../', 'config'));

const client = new pg.Client(connectionString);
client.connect();
let ended_queries = 0;

const queries = [];

function closeConnection() {
    ended_queries += 1;
    if (ended_queries >= queries.length) {
        client.end();
    }
}


// NEW TABLES

queries.push(client.query('CREATE TABLE hotspot(id SERIAL PRIMARY KEY,name VARCHAR(200), description VARCHAR(800), is_active BOOLEAN, created_at TIMESTAMP, updated_at TIMESTAMP, survey_id INTEGER references surveys(id))'));
queries[queries.length - 1].on('end', () => {
        // client.end();
    console.log('Tabla hotspot creada');

    queries.push(client.query('CREATE TABLE visits(id SERIAL PRIMARY KEY, created_at TIMESTAMP, updated_at TIMESTAMP, os VARCHAR(200), browser VARCHAR(200), ip VARCHAR(200), macaddress VARCHAR(200), other VARCHAR(800), place_id INTEGER references places(id) ON DELETE CASCADE, hotspot_id INTEGER references hotspot(id) ON DELETE CASCADE)'));
    queries[queries.length - 1].on('end', () => {
            // client.end();
        console.log('Tabla visits creada');
        closeConnection();
    });


    queries.push(client.query('ALTER TABLE places ADD COLUMN hotspot_id INTEGER references hotspot(id)'));
    queries[queries.length - 1].on('end', () => {
            // client.end();
        console.log('Se agrego columna hostpot_id a tabla places');
        closeConnection();
    });
    closeConnection();
});


// ALTER TABLE


queries.push(client.query('ALTER TABLE response ADD COLUMN macaddress VARCHAR(200)'));
queries[queries.length - 1].on('end', () => {
        // client.end();
    console.log('Se agrego columna macaddress a tabla response');
    closeConnection();
});

queries.push(client.query('ALTER TABLE places ADD COLUMN contact_name VARCHAR(80)'));
queries[queries.length - 1].on('end', () => {
        // client.end();
    console.log('Se agrego columna contact_name a tabla places');
    closeConnection();
});

queries.push(client.query('ALTER TABLE places ALTER COLUMN phone_number TYPE VARCHAR(20)'));
queries[queries.length - 1].on('end', () => {
        // client.end();
    console.log('Columna phone_number modificada en tabla places');
    closeConnection();
});
