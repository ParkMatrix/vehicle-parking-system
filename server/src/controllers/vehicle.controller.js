// OWNER: Preksha - #28 VPS-F-003, #29 VPS-F-004, #46 VPS-F-015
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

async function history(req, res) {
  const history = await vehicleService.getHistory(req.params.id, req.user);
  res.json({ history });
}


async function currentSlot(req, res) {
  const currentSlot = await vehicleService.getCurrentSlot(
    req.params.id,
    req.user
  );

  res.json({ currentSlot });
}

module.exports = {
  create,
  list,
  update,
  history,
  currentSlot,
};