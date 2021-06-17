module.exports = {
  name: 'PartList',
  alias: 'PartList',
  schema: {
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    link: {
      type: String,
      required: false,
    },
    meta: {
      type: Object,
      required: false,
    },
    parsed: {
      type: Boolean,
      required: false,
    },
  },
};
