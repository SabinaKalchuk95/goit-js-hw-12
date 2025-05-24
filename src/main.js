// src/main.js
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
  gallery // <-- Важливо: імпортуємо сам DOM-елемент gallery
} from './js/render-functions.js';

// Отримання елементів DOM
const searchForm = document.querySelector('.search-form');
const searchInput = searchForm.elements.query;
const loadMoreBtn = document.querySelector('.load-more-btn');
// const gallery = document.querySelector('.gallery'); // <-- ЦЕЙ РЯДОК ВИДАЛЕНО/ЗАКОМЕНТОВАНО, Оскільки gallery імпортується

// Глобальні змінні стану
let currentQuery = '';
let currentPage = 1;
const imagesPerPage = 15; // Кількість зображень на сторінці
let totalHits = 0; // Загальна кількість зображень, що відповідають запиту

// Ініціалізація: приховуємо лоадер та кнопку "Load more"
hideLoader();
hideLoadMoreButton();

// Обробник сабміту форми
searchForm.addEventListener('submit', async event => {
  event.preventDefault(); // Запобігаємо перезавантаженню сторінки

  currentQuery = searchInput.value.trim(); // Отримуємо запит та прибираємо зайві пробіли
  currentPage = 1; // Скидаємо сторінку до 1 при новому пошуку
  clearGallery(); // Очищаємо галерею
  hideLoadMoreButton(); // Ховаємо кнопку "Load more" при новому пошуку

  if (!currentQuery) {
    // Якщо поле пошуку порожнє
    iziToast.error({
      title: 'Error',
      message: 'Search field cannot be empty!',
      position: 'topRight',
    });
    return; // Виходимо з функції
  }

  showLoader(); // Показуємо лоадер

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    totalHits = data.totalHits; // Зберігаємо загальну кількість знайдених зображень

    if (data.hits.length === 0) {
      iziToast.info({
        title: 'Info',
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
    } else {
      createGallery(data.hits); // Створюємо галерею з перших 15 зображень
      // Перевіряємо, чи є ще зображення для завантаження
      if (totalHits > imagesPerPage) {
        showLoadMoreButton();
      } else {
        iziToast.info({
          title: 'Info',
          message: "We're sorry, but you've reached the end of search results.",
          position: 'topRight',
        });
      }
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images. Please try again later.',
      position: 'topRight',
    });
    console.error('Error in search form submit:', error);
  } finally {
    hideLoader(); // Ховаємо лоадер
    searchForm.reset(); // Очищаємо поле пошуку
  }
});

// Обробник кліку на кнопку "Load more"
loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1; // Збільшуємо номер сторінки
  showLoader(); // Показуємо лоадер
  hideLoadMoreButton(); // Ховаємо кнопку "Load more" під час завантаження

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);

    createGallery(data.hits); // Додаємо нові зображення до галереї

    // Обчислюємо висоту однієї карточки для скролу
    // Тепер використовуємо імпортований gallery для пошуку gallery-item
    const galleryCard = gallery.querySelector('.gallery-item');
    if (galleryCard) {
      const cardHeight = galleryCard.getBoundingClientRect().height;
      // Прокручуємо сторінку на дві висоти карточки
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }

    // Перевіряємо, чи дійшли ми до кінця колекції
    const loadedImagesCount = currentPage * imagesPerPage;
    if (loadedImagesCount >= totalHits) {
      hideLoadMoreButton(); // Ховаємо кнопку
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton(); // Показуємо кнопку, якщо є ще зображення
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to load more images. Please try again later.',
      position: 'topRight',
    });
    console.error('Error loading more images:', error);
  } finally {
    hideLoader(); // Ховаємо лоадер
  }
});