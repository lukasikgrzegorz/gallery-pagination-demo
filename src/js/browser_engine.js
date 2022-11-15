import _throttle from 'lodash.throttle';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Pagination from 'tui-pagination';
import 'tui-pagination/dist/tui-pagination.css';

const APIKEY = '31019872-5203125bb9147bf7b31b034ba';
const gallery = document.querySelector('.gallery');
const form = document.querySelector('#search-form');
const paginationHolder = document.getElementById('pagination-buttons');

let actualPage = 1;
let currentSearchName = '';
let lastPage = 1;
const ITEMPERPAGE = 10;

let pagination = null;

let lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  scrollZoomFactor: false,
});

const fetchPhotos = async (name, page) => {
  try {
    const respone = await axios(
      `https://pixabay.com/api/?key=${APIKEY}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${ITEMPERPAGE}&page=${page}`
    );
    const photos = await respone.data;
    checkResults(photos);
    currentSearchName = name;
  } catch (error) {
    console.log(error.message);
    Notiflix.Notify.failure(error.message);
  }
};

const checkResults = photos => {
  if (photos.hits.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    if (actualPage === 1 && !pagination) {
      Notiflix.Notify.success(`Hooray! We found ${photos.totalHits} images.`);
      lastPage = Math.ceil(photos.totalHits / ITEMPERPAGE);
      createPaginationButtons(photos.totalHits);
    }
    renderPhotos(photos);
    lightbox.refresh();
  }
};

const renderPhotos = photos => {
  const markup = photos.hits
    .map(photo => {
      return `<div class="photo-card">
                    <a href="${photo.largeImageURL}"> 
                        <img src="${photo.webformatURL}" alt="${photo.tags}" data-source="${photo.largeImageURL}" loading="lazy" />
                        <div class="info">
                        <p class="info-item"><span><b>Likes</b></span><span>${photo.likes}</span></p>
                        <p class="info-item"><span><b>Views</b></span><span>${photo.views}</span></p>
                        <p class="info-item"><span><b>Comments</b></span><span>${photo.comments}</span></p>
                        <p class="info-item"><span><b>Downloads</b></span><span>${photo.downloads}</span></p>
                        </div>
                    </a> 
                </div>`;
    })
    .join('');
  gallery.innerHTML = gallery.innerHTML + markup;
};

form.addEventListener('submit', e => {
  e.preventDefault();
  actualPage = 1;
  gallery.innerHTML = '';
  fetchPhotos(form.searchQuery.value, actualPage);
  pagination = null;
  paginationHolder.innerHTML = '';
});

const createPaginationButtons = totalItems => {
  pagination = new Pagination(paginationHolder, {
    totalItems: totalItems,
    itemsPerPage: ITEMPERPAGE,
    visiblePages: 5,
    centerAlign: true,
  });

  pagination.on('afterMove', function (eventData) {
    gallery.innerHTML = '';
    actualPage = eventData.page;
    fetchPhotos(currentSearchName, actualPage);
    return;
  });
};
