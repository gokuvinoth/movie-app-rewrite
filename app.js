//Global variable to store all the movie data
let APIData = [];

//API url to fetch the data
let API_URL = "https://ozindianmovies.herokuapp.com/api/v1/movies/";
// "https://ozindianmovies.herokuapp.com/api/v1/movies/";

//Endpoint to manipulate and use for filters
let API_Endpoint = API_URL + `getsessions`;

// list of languages to display in the filter
let languagesList = [
  { inputValue: "English" },
  { inputValue: "Tamil" },
  { inputValue: "Hindi" },
  { inputValue: "Kanada" },
  { inputValue: "Marathi" },
  { inputValue: "Telgu" }
];

// list of locations to display in the filter
let locationList = [
  { inputValue: "ACT" },
  { inputValue: "NSW" },
  { inputValue: "VIC" },
  { inputValue: "TAS" },
  { inputValue: "NT" },
  { inputValue: "SA" }
];

//self executing fucntion

(function() {
  //Variables to be used to identify the DOM Elements
  let headerTemplate,
    searchBarPane,
    languageBox,
    languageBoxTemplate,
    locationBox,
    locationBoxTemplate,
    searchBarTextBox,
    movies,
    searchBarIcon,
    filterBarIcon,
    movieTemplate,
    movieDetailTemplate,
    pageTitle,
    movieDetail,
    movieName,
    movieSession,
    MovieDetailStory,
    MovieDetailSession,
    backButton;

  // method to get the templates from HTML
  this.getTemplates = function() {
    languageBoxTemplate = document.querySelector("#language-box").innerHTML;
    locationBoxTemplate = document.querySelector("#location-box").innerHTML;
    movieTemplate = document.querySelector(".movie").outerHTML;
    movieDetailTemplate = document.querySelector("#moviedetails").innerHTML;
  };

  // method to get the elements for Binding Events on the elements
  this.getElements = function() {
    headerTemplate = document.querySelector("#header");
    searchBarPane = document.querySelector("#searchBarPane");
    languageBox = document.querySelector("#language-box");
    locationBox = document.querySelector("#location-box");
    searchBarTextBox = document.querySelector("#searchBarTextBox");
    movies = document.querySelector("#movielist");
    searchBarIcon = document.querySelector("#searchBar");
    filterBarIcon = document.querySelector("#filterBar");
    backButton = document.querySelector("#backButton");
    pageTitle = document.querySelector("#page-title");
    movieDetail = document.querySelector("#moviedetails");
    movieName = document.querySelector("#movieName");
    movieSession = document.querySelector("#movieSession");
    MovieDetailStory = document.querySelector("#moviedetailsstory");
    MovieDetailSession = document.querySelector("#moviesdetailssession");
  };

  // method to render the header(render only once while Loading and never again)
  this.render_header = function() {
    languageBox.innerHTML = buildTemplate(
      languageBoxTemplate,
      languagesList,
      3,
      '<div class="column">',
      "</div>"
    );
    locationBox.innerHTML = buildTemplate(
      locationBoxTemplate,
      locationList,
      3,
      '<div class="column">',
      "</div>"
    );
  };

  // Method to update the heading with movie name
  this.changeTitle = function(title) {
    pageTitle.innerHTML = title;
  };

  // method will build DOM elements based on the template and Data  along with wrapper elements
  this.buildTemplate = function(
    HTMLTemplate,
    dataList,
    interval,
    intervalPreffix,
    intervalSuffix
  ) {
    if (HTMLTemplate && dataList && (interval !== null && interval !== "")) {
      return dataList
        .map((data, index) => {
          let HTMLString = HTMLTemplate;
          Object.keys(data).forEach(
            keydata =>
              // replace the placeholders from template with the data
              (HTMLString = replaceTemplateData(
                keydata,
                interval,
                data,
                HTMLString,
                intervalPreffix,
                intervalSuffix,
                index
              ))
          );
          return HTMLString;
        })
        .join("");
    } else return null;
  };

  // method to filter the movie data containg only the searchtext in title
  this.filterSearchText = function(movies, searchTxt) {
    let newmovies = [];
    newmovies = movies.filter(movie =>
      searchTxt.length > 0
        ? movie.title.toLowerCase().includes(searchTxt.toLowerCase())
        : true
    );
    return newmovies;
  };

  // replace the placeholders matching the KEYS in the data object
  this.replaceTemplateData = function(
    keydata,
    interval,
    data,
    interString,
    intervalPreffix,
    intervalSuffix,
    index
  ) {
    let replaceString = new RegExp(`{{{${keydata}}}}`, "gi");

    if (interval === 1) {
      interString = `${intervalPreffix} ${interString.replace(
        replaceString,
        data[keydata]
      )}${intervalSuffix}`;
    } else if ((index + 1) % interval === 1) {
      interString = `${intervalPreffix} ${interString.replace(
        replaceString,
        data[keydata]
      )}`;
    } else if ((index + 1) % interval === 0) {
      interString = `${interString.replace(
        replaceString,
        data[keydata]
      )}${intervalSuffix}`;
    } else {
      interString = interString.replace(replaceString, data[keydata]);
    }

    return interString;
  };

  // method to render the movie list view with the data passed to this method.
  this.render_movie_list = function(data) {
    movies.innerHTML = buildTemplate(movieTemplate, data, 0, "", "");
    changeTitle(`Ozziewood Movies`);
    filterBarIcon.classList.remove("is-hidden");
    searchBarIcon.classList.remove("is-hidden");
    getElements();
  };

  // method to render the movie Detail view with the data passed to this method.
  this.render_movie_detail = function(data) {
    movieDetail.innerHTML = buildTemplate(movieDetailTemplate, data, 0, ``, ``);
    changeTitle(data[0].title);
    movies.classList.toggle("is-hidden");
    movieDetail.classList.toggle("is-hidden");
    filterBarIcon.classList.add("is-hidden");
    searchBarIcon.classList.add("is-hidden");
    getElements();
  };

  // method functions as router by performing the actions based on the elemented clicked by the mouse click event
  this.eventProcessor = function(clickedElement) {
    let languagesChecked = [],
      locationsChecked = [];

    // every time a language or location is selected that will be captured
    document.querySelectorAll(".language-input-checkbox").forEach(language => {
      if (language.checked) languagesChecked.push(language.value);
    });
    document.querySelectorAll(".location-input-checkbox").forEach(location => {
      if (location.checked) locationsChecked.push(location.value);
    });

    // realtime capturing of the searchtext to re-render the list view
    if (clickedElement.id === "searchText")
      document
        .querySelector("#searchText")
        .addEventListener("input", function() {
          render_movie_list(filterSearchText(APIData, clickedElement.value));
        });

    // based on the class name various actions performed
    clickedElement.classList.forEach(className => {
      switch (className) {
        // filter button to display the flterpane
        case "filter-button":
          searchBarPane.classList.toggle("is-hidden");
          filterBarIcon.classList.toggle("button-on");
          break;

        // search button to diaplay/hide search text input
        case "search-button":
          searchBarTextBox.classList.toggle("is-hidden");
          searchBarIcon.classList.toggle("button-on");
          break;

        // when clicked based on the selections the Endpoint is calculated and re-render list view
        case "save":
          if (
            (languagesChecked.length > 0 || locationsChecked.length > 0) &&
            !searchBarPane.classList.contains("is-hidden")
          ) {
          } else {
          }

          API_Endpoint = API_URL + `getsessions`;
          if (languagesChecked.length > 0)
            API_Endpoint = `${API_Endpoint}?languages=${languagesChecked.join(
              ","
            )}`;

          if (locationsChecked.length > 0 && languagesChecked.length > 0)
            API_Endpoint = `${API_Endpoint}&`;

          if (locationsChecked.length > 0)
            API_Endpoint = `${API_Endpoint}?location=${locationsChecked.join(
              ","
            )}`;

          callApi(API_Endpoint);
          searchBarPane.classList.toggle("is-hidden");
          filterBarIcon.classList.toggle("button-on");
          break;

        // when clicked clear all filter selections and re-render complete list view
        case "delete":
          API_Endpoint = API_URL + `getsessions`;
          callApi(API_Endpoint);
          document
            .querySelectorAll(".language-input-checkbox")
            .forEach(language => {
              language.checked = false;
            });
          document
            .querySelectorAll(".location-input-checkbox")
            .forEach(location => {
              location.checked = false;
            });
          searchBarPane.classList.toggle("is-hidden");
          filterBarIcon.classList.toggle("button-on");
          break;

        // when clicked the Id is passed and render the detail view of the movie.
        case "movie":
          backButton.classList.toggle("is-hidden");
          render_movie_detail(
            APIData.filter(data => data._id === clickedElement.id)
          );
          break;

        // roll back to the list view by toggle hidden class
        case "back-button":
          movies.classList.toggle("is-hidden");
          movieDetail.classList.toggle("is-hidden");
          backButton.classList.toggle("is-hidden");
          changeTitle(`Ozziewood Movies`);
          filterBarIcon.classList.remove("is-hidden");
          searchBarIcon.classList.remove("is-hidden");
          break;

        // detail view session and movie details toggle actions
        case "movie-name-off":
          movieName.classList.remove("movie-name-off");
          movieName.classList.add("movie-name");
          movieSession.classList.remove("movie-session");
          movieSession.classList.add("movie-session-off");
          MovieDetailStory.classList.remove("is-hidden");
          MovieDetailSession.classList.add("is-hidden");
          break;

        case "movie-session-off":
          movieName.classList.remove("movie-name");
          movieName.classList.add("movie-name-off");
          movieSession.classList.remove("movie-session-off");
          movieSession.classList.add("movie-session");
          MovieDetailStory.classList.add("is-hidden");
          MovieDetailSession.classList.remove("is-hidden");
          break;

        default:
          return null;
      }
    });
  };

  // this binds all the click events performed in the DOM and sends it to the router
  // (has to be called only once else will face multiple listeners issue)
  this.bind_event = function() {
    document.addEventListener("click", Event => {
      getElements();
      if (!Event.srcElement.id) {
        let destinationElement = Event.path.find(path => {
          return !!path.id;
        });
        eventProcessor(destinationElement);
      } else {
        eventProcessor(Event.srcElement);
      }
      getElements();
    });
  };

  // to convert the array numbers in to star rating DOM elements
  this.ratingStarTemplate = function(ratingCounter) {
    return `
    ${'<i class="fas fa-star movie-star-rating"  aria-hidden=" true"></i>'.repeat(
      ratingCounter[0]
    )}
    ${'<i class="fas fa-star-half-alt movie-star-rating" aria-hidden=" true"></i>'.repeat(
      ratingCounter[1]
    )}
    ${'<i class="far fa-star movie-star-rating"  aria-hidden=" true"></i>'.repeat(
      ratingCounter[2]
    )}`;
  };

  // to calculate the eqvalent number of stars
  this.ratingStarCalulation = function(ratingValue) {
    let ratingCounter = [0, 0, 0];
    let totalRatingCount = ratingValue;
    ratingCounter[0] = Math.floor(totalRatingCount % 5);
    ratingCounter[1] = Math.round(totalRatingCount % 1);
    ratingCounter[2] = 5 - ratingCounter[0] - ratingCounter[1];
    return ratingStarTemplate(ratingCounter);
  };

  // convertdate value from  2018-10-08T17:10:21.627Z format in to display format
  function convertDate(dateTime) {
    return dateTime
      .split("T")[0]
      .split("-")
      .reverse()
      .join("-");
  }

  // convert session data in to session DOM elements
  this.sessionDateTimeTemplate = function(sessionObj) {
    let dateTimeHtmlElement = "";
    Object.keys(sessionObj).forEach(date => {
      dateTimeHtmlElement += `<i class="fa fa-calendar movie-session-calendar" id="" aria-hidden="true"></i> ${date}
       : <i class="far fa-clock movie-session-clock" id="" aria-hidden="true"></i>
       ${
         sessionObj[date]
       } <button class="movie-book-btn"><i class="fas fa-ticket-alt movie-ticket"></i>
       <span class="book"> Book now </span>
   </button><br>`;
    });

    return dateTimeHtmlElement;
  };

  // sessions data are grouped based on the Location and Date
  this.renderSessionDetails = function(sessionDateTimes) {
    let sessionObj = {};

    sessionDateTimes.forEach(sessionDateTime => {
      const date = convertDate(sessionDateTime);
      const time = timeAMPMConversion(sessionDateTime);

      if (!sessionObj[date]) sessionObj[date] = "";
      if (!!sessionObj[date]) sessionObj[date] = sessionObj[date] + ", ";
      sessionObj[date] += time || "";
    });

    return sessionDateTimeTemplate(sessionObj);
  };

  // convert 2018-10-08T17:10:21.627Z format to AM/PM formated time
  this.timeAMPMConversion = function(DatetimeValue) {
    let timeValue = DatetimeValue.split("T")[1].split(":")[0];
    if (timeValue > 12) {
      return `${timeValue - 12}:${
        DatetimeValue.split("T")[1].split(":")[1]
      } PM`;
    } else {
      return `${timeValue}:${DatetimeValue.split("T")[1].split(":")[1]} AM`;
    }
  };

  // after the API call the data is converted to be compatible with DOM display
  this.replaceDataContent = function() {
    APIData.forEach(data => {
      data.rating = ratingStarCalulation(data.rating / 2);
      data.trailer = `https://www.youtube.com/embed/${
        data.trailer.split("=")[1]
      }`;
      data.leadActors = `${data.leadActors
        .join(",")
        .split(",")
        .map(leadActor => {
          return '<li class="movie-cast-name" id="">' + leadActor;
        })
        .join(",</li>\n") + ".</li>"}`;
      data.director = data.crew.director;
      data.musicDirector = data.crew.musicDirector;
      data.sessionData = ` ${data.sessions
        .map(session => {
          return `${session.cinema.state} 
       - ${session.cinema.location}<br>
         ${renderSessionDetails(session.sessionDateTime)}<br>
          `;
        })
        .join("\n")}`;
    });
  };

  //API call to fetch data based on the URL , everytimg render the list view after each call
  this.callApi = function(API_Endpoint) {
    fetch(API_Endpoint)
      .then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
        APIData = myJson.content;
      })
      .then(function() {
        replaceDataContent();
      })
      .then(function() {
        getElements();
      })
      .then(function() {
        render_movie_list(APIData);
      });
  };

  // call to get the templates first and Elements
  getTemplates();
  getElements();

  // call to render the Header Element
  render_header();

  // call the API and bind events to the DOM elements
  callApi(API_Endpoint);
  bind_event();
})();
