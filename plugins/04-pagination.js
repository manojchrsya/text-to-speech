const fp = require('fastify-plugin');

const COUNT_PER_PAGE = 9;

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

// eslint-disable-next-line no-unused-vars
module.exports = fp(async (fastify, opts) => {
  fastify.decorate('pagination', async (request, Model) => {
    const page = {};
    page.pageNo = (request.query && request.query.pageNo) || 1;
    const total = await Model.countDocuments();
    const totalPage = Math.ceil(total / COUNT_PER_PAGE);
    page.total = totalPage;
    // eslint-disable-next-line radix
    const skip = (COUNT_PER_PAGE * (parseInt(page.pageNo) - 1));
    const limit = COUNT_PER_PAGE;
    return { skip, limit, page };
  });
});
