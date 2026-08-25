document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('#login-form');
  const errorMessage = document.querySelector('#error-message');

  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();

      errorMessage.style.display = 'none';
      errorMessage.textContent = '';

      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      fetch('http://127.0.0.1:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
        .then(function (response) {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(response.statusText);
          }
        })
        .then(function (data) {
          document.cookie = 'token=' + data.access_token + '; path=/';
          window.location.href = 'index.html';
        })
        .catch(function (error) {
          console.error(error);
          errorMessage.textContent = 'Email or password incorrect.';
          errorMessage.style.display = 'block';
        });
    });
  }

  checkAuthentication();
});

function getCookie(name) {
  const cookieString = document.cookie;
  const cookies = cookieString.split('; ');

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const parts = cookie.split('=');
    if (parts[0] === name) {
      return parts[1];
    }
  }
  return null;
}

function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (token && loginLink) {
    loginLink.style.display = 'none';
  }

  const placesList = document.querySelector('#places-list');
  if (placesList && token) {
    fetchPlaces(token);
  }

  const placeDetails = document.querySelector('#place-details');
  if (placeDetails) {
    const placeId = getPlaceIdFromURL();
    const addReviewSection = document.getElementById('add-review');

    if (!token) {
      if (addReviewSection) addReviewSection.style.display = 'none';
      if (placeId) fetchPlaceDetails(null, placeId);
    } else {
      if (addReviewSection) addReviewSection.style.display = 'block';
      const addReviewLink = document.getElementById('add-review-link');
      if (addReviewLink && placeId) {
        addReviewLink.href = 'add_review.html?id=' + placeId;
      }
      if (placeId) fetchPlaceDetails(token, placeId);
    }
  }
}

function fetchPlaces(token) {
  fetch('http://127.0.0.1:5000/api/v1/places/', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to fetch places');
      }
    })
    .then(function (placesData) {
      displayPlaces(placesData);
      setupFilter(placesData);
    })
    .catch(function (error) {
      console.error(error);
    });
}
const placeImages = {
    "Cozy Beachfront Villa": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=320&h=200&q=80",
    "Modern City Apartment": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=320&h=200&q=80", 
    "Rustic Mountain Cabin": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=320&h=200&q=80",
    "Luxury Penthouse Suite": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=320&h=200&q=80",
    "Desert Glamping Tent": "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=320&h=200&q=80", 
    "Historic Old Town Loft": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=320&h=200&q=80",
    "Lakeside Cottage": "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=320&h=200&q=80",
    "Minimalist Tech Studio": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=320&h=200&q=80",
    "Tropical Treehouse": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=320&h=200&q=80",
    "Spacious Family Home": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=320&h=200&q=80",
    "Cozy Studio": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=320&h=200&q=80" 
  };

function displayPlaces(places) {
  const placesList = document.querySelector('#places-list');
  placesList.textContent = '';

  if (!places || places.length === 0) {
    const noPlacesMsg = document.createElement('p');
    noPlacesMsg.textContent = 'No places available.';
    placesList.appendChild(noPlacesMsg);
    return;
  }

  places.forEach(function (place) {
    const placeCard = document.createElement('div');
    placeCard.className = 'place-card';

    const image = document.createElement('img');
    image.src = placeImages[place.title];
    image.style.width = '100%';
    image.style.height = '200px';
    image.style.borderRadius = '10px 10px 0 0';
    image.style.objectFit = 'cover';
    placeCard.appendChild(image);

    const title = document.createElement('h2');
    title.textContent = place.title || 'Unnamed Place';

    const price = document.createElement('p');
    price.textContent = 'Price per night: $' + place.price;

    const button = document.createElement('button');
    button.className = 'details-button';
    button.textContent = 'View Details';
    button.setAttribute('data-id', place.id);

    button.addEventListener('click', function () {
      window.location.href = 'place.html?id=' + place.id;
    });

    placeCard.appendChild(title);
    placeCard.appendChild(price);
    placeCard.appendChild(button);

    placesList.appendChild(placeCard);
  });
}

function setupFilter(allPlaces) {
  const priceFilter = document.getElementById('price-filter');

  if (priceFilter) {
    priceFilter.addEventListener('change', function (event) {
      const selectedPrice = event.target.value;

      if (selectedPrice === 'All') {
        displayPlaces(allPlaces);
      } else {
        const maxPrice = parseInt(selectedPrice, 10);

        const filteredPlaces = allPlaces.filter(function (place) {
          return place.price <= maxPrice;
        });

        displayPlaces(filteredPlaces);
      }
    });
  }
}

function getPlaceIdFromURL() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('id');
}

function fetchPlaceDetails(token, placeId) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  fetch('http://127.0.0.1:5000/api/v1/places/' + placeId, {
    method: 'GET',
    headers: headers
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to fetch place details');
      }
    })
    .then(function (placeData) {
      displayPlaceDetails(placeData);
    })
    .catch(function (error) {
      console.error(error);
    });
}

