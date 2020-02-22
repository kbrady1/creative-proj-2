document.addEventListener('DOMContentLoaded', function preparePage() {
  const today = moment(new Date());

  document.getElementById('date-today').innerHTML = today.format('dddd, MMMM Do YYYY');
  getHolidays();
}, false);

function handleError() {
  document.getElementById('load-message').innerHTML = "Error Loading Holidays";
}

function getHolidays() {
  // Get the holidays for the year
  const url = "https://holidayapi.com/v1/holidays?key=0e6ebcab-d9be-4ed5-a056-4dd06ac52984&country=US&year=2019";
  fetch(url)
    .then(function(response) {
      return response.json();
    }).then(function(json) {
      parseHolidays(json);
    }).catch(function() {
      handleError();
    });
}

function parseHolidays(json) {
  const today = moment(new Date());
  let holidaysByMonth = {};
  let holidaysToday = [];

  json.holidays.forEach(element => {
    const date = moment(element.date, 'YYYY-MM-DD');
    const month = parseInt(date.format('M'));
    const day = date.format('D')

    if(!(month in holidaysByMonth)) {
      holidaysByMonth[month] = [];
    }
    holidaysByMonth[month].push(element);

    //Check for holidaysToday
    if(day == today.format('D') && month == today.format('M')) {
      holidaysToday.push(element);
    }
  });

  //Show this and next months holidays;
  const thisMonth = parseInt(today.format('M'));
  const nextMonth = thisMonth == 12 ? 0 : (thisMonth + 1);

  const sortedHolidaysThisMonth = holidaysByMonth[thisMonth].filter(a => moment(a.date, 'YYYY-MM-DD').add(1, 'year').isAfter(today)).sort(function(a, b) {
    return moment(a.date, 'YYYY-MM-DD').format('D') - moment(b.date, 'YYYY-MM-DD').format('D');
  });

  let sortedUpcomingHolidays = sortedHolidaysThisMonth;
  for(let i = nextMonth; i < nextMonth + 11; i++) {
    const monthIndex = i > 12 ? i - 12 : i;
    const sortedHolidays = holidaysByMonth[monthIndex].sort(function(a, b) {
      return moment(a.date, 'YYYY-MM-DD').format('D') - moment(b.date, 'YYYY-MM-DD').format('D');
    });

    sortedUpcomingHolidays= sortedUpcomingHolidays.concat(sortedHolidays);
  }

  setUpToday(holidaysToday);
  setUpcoming(sortedUpcomingHolidays);
}

function createTodayHolidayText(holiday) {
  return "<div>Today is <br>" + holiday.name + "</em>.<br> It is " + (holiday.public ? "" : "not") + " a public holiday.</div>";
}

function setUpToday(holidays) {
  let innerText = "";

  if(holidays.length == 0) {
    innerText = "<div>There are <em>0</em> holidays today.</div>"
  } else {
    innerText = holidays.map(element => addTodayHolidayText(element)).reduce((total, next) => total + next);
  }

  document.getElementById('today').innerHTML = innerText;
}

function daysUntil(holiday) {
  let date = moment(holiday.date, 'YYYY-MM-DD').add(1, 'year');

  return date.diff(moment(new Date()), 'days');
}

function createUpcomingHolidayText(holiday) {
  return "<div class='card-details'><div class='card-days'>" + daysUntil(holiday) + "</div><div class='card-info'>Days until <br><em>" + holiday.name + "</em></div></div>";
}

function setUpcoming(holidays) {
  let upcomingText = "<h6>Next Holiday</h6>";
  let upcomingPublicText = "<h6>Next Public Holiday</h6>";
  let foundPublic = false;

  if(holidays.length > 0) {
    upcomingText += createUpcomingHolidayText(holidays[0]);

    holidays.forEach(element => {
      if(!foundPublic && element.public) {
        upcomingPublicText += createUpcomingHolidayText(element);
        foundPublic = true;
      }
    });

    if(!foundPublic) {

      upcomingPublicText += "<div>There are <em>0</em> upcoming public holidays.</div>"
    }

    createUpcomingTable(holidays);
  } else {
    upcomingText += "<div>There are <em>0</em> upcoming holidays.</div>"
    upcomingPublicText += "<div>There are <em>0</em> upcoming public holidays.</div>"
  }

  document.getElementById('next-holiday').innerHTML = upcomingText;
  document.getElementById('next-public').innerHTML = upcomingPublicText;
}

function createUpcomingTable(holidays) {
  let tableHtml = "<div class='row'><div class='col-lg'align='center'><h2>All Upcoming Holidays</h2></div></div>"
  tableHtml += "<div class='row'><div class='col-lg' align='center'><table class='holiday-table'>"
  tableHtml += "<tr><th>Date</th><th>Name</th><th>Public Holiday</th></tr>"

  holidays.forEach(element => {
    let date2020 = moment(element.date, 'YYYY-MM-DD').add(1, 'year');
    let dateNext = (date2020.isAfter(moment(new Date())) ? date2020 : date2020.add(1, 'year')).format('MMMM Do YYYY');
    let publicText = element.public ? "YES" : "NO";
    tableHtml += "<tr><td>" + dateNext + "</td><td>" + element.name + "</td><td>" + publicText + "</td></tr>";
  })

  tableHtml += "</table></div></div>";

  document.getElementById('upcoming-table').innerHTML = tableHtml;
}
