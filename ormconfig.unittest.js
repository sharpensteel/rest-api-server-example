/**
 *  Dedicated database for running unit tests and E2E tests for development.
 *
 *  Usage of unit-test database:
 *  * keep the database up-to-date with migrations;
 *  * always run relevant tests within a transaction;
 *  * rollback the transaction at the end of tests.
 */


/** @var {PostgresConnectionOptions} */
const baseConfig = require('./ormconfig');
let config = {...baseConfig};

config.database = process.env.POSTGRES_UNITTEST_DATABASE || 'POSTGRES_UNITTEST_DATABASE';

if(process.env.POSTGRES_UNITTEST_HOST)
  config.host = process.env.POSTGRES_UNITTEST_HOST;

const unittestPort = parseInt(process.env.POSTGRES_UNITTEST_PORT || '');
if(unittestPort){
  config.port = unittestPort;
}

if(process.env.POSTGRES_UNITTEST_USERNAME)
  config.username = process.env.POSTGRES_UNITTEST_USERNAME;

if(process.env.POSTGRES_UNITTEST_PASSWORD)
  config.password = process.env.POSTGRES_UNITTEST_PASSWORD;

module.exports = config;
