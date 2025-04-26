const express = require('express');
const {
  getActionitems,
  getActionitem,
  createActionitem,
  updateActionitem,
  deleteActionitem,
} = require('../controllers/actionitems');

const router = express.Router();

router.route('/').get(getActionitems).post(createActionitem);

router
  .route('/:id')
  .get(getActionitem)
  .put(updateActionitem)
  .delete(deleteActionitem);

module.exports = router;
