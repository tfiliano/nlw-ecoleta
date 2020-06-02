import knex from '../database/connection';
import { Request, Response } from 'express';

class CategoriesController {
    async index(request: Request, response: Response) {
        const categories = await knex('categories').select('*');
    
        const serializedCategories = categories.map( item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://localhost:3333/uploads/${item.image}`
            }
    
        });
        response.json(serializedCategories);
    }
}

export default CategoriesController;