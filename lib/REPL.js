const repl = require('repl');

class FastifyRepl {
  constructor() {
    this.replServer = {};
  }

  run(ctx) {
    const config = { ...ctx.config };
    this.replServer = repl.start(config);

    Object.assign(this.replServer.context, ctx.handles);
    this.defineUsage(ctx);
    this.replServer.eval = this.wrapReplEval(this.replServer);
    return this.replServer;
  }

  defineUsage(ctx) {
    const self = this;
    this.replServer.defineCommand('usage', {
      help: 'Fastify Console usage information',
      action() {
        this.outputStream.write(self.usage(ctx, true));
        this.displayPrompt();
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  usage(ctx) {
    const modelsHandles = Object.keys(ctx.models);
    let usage = '======================================\nFastify console \nPrimary handles available\n';
    Object.keys(ctx.handleInfo).forEach((key) => {
      usage += ` - ${key}: ${ctx.handleInfo[key]}\n`;
    });
    if (modelsHandles.length) {
      usage += '\nModels: \n';
      usage += ` - ${modelsHandles.join(', ')}\n`;
    }
    return usage;
  }

  // eslint-disable-next-line class-methods-use-this
  wrapReplEval(replServer) {
    const defaultEval = replServer.eval;
    const self = this;
    // eslint-disable-next-line func-names
    return function (code, context, file, cb) {
      return defaultEval.call(this, code, context, file, (err, result) => {
        if (!result || !result.then) {
          return cb(err, result);
        }
        result.then((resolved) => {
          self.resolvePromises(result, resolved);
          cb(null, resolved);
        }).catch((error) => {
          self.resolvePromises(result, error);
          // eslint-disable-next-line no-console
          console.log('\x1b[31m [Promise Rejection] \x1b[0m');
          if (error && error.message) {
            // eslint-disable-next-line no-console
            console.log(`\x1b[31m  ${error.message} \x1b[0m`);
          }
          // Application errors are not REPL errors
          cb(null, err);
        });
      });
    };
  }

  // eslint-disable-next-line class-methods-use-this
  resolvePromises(ctx, promise, resolved) {
    Object.keys(ctx).forEach((key) => {
      // Replace any promise handles in the REPL context with the resolved promise
      if (ctx[key] === promise) {
        ctx[key] = resolved;
      }
    });
  }
}

module.exports = FastifyRepl;
