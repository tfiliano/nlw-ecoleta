import express from 'express';
import { celebrate, Joi } from 'celebrate';

import multer from 'multer';
import multerConfig from './config/multer';

import PointsController from './controllers/pointsController';
import CategoriesController from './controllers/categoriesController';

const pointsController = new PointsController();
const categoriesController = new CategoriesController();

const routes = express.Router();
const upload = multer(multerConfig);

routes.get('/categories', categoriesController.index);
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);


routes.post(
    '/points', 
    upload.single('image'), 
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            categories: Joi.string().required()
        })
    }, {
        abortEarly: false
    }),
    pointsController.create);


routes.get('/', (request, response) => {
    response.json({ message: 'Everything working good.' })
});

export default routes;