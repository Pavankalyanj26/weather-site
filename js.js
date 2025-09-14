const key = "7a42072c40a74fe189355135250708";

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

async function result() {
  let enteredcity = document.getElementById("EnteredCity").value;

  if (!enteredcity) {
    alert("Please enter a city name");
    return;
  }

  try {
    // Get today date and dates for past 2 days
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(today.getDate() - 2);

    // Format dates for API calls
    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);
    const dayBeforeYesterdayStr = formatDate(dayBeforeYesterday);

    // 1) Fetch forecast for current + next 3 days (4 days total)
    const forecastApi = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${enteredcity}&days=4`;

    // 2) Fetch history for past 2 days separately
    const historyApi1 = `https://api.weatherapi.com/v1/history.json?key=${key}&q=${enteredcity}&dt=${yesterdayStr}`;
    const historyApi2 = `https://api.weatherapi.com/v1/history.json?key=${key}&q=${enteredcity}&dt=${dayBeforeYesterdayStr}`;

    // Make all requests concurrently
    const [forecastRes, hist1Res, hist2Res] = await Promise.all([
      axios.get(forecastApi),
      axios.get(historyApi1),
      axios.get(historyApi2),
    ]);

    // Show current day + next 3 days forecast summary
    currentdetails(forecastRes.data);
    showNext6Hours(forecastRes.data);
    showFutureDays(forecastRes.data.forecast.forecastday.slice(1)); // skip today, show next 3 days

    // Show past 2 days summary
    showPastDays([hist2Res.data, hist1Res.data]); // day before yesterday first, then yesterday

  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Failed to fetch weather data.");
  }
}

// Your existing function to show current weather remains the same
function currentdetails(data) {
  let sent = document.getElementById("dis");
  let atr_cli = document.getElementById("atr");
  let todays=document.getElementById("today");
  let sideline=document.getElementById("marq");
  let sidebar=`
    <marquee class="marquee" behavior="scroll" direction="left"scrollamount="10" > 
      <div class="spaced-text" >
        <span>🌅 Sunrise: ${data.forecast.forecastday[0].astro.sunrise}   </span>
        <span>🌇 Sunset: ${data.forecast.forecastday[0].astro.sunset} </span>
        <span>🌙 Moonrise: ${data.forecast.forecastday[0].astro.moonrise} </span>
        <span>🌘 Moonset: ${data.forecast.forecastday[0].astro.moonset}   </span>
      </div>
    </marquee>
  `
  sideline.innerHTML=sidebar;
  let html = `
    <nav >
        <nav id="hbox">
          <div class="details">
              <h1>${data.location.name}</h1>
              <p>${data.current.condition.text}</p>
              <h3>${data.current.temp_c}<sup>°</sup>C</h3>
          </div>
          <div>
              <img src="${data.current.condition.icon}" alt="Weather icon" id="img">
          </div>
        </nav>
        <h3 id="date">${data.location.localtime}</h3>
    </nav>
    `;

  let html2 = `
    <div id="extra">
      <div id="wind-sec" >
      <div><h4 class="backcolor" >Wind</h4> <img src="./images/wind.png" width="50px" height="50px" alt="" id="aniImg1" class="backcolor" > ${data.current.wind_kph} km/h</div>
      <div><h4 class="backcolor" >Wind Deg</h4> <img src="./images/wind.png" width="50px" height="50px" alt="" id="aniImg2" class="backcolor" > ${data.current.wind_degree}<sup class="backcolor" >°</sup></div>
      
      <div><h4 class="backcolor" >Wind direction</h4> <img src="./images/wind.png" width="50px" height="50px" alt="" id="aniImg3" class="backcolor" > ${data.current.wind_dir}</div>
      <div><h4 class="backcolor" >Wind Gust</h4> <img src="./images/wind.png" width="50px" height="50px" alt="" id="aniImg4" class="backcolor" > ${data.current.gust_kph} km/h</div>
      </div>
      <div id="likes">
        <div><h4 class="backcolor" >Feels like</h4>  ${data.current.feelslike_c}<sup class="backcolor" >°</sup>C</div>
        <div><h4 class="backcolor" >Wind Chill</h4> <img src="./images/wind.png" width="50px" height="50px" alt="" id="aniImg5" class="backcolor" > ${data.current.windchill_c}<sup class="backcolor">°</sup>C</div>
        <div><h4 class="backcolor" >Heat Index</h4> <img src="./images/fire.png" width="50px" height="50px" alt="" id="aniImg6" class="backcolor" > ${data.current.heatindex_c}<sup class="backcolor" >°</sup>C</div>
        <div><h4 class="backcolor" >Dew Point like</h4> <img src="./images/dew.png" width="50px" height="50px" alt="" id="aniImg7" class="backcolor" > ${data.current.dewpoint_c}<sup class="backcolor" >°</sup>C</div>
      </div>
    </div>
    `;

  sent.innerHTML = html;
  atr_cli.innerHTML = html2;
  let todayhtml=`
  <b>${data.location.localtime.split(" ")[0]}</b>
  <img src="${data.current.condition.icon}" alt="Weather icon" class="imgt">
  ${data.current.temp_c}°C
  <span id="avgh2">${data.current.humidity}%</span>
  
  
  `;
  todays.innerHTML=todayhtml
}

// Show next 6 hours for current day (same as your code)
function showNext6Hours(data) {
  let down = document.getElementById("night");
  const hourly = data.forecast.forecastday[0].hour;
  const currentHour = new Date(data.location.localtime).getHours();

  let html = `<div class="hourly-container"> <br> `;

  for (let i = currentHour; i < currentHour + 6 && i < 24; i++) {
    const hour = hourly[i];
    html += `
      <div class="hour-box">
        <p><strong class="nightback"  >${hour.time.split(" ")[1]}</strong></p>
        <img src="${hour.condition.icon}" alt="icon" class="imgf nightback" >
        <p class="nightback" >${hour.temp_c}°C</p>
        <p style="font-size: 12px;" class="nightback" >${hour.condition.text}</p>
      </div>
      
    `;
  }
  html += "</div>";
  down.innerHTML = html;
}

function showPastDays(days) {
  const container = document.getElementById("past-days");
  let html = `<div class="days-container">`;

  days.forEach(day => {
    const dayData = day.forecast.forecastday[0];
    // const pastdays=document.getElementById("past-days")
    html += `
    <div class="day-box"  >
        <b>${dayData.date}</b>
        <img src="${dayData.day.condition.icon}" alt="icon" class="imgt" />
        ${dayData.day.maxtemp_c}°C
        <span id="avgh">${dayData.day.avghumidity}%</span>
        
    </div>
    `
  });

  html += "</div>";
  container.innerHTML = html;
}


// Show next 3 days brief summary (exclude today)
function showFutureDays(days) {
  const container = document.getElementById("future-days");
  let html = `<div class="days-container">`;

  days.forEach(day => {
    html += `
      <div class="day-box" >
        <b>${day.date}</b>
        <img src="${day.day.condition.icon}" alt="icon" class="imgt" />
        ${day.day.maxtemp_c}°C
        <span id="avgh">${day.day.avghumidity}%</span>
    </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;
}
