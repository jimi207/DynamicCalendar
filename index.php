<?php
header("Access-Control-Allow-Origin: *");
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Royal Brunei Dynamic Calendar</title>

  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">

  <!-- jQuery UI CSS -->
  <link
    rel="stylesheet"
    href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css" />

  <!-- jQuery and jQuery UI -->
  <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
  <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>

  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Custom CSS -->
  <link rel="stylesheet" href="calendar.css">
</head>

<body class="bg-light">
  <div class="container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10 col-xl-8">

        <!-- Server Time Badge -->
        <div class="mb-3">
          <span class="badge bg-secondary">
            <i class="bi bi-clock"></i>
            Current server time: <?php echo date("Y-m-d H:i:s"); ?>
          </span>
        </div>

        <!-- Date Selection Form -->
        <form id="dateSelectionForm" class="date-form mb-4" onsubmit="return false;">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">
                <i class="bi bi-calendar3"></i>
                Dynamic calendar version 1.0
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3 justify-content-center">
                <div class="col-md-6 col-lg-3">
                  <label for="departureCity" class="form-label fw-semibold">
                    <i class="bi bi-geo-alt text-primary"></i>
                    From
                  </label>
                  <select
                    id="departureCity"
                    name="departureCity"
                    class="form-control form-control-lg text-center">
                    <option value="BWN" selected>BWN</option>
                    <option value="KUL">KUL</option>
                    <option value="SIN">SIN</option>
                    <option value="LHR">LHR</option>
                  </select>
                </div>
                <div class="col-md-6 col-lg-3">
                  <label for="arrivalCity" class="form-label fw-semibold">
                    <i class="bi bi-geo-alt-fill text-success"></i>
                    To
                  </label>
                  <select
                    id="arrivalCity"
                    name="arrivalCity"
                    class="form-control form-control-lg text-center">
                    <option value="BWN">BWN</option>
                    <option value="KUL">KUL</option>
                    <option value="SIN" selected>SIN</option>
                    <option value="LHR">LHR</option>
                  </select>
                </div>
                <div class="col-md-6 col-lg-3">
                  <label for="departureDate" class="form-label fw-semibold">
                    <i class="bi bi-airplane-engines text-primary"></i>
                    Departure
                  </label>
                  <input
                    type="text"
                    id="departureDate"
                    name="departureDate"
                    class="form-control form-control-lg text-center"
                    readonly
                    placeholder="Select date"
                    style="cursor: pointer;" />
                </div>
                <div class="col-md-6 col-lg-3">
                  <label for="returnDate" class="form-label fw-semibold">
                    <i class="bi bi-airplane-engines-fill text-success"></i>
                    Return
                  </label>
                  <input
                    type="text"
                    id="returnDate"
                    name="returnDate"
                    class="form-control form-control-lg text-center"
                    readonly
                    placeholder="Select date"
                    style="cursor: pointer;" />
                </div>
              </div>
            </div>
          </div>
        </form>

        <!-- Calendar Wrapper -->
        <div class="calendar-wrapper is-hidden">
          <div class="card shadow">
            <div class="card-header bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center flex-wrap">
                <div class="d-flex align-items-center gap-3">
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    onclick="resetDates()">
                    <i class="bi bi-arrow-clockwise"></i>
                    Reset dates
                  </button>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="oneWayCheckbox"
                      onchange="toggleOneWay()">
                    <label class="form-check-label fw-semibold" for="oneWayCheckbox">
                      One-way
                    </label>
                  </div>
                </div>
                <div id="totalFare" class="text-center flex-grow-1 mx-3 my-2 my-md-0">
                </div>
                <button
                  type="button"
                  class="btn btn-primary"
                  onclick="completeDateSelection()">
                  <i class="bi bi-check-circle"></i>
                  Done
                </button>
              </div>
            </div>
            <div class="card-body p-3">
              <div id="dateRangeCalendar"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Custom JavaScript -->
  <script src="calendar.js"></script>
</body>

</html>