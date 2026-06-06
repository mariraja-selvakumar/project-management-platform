const path = require('path');
// Load environment variables from workspace root
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbConnection = process.env.DATABASE_URL;

module.exports = {
  development: {
    client: 'mysql2',
    connection: dbConnection,
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    }
  },
  test: {
    client: 'mysql2',
    connection: process.env.NODE_ENV === 'test' 
      ? (process.env.TEST_DATABASE_URL || 'mysql://root:secret@127.0.0.1:3306/platform_test') 
      : dbConnection,
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    }
  },
  production: {
    client: 'mysql2',
    connection: dbConnection,
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    }
  }
};
