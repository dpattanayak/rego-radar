window.addEventListener("resize", updateVideoSource("bg"));

// Function to format the input value on input change
function formatInput(input) {
  const errorText = document.getElementById("errorText");
  const submitButton = document.getElementById("submitButton");

  let inputValue = input.value.toUpperCase();
  let formattedValue = inputValue.replace(/[^A-Z0-9]/g, ""); // Remove non-alphanumeric characters

  // Enforce maxlength
  if (formattedValue.length > 11) {
    formattedValue = formattedValue.substring(0, 11);
  }

  const vehicleNumberRegex = /^[A-Z]{2}\d{2}[A-Z]{1,3}[0-9]{4}$/;
  const isValid = inputValue.length
    ? vehicleNumberRegex.test(inputValue.trim())
    : true;

  input.value = formattedValue;
  submitButton.disabled = !isValid;
  errorText.textContent = submitButton.disabled ? "Invalid Number" : "";
  errorText.style.display = submitButton.disabled ? "block" : "none";
}

function updateVideoSource(path = "bg") {
  let video = document.getElementById("backgroundVideo");
  if (window.innerWidth <= 600) {
    video.src = `videos/${path}-mobile.mp4`;
  } else {
    video.src = `videos/${path}-desktop.mp4`;
  }
}

// Function to show loading screen
function showLoadingScreen() {
  document.getElementById("defaultBG").style.display = "none";
  document.getElementById("searchForm").style.display = "none";
  document.getElementById("loadingScreen").style.display = "block";
  updateVideoSource("result");
}

// Function to hide loading screen
function hideLoadingScreen() {
  document.getElementById("defaultBG").style.display = "block";
  document.getElementById("searchForm").style.display = "block";
  document.getElementById("loadingScreen").style.display = "none";
  updateVideoSource("bg");
}

// Function to handle form submission
async function submitForm(event) {
  event.preventDefault();
  showLoadingScreen();

  let form = document.getElementById("searchForm");
  let inputValue = document.querySelector(".search-input").value;
  let trimmedValue = inputValue.replace(/\s/g, "");
  const response = await fetch("/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-api-key":
        "f2d7243120d3e9124b480be9e8a9e8d9309e2444632dfafd79bd159c8fe8bdec77e04a79c25642268abbdb31d7bc00fe01db5d95d9c51ccfd5b6f17c890094ec",
    },
    body: "regn_no=" + encodeURIComponent(trimmedValue),
  })
    .then((response) => response.json())
    .then((response) => {
      window.location.href = `/result?regn_no=${encodeURIComponent(
        response.regn_no
      )}&regn_dt=${encodeURIComponent(
        response.regn_dt
      )}&owner_name=${encodeURIComponent(
        response.owner_name
      )}&f_name=${encodeURIComponent(
        response.f_name
      )}&chasi_no=${encodeURIComponent(
        response.chasi_no
      )}&mobile_no=${encodeURIComponent(response.mobile_no)}`;

      form.reset();
      hideLoadingScreen();
    })
    .catch((error) => {
      hideLoadingScreen();
      window.location.href = "/error";
    });

  // Prevent the default form submission behavior
  return false;
}
