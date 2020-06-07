import knex from '../database/connection';
import { Request, Response } from 'express';

class PointsController {
    async index(request: Request, response: Response) {
        const { city, uf, categories } = request.query;
        const parsedCategories = String(categories)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_category', 'points.id', '=', 'point_category.point_id')
            .whereIn('point_category.category_id', parsedCategories)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.178.21:3333/uploads/${point.image}`
            }
        })

        return response.json(serializedPoints)
    }
    async show(request: Request, response: Response) {
        const { id } = request.params;
        const point = await knex('points').where('id', id).select('*').first();

        if (!point) {
            return response.status(400).json({ message: 'Point not found!' });
        }

        const categories = await knex('categories')
            .join('point_category', 'categories.id', '=', 'point_category.category_id')
            .where('point_category.point_id', id)
            .select('categories.title');

        const serializedPoint = {
            ...point,
            image_url: `http://192.168.178.21:3333/uploads/${point.image}`
        }

        return response.json({
            serializedPoint,
            categories
        });
    }
    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            categories
        } = request.body;

        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }
        const trx = await knex.transaction();
        const insertedIds = await trx('points').insert(point);

        const point_id = insertedIds[0]
        const pointCategories = categories
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((category_id: number) => {
                return {
                    category_id,
                    point_id
                }
            })

        await trx('point_category').insert(pointCategories);
        await trx.commit();

        return response.json({
            id: point_id,
            ...point
        })
    }
}

export default PointsController;