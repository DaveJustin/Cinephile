const express = require('express');
const router = express.Router();

const {
    newProduction,
    getProductionDetail,
    getProductionByRole,
    updateProduction,
    deleteProduction,
    createProductionReview,
    getProductionReviews,
    deleteProductionReview,
    getAllProductionNames
} = require('../controllers/productionController');

router.route('/production/new').post(newProduction);
router.route('/production/:id').get(getProductionDetail);
router.route('/production/:id').put(updateProduction);
router.route('/production/delete/:id').delete(deleteProduction);
router.route('/production').get(getProductionByRole);
router.route('/production/review/create').put(createProductionReview);
router.route('/production/review/view').get(getProductionReviews);
router.route('/production/review/delete').delete(deleteProductionReview);

router.route('/production/all/names').get(getAllProductionNames);

module.exports = router;