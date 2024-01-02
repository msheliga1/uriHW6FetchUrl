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
    }
}  // end function searchTextButtonClickFunction(ev)

// A local storage button has been clicked. Retrieve cityName from the button and search for it. MJS 1.1.24
function locallyStoredButtonClickFunction(ev) {
    myLog("Starting locallyStoredButtonClickFunction");
    var target = ev.target; 
    var cityName = $(ev.target).text(); 
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
    clearDomForecast();  // clear prior data and err msgs.
    setDomCityDate(cityName);
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
                setDomForecast(cityName, data);
    }); // end .then
    // addMovieSummaryToDom(results);
}  // end function fetchWeatherForecast

// ================= DOM methods ============================================
// Using forecast data JSON obj, set weather data in the index.html DOM. MJS 1.1.24
function setDomForecast(cityName, data) {
    myLog("Updating DOM forecast for " + cityName);
    if (data.cod >= 300) {
        myLog("Could not fetch date for latitude and longitude! ");
        setCityNotFoundInDom(cityName); 
        return;
    }
    var list = data.list;  // data points with day-time and weather
    myLog("Found data for " + list.length + " date-times. ");
    for (dayIndex = 0; dayIndex < 6; dayIndex++) {
        var foundAny = false;
        var today = dayjs(); 
        var forecastDate = today.add(dayIndex, 'day');
        var forecastPt = null; 
        for (var i=0; i< list.length; i++) {
                var dataPt = list[i];
                var dateText = dataPt.dt_txt;
                var ptDate = dayjs(dateText);  // includes time
                if (forecastDate.isSame(ptDate, 'day')) {
                        if (!foundAny) {
                            myLog("Matching date " + i + ". " + ptDate.format('M-D-YY')  + " forecastDate " + forecastDate.format('M-D-YY'));
                            forecastPt = dataPt;  // give preference to first data pt.
                            foundAny = true;
                        }
                        if (forecastDate.hour() === 15) { // found 3PM data - likely warmest of day
                            forecastPt = dataPt;
                            break; // from for loop
                        }
                    }
        } // for all list weather data points.
        if (!foundAny) {
            myLog("No weather days-date found for " + ptDate.format('M-D-YY'));
            setDomDateNotFound(dayIndex);
            clearDomDayForecast(dayIndex);
            continue;  // skip to next iteration of loop.
        }
        if (forecastDate.isSame(today)) {
            myLog(forecastPt); 
        }
        var wind = forecastPt.wind.speed; 
        var omega = '\u{03A9}';  var deg1 = '\xB0'; var deg2 = '&#176;'; var deg3 = '&#deg;' // &# wont work
        // mylog("omega is " + omega + " deg \\xB0 " + deg1 + " deg &#176 " + deg2 + " deg &#deg; " + deg3);
        var temp = forecastPt.main.temp;
        temp = "" + Math.round(kelvinToFahrenheit(temp)) + deg1;
        var humid = forecastPt.main.humidity;
        myLog(forecastDate.format('M-D-YY') + " Windspeed: " + wind + " Temp: " + temp + " Humid " + humid);
        setDomDate(dayIndex);  // takes care of parenthesis for city-date heading.  
        setDomIcon(dayIndex, forecastPt.weather[0].icon, forecastPt.weather[0].description);  
        $('#' + 'temp'  + dayIndex).text(temp);
        $('#' + 'wind'  + dayIndex).text(wind);
        $('#' + 'humid' + dayIndex).text(humid);
    } // for day
    if (!locallyStoredValueExists(cityName)) { 
        storeLocalData(cityName);
        buttonifyLocalStorage(localStoreDiv, localStorePrefix);
    }
}  // end function setDomForecast

// Set the City and todays date in the DOM
function setDomCityDate(cityName) {
    myLog("Setting city-date " + cityName);
    var cityEl = $('#city-date');
    if (cityEl === null || cityEl === undefined) {
        myLog("city-date is undefined or null");
        return;
    }
    cityEl.text(cityName);
    setDomDate(0); // 0 => todays date
}  // end function setDomCityDate

// Clear forecast data and err msgs in the index.html DOM. MJS 1.1.24
function clearDomForecast( ) {
    myLog("Clearing DOM forecast ");
    for (var i=0; i<6; i++) {
        clearDomDayForecast(i); 
    }
    clearDomErrorMsgs();
}  // end function clearDomForecast

