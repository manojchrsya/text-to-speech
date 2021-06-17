module.exports = {
  name: 'VehicleModel',
  alias: 'VehicleModel',
  schema: {
    make: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: false,
    },
    link: {
      type: String,
      required: false,
    },
    parsed: {
      type: Boolean,
      required: false,
    },
  },
};
