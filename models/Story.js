module.exports = {
  name: 'Story',
  alias: 'Story',
  schema: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    featured: {
      type: Boolean,
      required: false,
    },
    category: {
      type: Array,
      required: false,
    },
    lang: {
      type: Array,
      required: false,
    },
  },
};
