//const str = "<?php echo date('d.m.Y'); ?>";
//const date = new Date(str.split(".").reverse().join("-"));

let departureData = {};
let returnData = {};
//let selectedDeparture = new Date(2026, 2, 3); // March 3, 2026
let selectedDeparture = null; // March 3, 2026

let selectedReturn = null;
let fareCurrency = "";
let isOneWaySelected = false;

//const departDataURL = 'https://farecapx.flyroyalbrunei.com/availableFlightDates?depPort=BWN&arrPort=SIN&startDate=18.09.2025&endDate=18.09.2026&tripType=RT&direction=OUT&cabin=Y';
//const returnDataURL = 'https://farecapx.flyroyalbrunei.com/availableFlightDates?depPort=BWN&arrPort=SIN&startDate=18.09.2025&endDate=18.09.2026&tripType=RT&direction=IN&cabin=Y';

function retrieveDataURL(from, to, direction = "OUT") {
  console.log("oneway: ", isOneWaySelected);
  let url = "";
  let tripType = "RT";
  if (isOneWaySelected) {
    tripType = "OW";
  }
  let range = 180; // Default range of 360 days
  console.log("Retrieving data URL with parameters:", {
    from,
    to,
    direction,
    tripType,
  });
  // Parse dd.mm.yyyy format to Date object
  const today = new Date();
  const startDate =
    ("0" + today.getDate()).slice(-2) +
    "." +
    ("0" + (today.getMonth() + 1)).slice(-2) +
    "." +
    today.getFullYear();
  const [day, month, year] = startDate.split(".").map(Number);
  let endDate = new Date(year, month - 1, day);
  endDate.setDate(endDate.getDate() + range);
  const endDateString =
    ("0" + endDate.getDate()).slice(-2) +
    "." +
    ("0" + (endDate.getMonth() + 1)).slice(-2) +
    "." +
    endDate.getFullYear();
  url = `https://farecapx.flyroyalbrunei.com/availableFlightDates?depPort=${from}&arrPort=${to}&startDate=${startDate}&endDate=${endDateString}&tripType=${tripType}&direction=${direction}`;
  console.log("Constructed URL:", url);
  return url;
}

function calculateTotalFare() {
  console.log(
    "Calculating total fare with departure:",
    selectedDeparture,
    "and return:",
    selectedReturn,
  );
  let departureFare = 0;
  let returnFare = 0;
  let totalFare = 0;

  // Get departure fare
  if (selectedDeparture) {
    const departureFareValue = departureData[selectedDeparture.toDateString()];
    console.log(
      "Departure fare for",
      selectedDeparture.toDateString(),
      ":",
      departureFareValue,
    );
    if (departureFareValue && !isNaN(departureFareValue)) {
      departureFare = parseFloat(departureFareValue); // Convert to number
    }
  }

  // Get return fare
  if (selectedReturn) {
    const returnFareValue = returnData[selectedReturn.toDateString()];
    console.log(
      "Return fare for",
      selectedReturn.toDateString(),
      ":",
      returnFareValue,
    );
    if (returnFareValue && !isNaN(returnFareValue)) {
      returnFare = parseFloat(returnFareValue); // Convert to number
    }
  }

  // Calculate total as sum of departure and return fares
  totalFare = departureFare + returnFare;
  console.log(
    "Calculated total fare:",
    `${departureFare} + ${returnFare} = ${totalFare}`,
  );

  let totalFareAmount =
    totalFare > 0 ? `${fareCurrency} ${totalFare}` : "N/A";
//console.log("isOneWaySelected", isOneWaySelected);
  if (!isOneWaySelected) {
    if (departureFare > 0 && returnFare == 0) {
      totalFareAmount = "N/A";
    }
    console.log('returnfare: ' + returnFare);
  }

  if (totalFareAmount !== "N/A") {
    $("#totalFare").html(`
        <span class="badge bg-info fs-6">
          Total fare from <strong>${totalFareAmount}</strong> per adult
        </span>
      `);
  } else {
    $("#totalFare").html(``);
    totalFare = 0;
  }


  return totalFare;
}

