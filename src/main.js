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
  gallery
} from './js/render-functions.js';

const searchForm = document.querySelector('.form');
const searchInput = searchForm.elements.query;
const loadMoreBtn = document.querySelector('.load-more-btn');

// Глобальні змінні стану
let currentQuery = '';
let currentPage = 1;
const imagesPerPage = 15;
let totalHits = 0;

// Ініціалізація: приховуємо лоадер та кнопку "Load more"
hideLoader();
hideLoadMoreButton();

// Обробник сабміту форми
searchForm.addEventListener('submit', async event => {
  event.preventDefault();

  currentQuery = searchInput.value.trim();
  currentPage = 1;
  clearGallery();
  hideLoadMoreButton();

  if (!currentQuery) {
    iziToast.error({
      title: 'Error',
      message: 'Search field cannot be empty!',
      position: 'topRight',
    });
    return;
  }

  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.info({
        title: 'Info',
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
    } else {
      createGallery(data.hits);
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
    hideLoader();
    searchForm.reset();
  }
});

// Обробник кліку на кнопку "Load more"
loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);

    createGallery(data.hits);

    const galleryCard = gallery.querySelector('.gallery-item');
    if (galleryCard) {
      const cardHeight = galleryCard.getBoundingClientRect().height;
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }

    const loadedImagesCount = currentPage * imagesPerPage;
    if (loadedImagesCount >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton();
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to load more images. Please try again later.',
      position: 'topRight',
    });
    console.error('Error loading more images:', error);
  } finally {
    hideLoader();
  }
});