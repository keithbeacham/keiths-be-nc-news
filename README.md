# Northcoders News API, developed by Keith Beacham

Link to hosted version:

The project provides an api to a backend server hosting mythical news data covering topics, articles and comments. Available endpoints and their functions are described at the GET /api endpoint.

To set up and run a local version: - requires node minimum version v21.6.2, Postgres minimum version 14.11 - clone the main keiths-be-nc-news repo - from this project's root directory run "npm i" to install the dependencies described in the package.json and package-lock.json files - to connect to the database, the PGDATABASE environment variable needs to be set to the database in use. There are two databases available: test and development. The links are set using two files in the root directory: .env.test and .env.development.
setup:
.env.test - sets up system for test database, contains "PGDATABASE=<test database name>"
.env.development - sets up system for development database contains "PGDATABASE=<development database name>"

        contact author for <test database name> and <development database name>
    - a .gitignore file should be created, containing ".env.*" and "node_modules"
    - create the databases using "npm setup-dbs"
    - the two databases are seeded from db/data/test-data, and db/data/development-data
    - the test database will be seeded automatically before each test in __tests__/app.test.js when running "npm test app"
    - to seed the development database run "npm seed"
    - to access the project via a local server such as insomnia, run "npm start
    - a description of the available endpoints can be found in endpoints.json. This is also served on the GET /api endpoint.