// Function to add fare prices to calendar cells
function addFarePrices(leg = "departure", departureDataSrc, returnDateSrc) {
  console.log(`Adding fare prices for leg: ${leg}`);
  setTimeout(() => {
    $(".ui-datepicker td").each(function () {
      const $cell = $(this);
      const year = $cell.data("year");
      //const year = '2026';
      const month = $cell.data("month");
      const day = parseInt(
        $cell.clone().find(".fare-price").remove().end().text(),
      );

      if (year && month !== undefined && day && !isNaN(day)) {
        //console.log("Processing cell for date:", year, month, day);
        const cellDate = new Date(year, month, day);
        const dateString = cellDate.toDateString();
        //console.log(`Processing cell for date: ${dateString} (leg: ${leg})`);

        // Remove existing fare price
        $cell.find(".fare-price").remove();

        // If showing return fares and departure is selected,
        // don't show fares for departure date and dates before it
        if (leg === "return" && selectedDeparture) {
          const departureDate = new Date(selectedDeparture);
          if (cellDate <= departureDate) {
            return; // Skip showing fare for this date
          }
        }

        let fare = null;
        // Check for departure or return fare
        //console.log('leg:', leg, 'dateString:', dateString);
        if (leg === "departure") {
          fare = departureDataSrc[dateString];
        } else if (leg === "return") {
          fare = returnDateSrc[dateString];
        }
        //console.log(`Fare for ${dateString} (leg: ${leg}):`, fare);
        //let fare = departureData[dateString] || returnData[dateString];

        if (fare) {
          $cell.find("a").append(`<span class="fare-price">${fare}</span>`);
        } else {
          //console.log(`No fare for ${dateString} (leg: ${leg})`);
        }
      }
    });
    // Apply range highlighting after fare prices are added
    //updateRangeHighlight();
  }, 50);
}

function clearFarePrices() {
  $(".ui-datepicker td").each(function () {
    const $cell = $(this);
    $cell.find(".fare-price").remove();
  });
}

// Function to update range highlighting
function updateRangeHighlight() {
  //console.log('Updating range highlight with departure:', selectedDeparture, 'and return:', selectedReturn);
  setTimeout(() => {
    $(".ui-datepicker td")
      .removeClass("range-start")
      .removeClass("range-middle")
      .removeClass("range-end");
    //console.log('Cleared existing range classes from calendar cells');

    // Skip range highlighting if one-way is selected
    if (isOneWaySelected) {
      return;
    }

    if (selectedDeparture && selectedReturn) {
      //console.log('Applying range highlight from', selectedDeparture, 'to', selectedReturn);
      const startDate = new Date(selectedDeparture);
      const endDate = new Date(selectedReturn);

      $(".ui-datepicker td").each(function () {
        const $cell = $(this);
        const year = $cell.data("year");
        const month = $cell.data("month");
        const day = parseInt(
          $cell.find("a").length
            ? $cell
                .find("a")
                .contents()
                .filter(function () {
                  return this.nodeType === 3; // Node.TEXT_NODE
                })
                .text()
            : $cell.text(),
        );

        //console.log('Processing cell:', year, month, day);

        if (year && month !== undefined && day && !isNaN(day)) {
          const cellDate = new Date(year, month, day);

          if (cellDate.getTime() === startDate.getTime()) {
            $cell.addClass("range-start");
            if (cellDate.getTime() === endDate.getTime()) {
              $cell.addClass("range-end");
            }
          } else if (cellDate.getTime() === endDate.getTime()) {
            $cell.addClass("range-end");
          } else if (cellDate > startDate && cellDate < endDate) {
            $cell.addClass("range-middle");
          }
        }
      });
    }
  }, 50);
}

$(document).on("click", "#departureDate, #returnDate", function (e) {
  e.preventDefault();
  reset(); // Clear previous selections and fares when opening calendar
  console.log("Date input clicked, showing calendar");

  loadFares($("#departureCity").val(), $("#arrivalCity").val()).then(() => {
    initializeCalendar();
    addFarePrices("departure", departureData, returnData); // Update fares for departure selection
    updateRangeHighlight();
  });

  setTimeout(() => {
    //addFarePrices();
    updateRangeHighlight();
  }, 100);
});

