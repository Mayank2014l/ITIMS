// Builds the 5 standard REST routes for any CRUD controller.
//   GET    /       list (search, filter, pagination)
//   GET    /:id    get one
//   POST   /       create          (ADMIN + IT_STAFF)
//   PUT    /:id    update          (ADMIN + IT_STAFF)
//   DELETE /:id    delete          (ADMIN only)
const express = require('express');
const { allow } = require('../middleware/auth');

function crudRouter(ctrl, extra) {
  const router = express.Router();
  if (extra) extra(router); // module-specific routes go first (e.g. /summary)
  router.get('/', ctrl.list);
  router.get('/:id', ctrl.getOne);
  router.post('/', ctrl.create);
  router.put('/:id', ctrl.update);
  router.delete('/:id', allow('ADMIN'), ctrl.remove);
  return router;
}

module.exports = crudRouter;
