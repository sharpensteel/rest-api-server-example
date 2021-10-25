require('dotenv').config();

/** @var {PostgresConnectionOptions} */
const config = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DATABASE || 'POSTGRES_DATABASE',
  username: process.env.POSTGRES_USERNAME || 'POSTGRES_USERNAME',
  password: process.env.POSTGRES_PASSWORD || 'POSTGRES_PASSWORD',
  entities: ['src/entities/**/*.ts'],
  migrations: [
    `src/migrations/**/*.ts`,
  ],
  cli: {
    entitiesDir: `src/entity`,
    migrationsDir: `src/migrations`,
  },
  synchronize: false,
  logging: true,
};

module.exports = config;