// Toggle one-way functionality
function toggleOneWay() {
  const isOneWay = document.getElementById("oneWayCheckbox").checked;
  const returnDateCol = document
    .querySelector("#returnDate")
    .closest(".col-md-6");

  // Update the global variable FIRST before any other operations
  isOneWaySelected = isOneWay;
  console.log("One-way state changed to:", isOneWaySelected);

  if (isOneWay) {
    reset();
    //console.log('One-way checkbox checked, enabling one-way mode');

    // Hide return date input
    returnDateCol.classList.add("return-date-hidden");

    // Clear return date selection
    selectedReturn = null;
    document.getElementById("returnDate").value = "";

    // Recalculate total fare
    calculateTotalFare();

    // Reload fares with one-way settings
    //loadFares($("#departureCity").val(), $("#arrivalCity").val());
    // Update calendar highlighting
    departureData = {};
    returnData = {}; //clear
    loadFares($("#departureCity").val(), $("#arrivalCity").val()).then(() => {
      addFarePrices("departure", departureData, returnData); // Update fares for departure selection
      updateRangeHighlight();
    });

    console.log("One-way mode enabled");
  } else {
    resetDates(); // Clear all selections and fares when switching back to round-trip
    // Show return date input
    returnDateCol.classList.remove("return-date-hidden");

    // Reload fares with round-trip settings
    //loadFares($("#departureCity").val(), $("#arrivalCity").val());

    console.log("Round-trip mode enabled");
  }
}

function reset() {
  departureData = {};
  returnData = {};
  fareCurrency = "";
  selectedDeparture = null;
  selectedReturn = null;
  $("#departureDate").val("");
  $("#returnDate").val("");
  $("#totalFare").html("");
  $("#dateRangeCalendar").datepicker("setDate", null);
}

// Reset dates function
function resetDates() {
  reset();
  //updateRangeHighlight();
  //addFarePrices('departure', departureData, returnData);
  //$('.ui-datepicker td').removeClass('range-start range-middle range-end');

  //loadFares($("#departureCity").val(), $("#arrivalCity").val());

  $("#dateRangeCalendar").datepicker("setDate", null);

  loadFares($("#departureCity").val(), $("#arrivalCity").val()).then(() => {
    console.log("Data reloaded after reset");
    //initializeCalendar();
    addFarePrices("departure", departureData, returnData); // Update fares for departure selection
    updateRangeHighlight();
  });

  setTimeout(() => {
    //addFarePrices();
    updateRangeHighlight();
  }, 100);
}

// Show calendar when clicking on either date input
//    $(document).on('click', '#departureDate, #returnDate', function(e) {

