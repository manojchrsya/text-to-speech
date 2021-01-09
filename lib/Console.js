const FastifyRepl = require('./REPL');

const DEFAULT_HANDLE_INFO = {
  app: 'Fastify app handle',
  cb: 'results callback which will print the output',
  result: 'handle on which cb() store results',
};

const DEFAULT_CONFIG = {
  quiet: false,
  prompt: 'fastify > ',
  useGlobal: true,
  ignoreUndefined: true,
  historyPath: '',
};
class FastifyConsole extends FastifyRepl {
  constructor() {
    super();
    this.ctx = {};
  }

  // eslint-disable-next-line class-methods-use-this
  active() {
    return process.argv.indexOf('--console') !== -1;
  }

  // eslint-disable-next-line class-methods-use-this
  // eslint-disable-next-line no-unused-vars
  start(app, config) {
    this.ctx = {
      app,
      config: { ...DEFAULT_CONFIG, ...config },
      handles: {},
      handleInfo: {},
      models: [],
    };
    // assing require deafult config
    Object.assign(this.ctx.config, DEFAULT_CONFIG);

    if (!(app in this.ctx.handles)) {
      this.ctx.handles.app = app;
      this.ctx.handleInfo.app = DEFAULT_HANDLE_INFO.app;
    }

    if (this.ctx.handles.cb === true || !('cb' in this.ctx.handles)) {
      this.ctx.handles.cb = true;
      this.ctx.handleInfo.cb = DEFAULT_HANDLE_INFO.cb;
      this.ctx.handleInfo.result = DEFAULT_HANDLE_INFO.result;
    }
    // adding models ctx from mongoose
    const { mongoose } = app;
    if (mongoose) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(mongoose.instance.models)) {
        this.ctx.models[key] = value;
      }
    }
    if (!config.quite) {
      // eslint-disable-next-line no-console
      console.log(this.usage(this.ctx));
    }
    return this.run(this.ctx);
  }
}

module.exports = FastifyConsole;
