import { createNamespace, getNamespace, Namespace } from 'cls-hooked';
import { AppEvent } from '../../models/logging';

/**
 * Storage for log context data (such as 'user.id') that is available all through the promises/callbacks chain
 */
export class LogContext {
  protected static _clsNamespace: Namespace;
  protected static ClsNamespaceId = 'app-log';

  static async runInContext<Result>(
    func: () => Result | Promise<Result>,
  ): Promise<Result> {
    const ns = this.clsNamespace;
    let res: Result | Promise<Result>;
    if (!ns.active) {
      res = await ns.runAndReturn(async () => func());
    } else {
      res = await func();
    }
    return res;
  }

  protected static get clsNamespace(): Namespace {
    if (!this._clsNamespace) {
      this._clsNamespace = getNamespace(this.ClsNamespaceId) || createNamespace(this.ClsNamespaceId);
    }
    return this._clsNamespace;
  }

  static setData(
    data: AppEvent, // Elastic Common Schema fields or app fields
    customInfo: object | undefined = undefined, // non-standardised fields; will be merged into `data.info`
    throwIfNoContext: boolean = true
  ) {
    const ns = this.clsNamespace;
    if (!ns.active) {
      if (throwIfNoContext) {
        throw new Error(`CLS context is not active! Need to AppContext.runInContext() in initial event handler`);
      }
    }

    const info = { ...ns.active.info, ...data.info, ...customInfo };

    for (let field of Object.keys(data) as (keyof AppEvent)[]) {
      ns.set(field, data[field]);
    }

    if (Object.keys(info).length) {
      ns.set('info', info);
    }
  }

  static getData(): AppEvent | undefined {
    if (!this.clsNamespace.active) return undefined;
    const data = Object.assign({}, this.clsNamespace.active)
    delete data.id; // id of namespace
    delete data._ns_name;
    return data;
  }

}

