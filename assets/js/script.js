// MJS URI hw6 Weather Dashboard 12.30.23 - Due 1.2.24 
// javascript for index.html file. 
myLog("File source.js opened and loading .. ");


// ----------- Constants and Functions =============================
const Text_Search_Box = "#text-search-box";

function searchTextButtonClickFunction(ev) {
    myLog("Starting searchForCity"); 
    ev.preventDefault();  // keep input values
    var inputBox = $(Text_Search_Box);
    var inputText = inputBox.val();
    myLog("Searching for City " + inputText);
    if (inputText === null) {
        alert("Could not get text from text box (null).");
    } else if (inputText === undefined) {
        alert("Could not get text from text box (undefined).");
    } else if (inputText.length === 0) {
        alert("Text box blank. Try again");
    } else if (inputText === "Enter City") {
        alert('"Enter City" is not a valid city! Try again. ') 
    } else {
        searchForCity(inputText);
        if (!locallyStoredValueExists(inputText)) { 
            storeLocalData(inputText);
            buttonifyLocalStorage(localStoreDiv, localStorePrefix);
        }
    }
}  // end function searchTextButtonClickFunction(ev)

function locallyStoredButtonClickFunction(ev) {
    var cityName = ev.target.val(); 
    myLog("A locally stored button has been clicked! " + cityName);
    searchForCity(cityName);
}

// Clear the local storage - MJS 12.29.23
function clearLocalStorageButtonClickFunction() {
    myLog("clearing local storage button click function.");
    clearLocalStorage(localStorePrefix);
    buttonifyLocalStorage(localStoreDiv, localStorePrefix); // will remove old local storage
}

// search for a city using open weather api. MJS 12.31.23
// Typical call - api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key} 2603ab2cb7ddafbe94e3a350338be59b 
// Citu call - https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
function searchForCity(cityName) {
    myLog("Searching for City " + cityName);
    setCityDateInDom(cityName);
    const apiUrlBase = "https://api.openweathermap.org/data/2.5/";
    const weatherText = "weather?";
    var cityQS = "q="+cityName;
    var appIdQS = "&appid=" + "2603ab2cb7ddafbe94e3a350338be59b";
    var requestUrl = apiUrlBase + weatherText + cityQS + appIdQS; 

    myLog("Open weather map city request url: " + requestUrl);
    fetch(requestUrl)
        .then(function (response) {
            console.log("Weather API Response is: " + response + " Status: " + response.status);
            if (!response.ok) {
                myLog("Bad response status ... returning status. ");
                // whether you set this or not, whether 200 or 404 you always get a .cod in the result.
                response.textContent = response.status;  // or could return, and check if data undefined below.
            }
            return response.json(); // cod=404 if bad, 200 if good, etc.
        })
        .then(function (data) {
            console.log(data);  // this shows up in console as collaspable-expandable. Better than stringify.
            if (data.cod >= 300) {
                myLog("No weather results found for " + cityName + " ... returning");
                setCityNotFoundInDom(cityName);
                return;
            }
            // console.log("Data - JSON stringified is: " + JSON.stringify(data));
            var coord = data.coord;
            var lat = coord.lat;
            var lon = coord.lon; 
            fetchWeatherForecast(cityName, lat, lon);  // fetch forecast and display to DOMO
        });  // end .then-function
}  // end function searchForCity

// search for a latitude-longitude using open weather api. MJS 12.31.23
// Typical call - api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key} 2603ab2cb7ddafbe94e3a350338be59b 
function fetchWeatherForecast(cityName, lat, lon) {
    myLog("Fetching forecast for City " + cityName + " at (" + lat + ", " + lon + ")");
    const apiUrlBase = "https://api.openweathermap.org/data/2.5/";
    const forecastText = "forecast?";
    var appIdQS = "&appid=" + "2603ab2cb7ddafbe94e3a350338be59b";
    var latlonQS = "lat=" + lat + "&lon=" + lon; 
    var requestUrl = apiUrlBase + forecastText + latlonQS + appIdQS;
    myLog("Open weather map lat-lon request url: " + requestUrl);

    fetch(requestUrl)
    .then(function (response) {
                console.log("Weather API forecast Response is: " + response + " Status: " + response.status);
                if (!response.ok) {
                    response.textContent = response.status; 
                }
                return response.json(); // returns a promise
    })
    .then(function (data) {
                myLog(data);  // this shows up in console as collaspable-expandable. Better than stringify.
                if (data.cod >= 300) {
                    myLog("Could not fetch date for latitude and longitue! ");
                    setCityNotFoundInDom(cityName); 
                    return;
                }
                setForecastInDom(cityName, data);
    }); // end .then
    // addMovieSummaryToDom(results);
}  // end function fetchWeatherForecast

// ================= DOM methods ============================================
// Using forecast data JSON obj, set weather data in the index.html DOM. MJS 1.1.24
function setForecastInDom(cityName, data) {
    myLog("Updating DOM forecast for " + cityName);
    if (data.cod >= 300) {
                    myLog("Could not fetch date for latitude and longitue! ");
                    setCityNotFoundInDom(cityName); 
                    return;
    }
    var list = data.list;  // data points with day-time and weather
    myLog("Found data for " + list.length + " date-times. ");
                found = false;
                var today = dayjs(); 
                for (var i=0; i< list.length; i++) {
                    var dataPt = list[i];
                    var date_text = dataPt.dt_txt;
                    var date_time = dayjs(date_text);
                    if (today.isSame(date_time), 'day') {
                        myLog("Found matching date " + date_text);
                    }
                }
    if (!found) {
                    myLog("No weather days-date found for " + cityName);
                    setCityNotFoundInDom(cityName)
                    return;
    }

}  // end function setForecastInDom

