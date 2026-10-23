// OWNER: Preksha - #28 VPS-F-003, #29 VPS-F-004
const vehicleService = require('../services/vehicle.service');

async function create(req, res) {
  const vehicle = await vehicleService.registerVehicle(req.body, req.user.userId);
  res.status(201).json({ vehicle });
}

async function list(req, res) {
  const vehicles = await vehicleService.listVehicles(req.user);
  res.json({ vehicles });
}

async function update(req, res) {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body, req.user);
  res.json({ vehicle });
}

module.exports = { create, list, update };