// Using forecast data JSON obj, set weather data in the index.html DOM. MJS 1.1.24
function clearDomDayForecast(dayIndex) {
    myLog("Clearing DOM forecast for day " + dayIndex);
        // Leave the date alone
        $('#' + 'icon'  + dayIndex).attr("src", " ");  
        $('#' + 'icon'  + dayIndex).attr("alt", " ");  
        $('#' + 'temp'  + dayIndex).text("");
        $('#' + 'wind'  + dayIndex).text("");
        $('#' + 'humid' + dayIndex).text("");
}  // end function clearDomDayForecast

// Clear DOM error msgs. 
function clearDomErrorMsgs() {
    myLog("Clearing DOM error msgs.");
    var dateEl = $('#date-err');
    if (dateEl === null || dateEl === undefined) {
        myLog("Date-err element is undefined or null");
        return; 
    } else {
        dateEl.text("");
    }
    var cityEl = $('#city-err');
    if (cityEl === null || cityEl === undefined) {  // wont be true even if cityEl not in DOM!
        myLog("City-err element is undefined or null");
    } else {
        cityEl.text("");
    }
}  // end function clearDomErrorMsgs

// Set a date in the DOM. index=0 is today, 1 tomorrow, etc.
function setDomDate(index) {
    myLog("Setting date " + index);
    var dateEl = $('#date'+index);
    if (dateEl === null || dateEl === undefined) {
        myLog("DateElement is undefined or null");
        return; 
    }
    var dateStr = dayjs().add(index, 'day').format("M/D/YYYY");
    if (index === 0) {  // cant add ( inside div-h5-span etc. 
        dateStr = "  (" + dateStr + ")";
    }
    myLog("Setting dayjs date to " + dateStr);
    dateEl.text(dateStr);
}  // end function 

// Set a date in the DOM. index=0 is today, 1 tomorrow, etc.
// With advice from stackoverflow.com/questions/44177417/how-to-display-openweathermap-weather-icon
function setDomIcon(index, iconCode, iconDescription) {
    myLog("Setting icon " + index + " to code " + iconCode + " " + iconDescription);
    var iconEl = $('#icon'+index);
    if (iconEl === null || iconEl === undefined) {
        myLog("Icon Element is undefined or null");
        return; 
    }
    srcStr = "https://openweathermap.org/img/w/";
    srcStr += iconCode + ".png"; 
    myLog("Setting icon src to " + srcStr);
    iconEl.attr("alt", "Weather Icon " + iconDescription);
    iconEl.attr("src", srcStr);
}  // end function setDomIcon

// Set todays date in the DOM
function setDomDateNotFound(index) {
    myLog("Setting date data not found." + index);
    var dateEl = $('#date-err');
    if (dateEl === null || dateEl === undefined) {
        myLog("Date-err Element is undefined or null");
        return; 
    }
    var dateStr = " No Data!!"
    myLog("Setting DOM no-date data error to " + dateStr);
    dateEl.text(dateStr);
}  // end function setDomDateNotFound

// Set City Not Found and date in the DOM - MJS 12.30.23
function setCityNotFoundInDom(cityName) {
    var cityEl = $('#city-err');
    if (cityEl === null || cityEl === undefined) {
        myLog("city-err is undefined or null");
    }
    myLog("Setting " + cityName + " to not found.");
    cityEl.text(" Not Found ");
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
 
// see if the value is in local storage.  MJS 12.30.23 
function locallyStoredValueExists(value) {
    console.log("Searching for locally stored value .... " + value);
    var count = getLocallyStoredDataCount(localStorePrefix);
    for (i=1; i<=count; i++ ) {
        if (localStorage.getItem(localStorePrefix+i).toLowerCase() === value.toLowerCase()) {  // no trim or lowerCase
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

// convert kelvin temperature to Fahrenheit
function kelvinToFahrenheit(inTemp) {
    return (inTemp - 273.15) * 1.8 + 32;
} 

// ============== code to execute when loading (const must be declared first) =======
// storeLocalData("Paris");
setDomDate(0);  // 0 => 
clearDomForecast(); // clear and data and err msgs.s
buttonifyLocalStorage(localStoreDiv, localStorePrefix); 
myLog("Done loading scritp.js page. ");