// Set the City and todays date in the DOM
function setCityDateInDom(cityName) {
    myLog("Setting city-date " + cityName);
    var cityDateEl = $('#city-date');
    if (cityDateEl === null || cityDateEl === undefined) {
        myLog("city-date is undefined or null");
    }
    var date = dayjs().format("M-D-YYYY");
    myLog("Setting dayjs date to " + date);
    cityDateEl.text(cityName + "  (" + date + ")");
}

// Set City Nof Found and date in the DOM - MJS 12.30.23
function setCityNotFoundInDom(cityName) {
    var cityDateEl = $('#city-date');
    if (cityDateEl === null || cityDateEl === undefined) {
        myLog("city-date is undefined or null");
    }
    var date = dayjs().format("M-D-YYYY");
    myLog("Setting " + cityName + " Not Found (" + date + ")");
    cityDateEl.text(cityName + " Not Found (" + date + ")");
}

// ================  Local store class =============================
var localStorePrefix = "CityName_";     // ideally these would be external to the class.
var localStoreDiv = "#saved-data-div";  // DOM div to store the data

// create an object that links a local storage prefix (ie. CityName_) to a html div (ie saved-data-div). MJS 12.30.23
// Ideally this would be an immutable object
function createLocalStorageLink(prefix, div) {
    var link = {};
    link.localStorePrefix = prefix;
    link.localStoreDiv = div; 
    return link;
} 

// // load Local Data beginning with prefix into div. MJS 12.30.23
function storeLocalData(value) {
    myLog("Storing local data " + value);
    var count = getLocallyStoredDataCount(localStorePrefix); 
    localStorage.setItem(localStorePrefix+(count+1), value);
}

// load Local Data beginning with prefix into div buttons. MJS 12.30.23
function buttonifyLocalStorage(elementId, prefix) {
    var div = $(localStoreDiv); 
    div = $('#saved-data-div');
    div.empty(); // div.innerHTML = "";  // wipe out past values.
    myLog("The jQuery div is " + div + " Str " + JSON.stringify(div)); 
    var count = getLocallyStoredDataCount(prefix);
    for (var i=1; i<=count; i++) {
        var value = localStorage.getItem(prefix+i);
        myLog("Creating button " + i + ". " + value);
        var row = $('<div/>');
        row.attr("class", "row");  // rows display on a seperate line
        div.append(row);
        var btn = $('<button/>');
        btn.attr("class", "btn bg-secondary my-1 ml-3");
        btn.attr("id", value);
        btn.attr("onClick", "locallyStoredButtonClickFunction(event)");
        btn.text(value);
        row.append(btn);        
    }
    myLog("Done loadingLocalData");
    var row = $("<div/>");
    row.attr("class", "row");
    div.append(row);
    var btn = $("<btn/>");
    btn.attr("class", "btn bg-warning my-1 ml-3");
    btn.attr("onclick", "clearLocalStorageButtonClickFunction()"); 
    btn.text("Clear Cities");
    row.append(btn);
}  // end function buttonifyLocalStorage

// Return the number of locally stored values (prefix_index) beginning at 1. MJS 12.30.23.  
// If prefix_1 thru prefix_10 exists, but prefix_5 is missing 4 will be returned.
function getLocallyStoredDataCount(prefix) {
    done = false;
    var i = 1;
    while (! done) {
        var keyStr = prefix + i;
        var value = localStorage.getItem(keyStr);
        if (value === null || value.length === 0) {
            done = true;
        } else {
            i++;
        }
    } // end while not done
    return (i - 1);
} // end function getLocallyStoredDataCouont
 
// see if the key is in local storage for the input prefix.  MJS 12.30.23 
function locallyStoredValueExists(value) {
    console.log("Searching for locally stored value .... " + value);
    var count = getLocallyStoredDataCount(localStorePrefix);
    for (i=1; i<=count; i++ ) {
        if (localStorage.getItem(localStorePrefix+i) === value) {  // no trim or lowerCase
            return true;
        }
    }
    return false;
}  // end function locallyStoredValueExists

// load Local Data beginning with prefix into div buttons. MJS 12.30.23
function clearLocalStorage(prefix) {
    var count = getLocallyStoredDataCount(prefix);
    for (var i=1; i<=count; i++) {
        localStorage.removeItem(prefix+i);
        myLog("Deleting local storage " + prefix + i);        
    }
    myLog("Done clearingLocalStorage");
}  // end function clearLocalStorage


// Accesory Routines 
// ------------------------------------------------
function myLog(str) {  // to easily turn debugging on/off
    console.log(str); 
}

// ============== code to execute when loading (const must be declared first) =======
// storeLocalData(localStorePrefix, 1, "London");
buttonifyLocalStorage(localStoreDiv, localStorePrefix); 
myLog("Done loading scritp.js page. ");