// Add Bootstrap tooltip for better UX
$(document).ready(function () {
  // Initialize Bootstrap tooltips if needed
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

// Fetch both datasets and initialize the calendar
// Show loading spinner
const loadingSpinner = `
        <div id="loadingSpinner" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading flight data...</span>
          </div>
          <div class="mt-2">
            <small class="text-muted">Loading available dates...</small>
          </div>
        </div>
      `;

/*function loadFares(json) {
  json.availableDates.forEach(item => {
    const fltDate = item.flightDate.split(".").reverse().join("-");
    returnData[new Date(fltDate).toDateString()] = item.fare;
    fareCurrency = item.currency; // Store the currency
  });

}*/

$(document).on("click", "#departureDate", function (e) {
  //loadFares($("#departureCity").val(), $("#arrivalCity").val());
});
//e.preventDefault();
async function loadFares(departureCity, arrivalCity) {
  //$("#departureCity").val()
  let useCachedData = true;
  $("#dateSelectionForm").after(loadingSpinner);
  console.log("starting data fetch...");
  const CACHE_KEY_PREFIX = "flightFares_";
  const CACHE_DURATION = 3600000; // 1 hour in milliseconds

  function getCacheKey(from, to, direction) {
    return `${CACHE_KEY_PREFIX}${from}_${to}_${direction}`;
  }

  function getCachedFares(cacheKey) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log("Using cached data for:", cacheKey);
        return data;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
    return null;
  }

  function setCachedFares(cacheKey, data) {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: data,
        timestamp: Date.now(),
      }),
    );
  }

  let useCache = false;

  let departDataURL = retrieveDataURL(
    $("#departureCity").val(),
    $("#arrivalCity").val(),
    "OUT",
  );
  let returnDataURL = retrieveDataURL(
    $("#departureCity").val(),
    $("#arrivalCity").val(),
    "IN",
  );

  const departCacheKey = getCacheKey(
    $("#departureCity").val(),
    $("#arrivalCity").val(),
    "OUT",
  );
  const returnCacheKey = getCacheKey(
    $("#departureCity").val(),
    $("#arrivalCity").val(),
    "IN",
  );

  const cachedDepartData = getCachedFares(departCacheKey);
  const cachedReturnData = getCachedFares(returnCacheKey);

  try {
    const [departJson, returnJson] = await Promise.all([
      cachedDepartData && useCache
        ? Promise.resolve(cachedDepartData)
        : fetch(departDataURL)
            .then((r) => r.json())
            .then((d) => {
              setCachedFares(departCacheKey, d);
              return d;
            }),
      cachedReturnData && useCache
        ? Promise.resolve(cachedReturnData)
        : fetch(returnDataURL)
            .then((r) => r.json())
            .then((d) => {
              setCachedFares(returnCacheKey, d);
              return d;
            }),
    ]);

    // Remove loading spinner
    console.log("[DEBUG] Departure data:", departJson);
    console.log("[DEBUG] Return data:", returnJson);

    // Process departure data
    departJson.availableDates.forEach((item) => {
      const fltDate = item.flightDate.split(".").reverse().join("-");
      departureData[new Date(fltDate).toDateString()] = item.fare;
      fareCurrency = item.currency; // Store the currency
    });

    // Process return data
    returnJson.availableDates.forEach((item) => {
      const fltDate = item.flightDate.split(".").reverse().join("-");
      returnData[new Date(fltDate).toDateString()] = item.fare;
      fareCurrency = item.currency; // Store the currency
    });

    console.log("Fare currency set to:", fareCurrency);

    //console.log('Departure data processed:', departureData);
    //console.log('Return data processed:', returnData);

    $("#loadingSpinner").remove();
    $(".calendar-wrapper").removeClass("is-hidden");
  } catch (error) {
    // Remove loading spinner
    $("#loadingSpinner").remove();

    console.error("[ERROR] Failed to fetch flight data:", error);

    // Create a Bootstrap error alert
    const errorAlert = `
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <h6 class="alert-heading"><i class="bi bi-exclamation-triangle-fill"></i> Loading Error</h6>
            <p class="mb-0">Failed to load flight data. Please check your connection and try again.</p>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        `;

    // Insert error message before the form
    $("#dateSelectionForm").before(errorAlert);
  }
}

