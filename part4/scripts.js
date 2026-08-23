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
  placeDetailsSection.appendChild(title);

  const infoDiv = document.createElement('div');
  infoDiv.className = 'place-info';

  function createInfoLine(label, value) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = label + ': ';
    p.appendChild(strong);
    p.appendChild(document.createTextNode(value));
    return p;
  }

  let hostName = 'Unknown';
  if (place.owner) {
    hostName = place.owner.first_name + ' ' + place.owner.last_name;
  }
  infoDiv.appendChild(createInfoLine('Host', hostName));

  infoDiv.appendChild(createInfoLine('Price per night', '$' + place.price));

  infoDiv.appendChild(createInfoLine('Description', place.description || 'No description provided.'));

  let amenitiesText = 'None';
  if (place.amenities && place.amenities.length > 0) {
    let amenityNames = [];
    for (let i = 0; i < place.amenities.length; i++) {
      const item = place.amenities[i];
      if (typeof item === 'object' && item !== null) {
        amenityNames.push(item.name);
      } else {
        amenityNames.push(item);
      }
    }
    amenitiesText = amenityNames.join(', ');
  }

  infoDiv.appendChild(createInfoLine('Amenities', amenitiesText));

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