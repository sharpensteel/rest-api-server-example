import express from 'express'
import {
  Action,
  ClassConstructor,
  ExpressErrorMiddlewareInterface,
  ExpressMiddlewareInterface,
  HttpError,
  IocAdapter,
  Middleware,
  useContainer,
  useExpressServer
} from 'routing-controllers';
import * as bodyParser from 'body-parser';
import { attachSwagger } from './swagger';
import { Container, inject, injectable } from 'inversify';
import { LogContext } from '../services/logging/LogContext';
import { AppLogger } from '../services/logging/AppLogger';
import { Types } from '../types';
import { Request, Response } from 'express-serve-static-core';
import { Class } from '../helpers/typescriptHelper';
import { ErrorJsonRpc, RpcErrors } from '../models/errors';
import { AppConfig } from '../environment/AppEnviroment';

/** @todo write unit-test on middlewares */

export function createExpressApp(container: Container, controllers: Class[]): any {
  const appConfig = container.get<AppConfig>(Types.AppConfig);

  const inversifyAdapter = new InversifyAdapter(container);
  useContainer(inversifyAdapter);

  let app = express();

  // app.patch('/article/aaa', function (req, res) {
  //     res.send({success: true});
  // });

  useExpressServer(app, {
    controllers,
    middlewares: [LoggingStartMiddleware, LoggingFinishMiddleware],
    defaultErrorHandler: false,
    authorizationChecker: async (action: Action) => {
      const token = action.request.headers['authorization'];
      return appConfig.authorizationHeader ? token === appConfig.authorizationHeader : false;
    },
  });

  app.use(bodyParser.json());

  attachSwagger(app);

  return app;
}


export class InversifyAdapter implements IocAdapter {
  constructor(private readonly container: Container) {
  }

  get<T>(someClass: ClassConstructor<T>, action?: Action): T {
    const childContainer = this.container.createChild();
    return childContainer.resolve<T>(someClass);
  }
}

@injectable()
@Middleware({ type: 'before' })
export class LoggingStartMiddleware implements ExpressMiddlewareInterface {
  constructor(@inject(Types.Logger) protected logger: AppLogger) {
  }

  use(request: Request, response: Response, next: (err?: any) => any): void {
    LogContext.runInContext(async () => {
      LogContext.setData({ 'client.ip': request.ip, 'url.path': request.path });
      this.logger.info({
        message: 'request started',
        'url.full': request.url,
        'http.request.method': request.method,
        info: { headers: request.headers }
      });
      return next();
    }).catch(err => this.logger.error({ message: `Error during LoggingStartMiddleware>next() ${err}` }))
  }
}


@injectable()
@Middleware({ type: 'after' })
export class LoggingFinishMiddleware implements ExpressMiddlewareInterface, ExpressErrorMiddlewareInterface {
  constructor(@inject(Types.Logger) protected logger: AppLogger) {
  }

  use(request: Request, response: Response, next: (err?: any) => any): void {
    this.logger.info({
      message: 'request finished',
      'http.response.status_code': response.statusCode
    });
    next();
  }

  error(error: Error, request: Request, response: Response, next: (err?: any) => any) {
    this.logger.info({
      message: `request finished with error: ${error.message}  ${error.stack}`,
      'http.response.status_code': response.statusCode
    });

    /** @todo better default error handling: bettersupport for public error data */

    if (error instanceof HttpError) { // i.e. validation errors from routing-controllers
      response.statusCode = error.httpCode || 500;
      let data = undefined;
      if (error.httpCode === 400) data = { errors: (error as any).errors };
      response.json(<ErrorJsonRpc>{ code: RpcErrors.INTERNAL_SERVER_ERROR, message: error.message, data });
      return;
    }
    if(error instanceof ErrorJsonRpc){
      response.statusCode = error.statusCode || 500;
      response.json(<ErrorJsonRpc>{ code: error.code, message: error.message, data: error.data });
      return;
    }

    if (response.statusCode < 400) {
      response.sendStatus(500);
    }
  }
}


