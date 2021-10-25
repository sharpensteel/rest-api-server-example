## REST API Server Application Example

Highlights:
- [routing-controllers](https://github.com/typestack/routing-controllers) for defining API in a declarative way and requests validation 
- Auto-generated API documentation with 
[routing-controllers-openapi](https://github.com/epiphone/routing-controllers-openapi) and [Swagger](https://github.com/scottie1984/swagger-ui-express)
- Inversion of control (IoC) with [InversifyJS](https://github.com/inversify/InversifyJS) 
- [TypeOrm](https://github.com/typeorm/typeorm) to work with database; automatic migrations generation
- Testing: Unit-testing and E2E tests with [Jest](https://jestjs.io/) 
- Testing: database unit tests inside a transaction 
- Logging: context information in [Continuation-Local Storage](https://github.com/jeff-lewis/cls-hooked)
- Logging: log standard [Elastic Common Schema](https://www.elastic.co/guide/en/ecs/current/index.html)

## Installation
- Requirements: node 12, clean postgres database
- Create setup file `.env`; use `.env.example` for reference  
- `npm install`
- `npm run migration:run`
- `npm run build`
- `npm run start-js`
- `nom run coverage` to check test coverage
- Check swagger at http://localhost:3000/swagger/

## Future work
- Docker image (will be implemented in the coming days)
- Improve test coverage
- Pre-commit hooks for linting and maybe unit-testing