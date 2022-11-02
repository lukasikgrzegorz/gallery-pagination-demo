import axios from "axios";
import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const APIKEY = "31019872-5203125bb9147bf7b31b034ba"
const gallery = document.querySelector(".gallery");
const form = document.querySelector("#search-form");
const btnMore = document.querySelector(".load-more");

let actualPage = 1;
let currentSearchName = "";
let lastPage = 1;

let lightbox = new SimpleLightbox('.gallery a', {
    captionDelay: 250,
    scrollZoomFactor: false,});
		
const fetchPhotos = async (name,page) => {
    try {
        const respone = await axios(`https://pixabay.com/api/?key=${APIKEY}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`);
        const photos = await respone.data;
        if (photos.hits.length === 0) { 
            Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");   
        } else {    
            if (actualPage === 1) {
                Notiflix.Notify.success(`Hooray! We found ${photos.totalHits} images.`);
                currentSearchName = name;
                lastPage = Math.ceil(photos.totalHits / 40);
                if (lastPage > 1) { btnMore.classList.add("is-visible") };
            }
            renderPhotos(photos);
            lightbox.refresh();
            if (actualPage > 1) {scrollPage()};
        }   
    } catch(error) {
        console.log(error.message);
        Notiflix.Notify.failure(error.message);
    }
};

const renderPhotos =(photos) => {
    const markup = photos.hits.map((photo) => {
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
                </div>`
    })
    .join("")
    gallery.innerHTML = gallery.innerHTML+markup;
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    actualPage = 1;
    gallery.innerHTML = "";
    fetchPhotos(form.searchQuery.value, actualPage);
})

btnMore.addEventListener("click", () => {
    actualPage++;
    fetchPhotos(currentSearchName, actualPage);     
    if (actualPage === lastPage) {
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results."); 
        btnMore.classList.remove("is-visible");
    }  
})

const scrollPage = () => {
    const photoInfo = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
    const { height: cardHeight } = photoInfo;
    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    })
}
