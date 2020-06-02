import express from 'express';

import PointsController from './controllers/pointsController';
import CategoriesController from './controllers/categoriesController';

const pointsController = new PointsController();
const categoriesController = new CategoriesController();
const routes = express.Router();

routes.get('/categories', categoriesController.index);
routes.post('/points', pointsController.create);
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);


routes.get('/', (request, response) => {
    response.json({ message: 'Everything working good.' })
});

export default routes;