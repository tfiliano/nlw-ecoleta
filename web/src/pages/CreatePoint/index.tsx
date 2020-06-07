import React, { useEffect, useState, ChangeEvent, version, FormEvent } from 'react';

import './styles.css';
import logo from '../../assets/logo.svg';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';

interface Category {
    id: number,
    title: string,
    image_url: string
}

interface UF {
    id: number,
    acronym: string,
    name: string
}

interface IBGEUFResponse {
    id: number,
    sigla: string,
    nome: string
}

interface City {
    id: number,
    name: string
}

interface IBGECitiesResponse {
    id: number,
    nome: string
}

const CreatePoint = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [ufList, setUflist] = useState<UF[]>([]);
    const [citiesList, setCitiesList] = useState<City[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });
    
    const [selectedCategories, setSelectedCategories] = useState<number[]>([])
    const [selectedUf, setSelectedUf] = useState('0')
    const [selectedCity, setSelectedCity] = useState('')
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);

    const history = useHistory();

    useEffect(() => {
        api.get('categories').then(response => {
            setCategories(response.data)
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const serializedUFs = response.data.map(item => {
                return {
                    id: item.id,
                    acronym: item.sigla,
                    name: item.nome
                }
            });
            setUflist(serializedUFs);
        })
    }, [])

    useEffect(() => {
        if (selectedUf === '0') return;

        axios.get<IBGECitiesResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const serializedCities = response.data.map(item => {
                return {
                    id: item.id,
                    name: item.nome
                }
            });
            setCitiesList(serializedCities);
        })
    }, [selectedUf])

    useEffect( ()=> {
        navigator.geolocation.getCurrentPosition(position=>{
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        })
    }, [])

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedUf(event.target.value)
    }

    function handleSelectCity( event: ChangeEvent<HTMLSelectElement>){
        setSelectedCity( event.target.value )
    }

    function handleMapClick (event: LeafletMouseEvent) {
        setSelectedPosition([event.latlng.lat, event.latlng.lng])
    }

    function handleInputChange ( event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target
        setFormData({ ...formData, [name]: value})
    }

    function handleSelectCategory ( id: number )  {
        const alreadySelected = selectedCategories.findIndex( item => item === id);
        if (alreadySelected >= 0 ) {
            const filteredCategories = selectedCategories.filter( item => item !== id);

            setSelectedCategories(filteredCategories);
        } else {
            setSelectedCategories([ ...selectedCategories, id]);
        }       
    }

    async function handleSubmit ( event: FormEvent) {
        event.preventDefault();

        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const categories = selectedCategories;

        const data = {
            name, 
            email, 
            whatsapp, 
            uf, 
            city, 
            latitude, 
            longitude,
            categories
        };

        await api.post('points', data);       
        alert(`Ponto de coleta criado!`);
        history.push('/')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br />ponto de Coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map 
                        center={initialPosition} 
                        zoom={15} 
                        onClick={handleMapClick}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                onChange={handleSelectUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {
                                    ufList.map(item => (
                                        <option key={item.id} value={item.acronym}>{item.acronym}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                onChange={handleSelectCity}
                            >
                                <option value="0">Selecione uma Cidade</option>
                                {
                                    citiesList.map(item => (
                                        <option key={item.id} value={item.name}>{item.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {categories.map(category => (
                            <li 
                                key={category.id} 
                                onClick={()=>handleSelectCategory(category.id)}
                                 className={ selectedCategories.includes(category.id) ? 'selected' : '' }
                            >
                                
                                <img src={category.image_url} alt={category.title} />
                                <span>{category.title}</span>
                            </li>
                        ))}




                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )

}

export default CreatePoint;