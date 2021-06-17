module.exports = {
  name: 'PartNumber',
  alias: 'PartNumber',
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
    original: {
      type: String,
      required: false,
    },
    partNumber: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: String,
      required: false,
    },
  },
};