function createReviewCard(review, container) {
  const reviewCard = document.createElement('article');
  reviewCard.className = 'review-card';

  const author = document.createElement('h3');
  author.textContent = 'Loading user...';

  if (review.user_id) {
    fetch('http://127.0.0.1:5000/api/v1/users/' + review.user_id)
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
        throw new Error('User not found');
      })
      .then(function (userData) {
        author.textContent = userData.first_name + ' ' + userData.last_name;
      })
      .catch(function (error) {
        console.error(error);
        author.textContent = 'Anonymous';
      });
  } else {
    author.textContent = 'Anonymous';
  }

  const rating = document.createElement('p');
  const strongRating = document.createElement('strong');
  strongRating.textContent = 'Rating: ';
  rating.appendChild(strongRating);

  const stars = '⭐'.repeat(review.rating || 0);
  rating.appendChild(document.createTextNode(stars || 'Unrated'));

  const text = document.createElement('p');
  text.textContent = '"' + review.text + '"';

  reviewCard.appendChild(author);
  reviewCard.appendChild(rating);
  reviewCard.appendChild(text);

  container.appendChild(reviewCard);
}

function displayPlaceDetails(place) {
  const placeDetailsSection = document.querySelector('#place-details');
  const reviewsList = document.querySelector('#reviews-list');

  if (!placeDetailsSection) return;

  placeDetailsSection.textContent = '';
  if (reviewsList) reviewsList.textContent = '';

  const title = document.createElement('h1');
  title.textContent = place.title || 'Unnamed Place';
  title.className = 'details-title'; 
  placeDetailsSection.appendChild(title);

  const image = document.createElement('img');
  const placeName = place.title;
  image.src = placeImages[placeName];
  image.className = 'details-hero-image';
  placeDetailsSection.appendChild(image);

  const infoDiv = document.createElement('div');
  infoDiv.className = 'place-info';

  const metaDiv = document.createElement('div');
  metaDiv.className = 'details-meta';

  let hostName = 'Unknown';
  if (place.owner) {
    hostName = place.owner.first_name + ' ' + place.owner.last_name;
  }

  const hostP = document.createElement('p');
  hostP.innerHTML = 'Hosted by <strong>' + hostName + '</strong>';

  const priceP = document.createElement('p');
  priceP.className = 'details-price';
  priceP.innerHTML = '<strong>$' + place.price + '</strong> / night';

  metaDiv.appendChild(hostP);
  metaDiv.appendChild(priceP);
  infoDiv.appendChild(metaDiv);

  const descDiv = document.createElement('div');
  descDiv.className = 'details-section';
  descDiv.innerHTML = '<h3>About this place</h3><p>' + (place.description || 'No description provided.') + '</p>';
  infoDiv.appendChild(descDiv);

  const amenitiesDiv = document.createElement('div');
  amenitiesDiv.className = 'details-section';
  amenitiesDiv.innerHTML = '<h3>What this place offers</h3>';

  const tagsContainer = document.createElement('div');
  tagsContainer.className = 'amenities-tags';

  if (place.amenities && place.amenities.length > 0) {
    place.amenities.forEach(function (item) {
      const name = typeof item === 'object' && item !== null ? item.name : item;
      
      const span = document.createElement('span');
      span.className = 'amenity-tag';
      span.textContent = name;
      tagsContainer.appendChild(span);
    });
  } else {
    tagsContainer.innerHTML = '<p style="color: var(--text-muted);">No amenities listed.</p>';
  }
  
  amenitiesDiv.appendChild(tagsContainer);
  infoDiv.appendChild(amenitiesDiv);

  placeDetailsSection.appendChild(infoDiv);

  if (reviewsList) {
    if (place.reviews && place.reviews.length > 0) {
      place.reviews.forEach(function (reviewItem) {

        if (typeof reviewItem === 'string') {
          fetch('http://127.0.0.1:5000/api/v1/reviews/' + reviewItem)
            .then(function (response) {
              if (response.ok) return response.json();
              throw new Error('Failed to fetch review data');
            })
            .then(function (reviewData) {
              createReviewCard(reviewData, reviewsList);
            })
            .catch(function (error) {
              console.error(error);
            });
        } else if (typeof reviewItem === 'object') {
          createReviewCard(reviewItem, reviewsList);
        }

      });
    } else {
      const noReviews = document.createElement('p');
      noReviews.textContent = 'No reviews yet.';
      reviewsList.appendChild(noReviews);
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const reviewForm = document.getElementById('review-form');

  if (reviewForm) {
    const token = checkAuthenticationForReview();
    const placeId = getPlaceIdFromURL();

    reviewForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const reviewText = document.getElementById('review-text').value;
      const ratingElement = document.getElementById('review-rating');
      const rating = ratingElement ? parseInt(ratingElement.value, 10) : 5;

      submitReview(token, placeId, reviewText, rating);
    });
  }
});

function checkAuthenticationForReview() {
  const token = getCookie('token');
  if (!token) {
    window.location.href = 'index.html';
  }
  return token;
}

function submitReview(token, placeId, reviewText, rating) {
  fetch('http://127.0.0.1:5000/api/v1/reviews/', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      place_id: placeId,
      text: reviewText,
      rating: rating
    })
  })
    .then(function (response) {
      handleResponse(response, placeId);
    })
    .catch(function (error) {
      console.error('Network or fetch error:', error);
      alert('Failed to submit review');
    });
}

function handleResponse(response, placeId) {
  if (response.ok) {
    document.getElementById('review-form').reset();

    alert('Success! Go back to the previous page.');

    window.location.href = 'index.html';

  } else {
    response.json().then(function(data) {
      console.error("API Error Response:", data);
      alert('Failed to submit review: ' + (data.error || 'Check the console'));
    }).catch(function() {
      alert('Failed to submit review (Server Error).');
    });
  }
}
