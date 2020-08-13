var DateTime = luxon.DateTime;

moment.updateLocale('en', {
    weekdays : [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Shabbos"
    ]
  });

const hdf = new KosherZmanim.HebrewDateFormatter();

hdf.setHebrewFormat(true);
hdf.setLongWeekFormat(true);
hdf.setUseGershGershayim(true);
hdf.setHebrewOmerPrefix("ל");

let print = document.getElementById("print");

//Check for cookies

document.getElementById('searchTextField').value = getCookie("address");
document.querySelector("input#cityLat").value = getCookie("lat");
document.querySelector("input#cityLng").value = getCookie ("lng")
document.querySelector("input#elevation").value = getCookie("elevation")
document.getElementById('nameInput').value = getCookie("name")

document.getElementById("chart").dataset.week = moment().week();

if(getCookie("address") && getCookie("lat")){
  calculate();
}




async function calculate(weekNumber= moment().week()) {

  $("td").each(function(){this.innerHTML = ""})

  document.getElementById("loading").hidden = false;


  if(!document.querySelector("input#cityLat").value == ""){
    document.getElementById("warning").hidden=true;
    document.getElementById("sample").hidden=true;

    document.getElementById('name').innerText = document.getElementById('nameInput').value
    document.getElementById('city').innerText = document.getElementById('city2').value


    

    let yomTov = "";
    let parsha = "";
    let calculatedTimeZoneId = getCookie("timezone")

    if(!getCookie("timezone") || document.getElementById('searchTextField').value != getCookie("address")){
      console.log("Getting Timezone");
      await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${document.querySelector("input#cityLat").value},${document.querySelector("input#cityLng").value}&timestamp=${moment().unix()}&key=AIzaSyCqbfhsDo4_qPDH94pe4AI8k2h4K9LcRQE`)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            calculatedTimeZoneId = data.timeZoneId;
            setCookie("timezone", calculatedTimeZoneId,30);
          });
    }else{
      console.log("Already have accurate timezone " + getCookie("timezone"))
    }
 

    

    
    setCookie("address",document.getElementById('searchTextField').value,30);
    setCookie("lat", document.querySelector("input#cityLat").value,30 )
    setCookie("lng", document.querySelector("input#cityLng").value,30)
    setCookie("elevation",document.querySelector("input#elevation").value,30)
    setCookie("name",document.getElementById('nameInput').value,30)

    document.getElementById("loading").hidden = true;
    print.hidden = false;
    document.getElementById("printButton").hidden = false;

    for(dayOfWeek =0 ; dayOfWeek<7 ;dayOfWeek++){
    

        let currentDate = moment().week(weekNumber).day(dayOfWeek).toDate()

       // console.log(Number.parseFloat(document.querySelector("input#elevation").value))

        const jc = new KosherZmanim.JewishCalendar(currentDate);
        const jd = new KosherZmanim.JewishDate(currentDate);
        const options = {
            date: currentDate,
            timeZoneId: calculatedTimeZoneId,
            locationName: "Who Cares",
            latitude: Number.parseFloat(document.querySelector("input#cityLat").value),
            longitude: Number.parseFloat(document.querySelector("input#cityLng").value),
            elevation: Number.parseFloat(document.querySelector("input#elevation").value),
            complexZmanim: true,
          };

          console.log(options)

          let zmanimJSON = KosherZmanim.getZmanimJson(options)

          console.log(zmanimJSON);
          if(hdf.formatYomTov(jc)){
            yomTov = " - " + hdf.formatYomTov(jc);
          }
          
          parsha = `פרשת ${hdf.formatParsha(jc)}`
          if(jc.isShabbosMevorchim()){
              parsha += ` - מברכים`
            } 
            if(hdf.formatSpecialParsha(jc)){
              parsha += ` - ${hdf.formatSpecialParsha(jc)}`
            } 

            console.log(KosherZmanim.YomiCalculator.getDafYomiBavli(jc))
          document.querySelector(`.dayOfWeek > [class="${dayOfWeek}"]`).innerHTML = moment(currentDate).format("dddd");
          document.querySelector(`.Date > [class="${dayOfWeek}"]`).innerText =hdf.formatHebrewNumber(jd.getJewishDayOfMonth()) + " " + hdf.formatMonth(jd) + "\n" + moment(currentDate).tz(calculatedTimeZoneId).format("MMMM Do")
          document.querySelector(`.DafYomi > [class="${dayOfWeek}"]`).innerHTML = hdf.formatDafYomiBavli(KosherZmanim.YomiCalculator.getDafYomiBavli(jc))
          document.querySelector(`.Omer > [class="${dayOfWeek}"]`).innerHTML = hdf.formatOmer(jc)
          document.querySelector(`.YomTov > [class="${dayOfWeek}"]`).innerHTML = hdf.formatYomTov(jc) 
          document.querySelector(`.AlosHashachar > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.AlosHashachar).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.AlosHashachar).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.Misheyakir10Point2Degrees > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.Misheyakir10Point2Degrees).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.Misheyakir10Point2Degrees).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.SeaLevelSunrise > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.SeaLevelSunrise).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.SeaLevelSunrise).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.SofZmanShmaMGA > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.SofZmanShmaMGA).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.SofZmanShmaMGA).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.SofZmanShmaGRA > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.SofZmanShmaGRA).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.SofZmanShmaGRA).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.SofZmanTfilaMGA > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.SofZmanTfilaMGA).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.SofZmanTfilaMGA).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.SofZmanTfilaGRA > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.SofZmanTfilaGRA).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.SofZmanTfilaGRA).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.Chatzos > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.Chatzos).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.Chatzos).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.MinchaGedolaGreaterThan30 > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.MinchaGedolaGreaterThan30).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.MinchaGedolaGreaterThan30).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.MinchaKetanaBaalHatanya > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.MinchaKetanaBaalHatanya).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.MinchaKetanaBaalHatanya).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.MinchaKetana72Minutes > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.MinchaKetana72Minutes).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.MinchaKetana72Minutes).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.PlagHaminchaBaalHatanya > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.PlagHaminchaBaalHatanya).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.PlagHaminchaBaalHatanya).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.PlagHamincha72Minutes > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.PlagHamincha72Minutes).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.PlagHamincha72Minutes).tz(calculatedTimeZoneId).format(":ss")}</span>`
          if ((jc.hasCandleLighting() && !jc.isErevYomTovSheni()) || jc.dayOfWeek == 6) document.querySelector(`.CandleLighting > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.CandleLighting).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.CandleLighting).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.SeaLevelSunset > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.SeaLevelSunset).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.SeaLevelSunset).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.Tzais > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.Tzais).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.Tzais).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.Tzais60 > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.Tzais60).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.Tzais60).tz(calculatedTimeZoneId).format(":ss")}</span>`
          document.querySelector(`.Tzais72 > [class="${dayOfWeek}"]`).innerHTML = moment(zmanimJSON.Zmanim.Tzais72).tz(calculatedTimeZoneId).format("h:mm") + `<span class="seconds">${moment(zmanimJSON.Zmanim.Tzais72).tz(calculatedTimeZoneId).format(":ss")}</span>`
    }



    $('.checkbox:checked').each(function(){$(`.${this.id}`).show()})

    $('.checkbox:not(:checked)').each(function(){$(`.${this.id}`).hide()})

    if(!yomTov) $(".YomTov").hide()

   
  document.getElementById("moladDisplay").hidden= true;
  const shabbosJC = new KosherZmanim.JewishCalendar( moment().week(weekNumber).day(6));
  document.getElementById("parsha").innerText = parsha  + yomTov

    if(shabbosJC.isShabbosMevorchim()){
      let moladJC = new KosherZmanim.JewishCalendar(moment().week(weekNumber).day(6).add(8, 'days')) 
      document.getElementById("moladDisplay").innerHTML = moment(`${moladJC.getMolad().gregorianMonth}/${moladJC.getMolad().gregorianDayOfMonth}/${moladJC.getMolad().gregorianYear} ${moladJC.getMolad().moladHours}:${moladJC.getMolad().moladMinutes}`).format("dddd (MMM D) h:mm a") + " + " + moladJC.getMolad().moladChalakim + " chalakim :"  + '<span class="hebrew">'+ "מולד חודש " + hdf.formatMonth(moladJC) + "</span>"
      document.getElementById("moladDisplay").hidden= false;
    }
  }else{
    document.getElementById("warning").hidden=false;
  }


  
 
}

function nextWeek(){
  let currentWeek = document.getElementById("chart").dataset.week;
  currentWeek++;
  document.getElementById("chart").dataset.week = currentWeek;
  console.log(currentWeek);
  calculate(currentWeek);
}

function previousWeek(){
  let currentWeek = document.getElementById("chart").dataset.week;
  currentWeek--;
  document.getElementById("chart").dataset.week = currentWeek;
  console.log(currentWeek);
  calculate(currentWeek);
}
    
function initialize() {
    var input = document.getElementById('searchTextField');
    var autocomplete = new google.maps.places.Autocomplete(input);
    var elevator = new google.maps.ElevationService;
      google.maps.event.addListener(autocomplete, 'place_changed', async function () {
          var place = autocomplete.getPlace();

        
          document.getElementById('city2').value = document.getElementById('searchTextField').value;
          document.getElementById('cityLat').value = await place.geometry.location.lat();
          document.getElementById('cityLng').value = await place.geometry.location.lng();

          let position = new google.maps.LatLng(place.geometry.location.lat(),await place.geometry.location.lng())
          
          await elevator.getElevationForLocations({
            'locations': [position]
          }, function(results, status) {
                    if (status === 'OK')
                    {
                        if (results[0])
                        {
                          document.getElementById('elevation').value = results[0].elevation;
                        }
                    }
              });

        
          


      });
  }


  $('.checkbox').change(function() {

    $('.checkbox:checked').each(function(){$(`.${this.id}`).show()})

    $('.checkbox:not(:checked)').each(function(){$(`.${this.id}`).hide()})

  })

  google.maps.event.addDomListener(window, 'load', initialize);


  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
      alert("Welcome again " + user);
    } else {
      user = prompt("Please enter your name:", "");
      if (user != "" && user != null) {
        setCookie("username", user, 365);
      }
    }
  }

//  locationName = "Lakewood, NJ";
//  latitude = 40.096; //Lakewood, NJ
//  longitude = -74.222; //Lakewood, NJ
//  elevation = 0; //optional elevation
//  timeZone = KosherZmanim.TimeZone= "America/New_York";
//  zmanimLocation = new KosherZmanim.GeoLocation(locationName, latitude, longitude, elevation, timeZone);
//  czc = new KosherZmanim.ComplexZmanimCalendar(zmanimLocation);



function printt(quality = 5) {
  const filename  = 'ThisIsYourPDFFilename.pdf';

  html2canvas(document.querySelector('#print'), 
              {scale: quality}
           ).then(canvas => {
    let pdf = new jsPDF('l', 'in', 'letter');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', .5, .5, 10, 8);
    pdf.save(filename);
  });
}