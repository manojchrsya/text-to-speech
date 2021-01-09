// const repl = require('repl');

// const FastifyConsole = {
//   active() {
//     return process.argv.indexOf('--console') !== -1;
//   },
//   start: function() {
//     console.log('stating');
//   }
// };

class FastifyConsole {
  constructor(ctx) {
    this.config = { ...ctx.config };
  }
}

module.exports = FastifyConsole;
