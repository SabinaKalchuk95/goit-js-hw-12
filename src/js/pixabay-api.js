
import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '16912349-7bb97ffb55ee20e1561898d9f'; 

export async function getImagesByQuery(query, page) {
  try {
    const response = await axios.get('', {
      params: {
        key: '16912349-7bb97ffb55ee20e1561898d9f',
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 15, 
      },
    });
    return response.data; 
  } catch (error) {
    console.error('Помилка при отриманні зображень:', error);
    if (error.response) {
      console.error('Статус відповіді:', error.response.status);
      console.error('Дані відповіді:', error.response.data);
    } else if (error.request) {
      console.error('Запит був зроблений, але відповіді не було:', error.request);
    } else {
      console.error('Помилка налаштування запиту:', error.message);
    }
    throw error; 
  }
}