function initializeCalendar() {
  $("#dateRangeCalendar").datepicker({
    inline: true,
    numberOfMonths: 2,
    showOtherMonths: true,
    selectOtherMonths: false,
    minDate: 0, // Today
    maxDate: 360, // 360 days from today
    defaultDate: 0, // Set default to today
    beforeShowDay: function (date) {
      const dateString = date.toDateString();
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 360);
      maxDate.setHours(23, 59, 59, 999); // Set to end of day

      // Normalize the input date to start of day for comparison
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);

      // Check if date is within allowed range
      if (compareDate < today || compareDate > maxDate) {
        return [false, "ui-datepicker-unselectable", "Date not available"];
      }

      const isDepartureAvailable = departureData[dateString];
      const isReturnAvailable = returnData[dateString];

      if (isDepartureAvailable || isReturnAvailable) {
        return [true, "", ""];
      }
      return [true, "", ""];
    },
    onSelect: function (dateText, inst) {
      const selectedDate = $.datepicker.parseDate("mm/dd/yy", dateText);
      const dateString = selectedDate.toDateString();

      // Format date as dd.mm.yyyy
      const formattedDate =
        ("0" + selectedDate.getDate()).slice(-2) +
        "." +
        ("0" + (selectedDate.getMonth() + 1)).slice(-2) +
        "." +
        selectedDate.getFullYear();

      //console.log('selectedDeparture: ' + selectedDeparture);

      if (!selectedDeparture || (selectedDeparture && selectedReturn)) {
        console.log("[CASE A]");
        // Select departure date
        selectedDeparture = selectedDate;
        console.log("Departure date selected:", selectedDeparture);
        selectedReturn = null;
        $("#departureDate").val(formattedDate);
        $("#returnDate").val("");
        //updateRangeHighlight();
        //console.log('Selected fare value:', departureData[dateString] || returnData[dateString]);
        console.log("Departure selected:", formattedDate);
        const departureFare = departureData[dateString];
        console.log("Departure fare selected:", departureFare);
        if (isOneWaySelected) {
          addFarePrices("departure", departureData, returnData); // Show return fares after departure is selected
          calculateTotalFare(); // Calculate total fare when departure date is selected
        } else {
          addFarePrices("return", departureData, returnData);
        }
        updateRangeHighlight();
      } else if (selectedDeparture && !selectedReturn && !isOneWaySelected) {
        // Select return date only if not in one-way mode
        console.log("[CASE B]");
        if (selectedDate >= selectedDeparture) {
          selectedReturn = selectedDate;
          $("#returnDate").val(formattedDate);
          console.log("Return selected:", formattedDate);
          const returnFare = returnData[dateString];
          console.log("Return fare selected:", returnFare);
          addFarePrices("return", departureData, returnData); // Ensure return fares are shown
          calculateTotalFare(); // Calculate total fare when return date is selected
        } else {
          // If selected date is before departure, make it the new departure
          selectedDeparture = selectedDate;
          selectedReturn = null;
          $("#departureDate").val(formattedDate);
          $("#returnDate").val("");
          console.log("New departure selected:", formattedDate);
          calculateTotalFare(); // Recalculate fare for new departure
        }
      } else if (selectedDeparture && isOneWaySelected) {
        console.log("[CASE C]");
        // In one-way mode, selecting another date replaces the departure date
        selectedDeparture = selectedDate;
        selectedReturn = null;
        $("#departureDate").val(formattedDate);
        console.log("One-way departure updated:", formattedDate);
        addFarePrices("departure", departureData, returnData);
        calculateTotalFare();
      }

      //addFarePrices();
      updateRangeHighlight();
    },
    onChangeMonthYear: function () {
      //addFarePrices();
      addFarePrices("departure", departureData, returnData); // Update fares for departure selection

      updateRangeHighlight();
    },
  });
}

// Complete date selection function with Bootstrap styling
function completeDateSelection() {
  const isOneWay = document.getElementById("oneWayCheckbox").checked;
  //console.log('Completing date selection with departure:', selectedDeparture, 'and return:', selectedReturn);
  if (selectedDeparture && (selectedReturn || isOneWay)) {
    // Create a success message
    const isOneWay = document.getElementById("oneWayCheckbox").checked;
    const returnInfo = isOneWay
      ? ""
      : `<p class="mb-0"><strong>Return:</strong> ${$("#returnDate").val()}</p>`;
    const message = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
              <h6 class="alert-heading"><i class="bi bi-check-circle-fill"></i> Dates Selected!</h6>
              <p class="mb-1"><strong>Departure:</strong> ${$("#departureDate").val()}</p>
              ${returnInfo}
              <p class="mb-0"><strong>Total Fare:</strong> ${fareCurrency} ${calculateTotalFare()}</p>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          `;

    // Insert the message before the calendar wrapper
    $(".calendar-wrapper").before(message);

    // Hide the calendar
    $(".calendar-wrapper").addClass("is-hidden");

    // Auto-remove the alert after 5 seconds
    setTimeout(() => {
      $(".alert").fadeOut();
    }, 8000);
  } else {
    // Create an error message
    const isOneWay = document.getElementById("oneWayCheckbox").checked;
    const errorText = isOneWay
      ? "Please select a departure date."
      : "Please select both departure and return dates.";
    const errorMessage = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
              <h6 class="alert-heading"><i class="bi bi-exclamation-triangle-fill"></i> Incomplete Selection</h6>
              <p class="mb-0">${errorText}</p>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          `;

    // Insert the message before the calendar wrapper
    $(".calendar-wrapper").before(errorMessage);

    // Auto-remove the alert after 3 seconds
    setTimeout(() => {
      $(".alert").fadeOut();
    }, 3000);
  }
}
