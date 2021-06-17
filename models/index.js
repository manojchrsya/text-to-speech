const Story = require('./Story');
const VehicleModel = require('./VehicleModel');
const PartList = require('./PartList');
const PartNumber = require('./PartNumber');

module.exports = [
  { ...Story },
  { ...VehicleModel },
  { ...PartList },
  { ...PartNumber },
];
