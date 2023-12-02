$(document).ready(function () {
  $(".nav-link.dropdown-toggle").on("click", function (e) {
    e.preventDefault(); // Prevent the default behavior (link click)
    var selectedPage = $(this).attr("href");
    console.log("Navigating to: " + selectedPage);
    window.location.href = selectedPage; // Navigate to the selected page
    $(this).dropdown("toggle"); // Open the dropdown menu programmatically
  });
});

// collapse navbar when anchor link is clicked in portfolio submenu
$(".dropdown-item").on("click", function (event) {
  $(".navbar-collapse").collapse("hide");
});

// modal scripts
document.addEventListener("DOMContentLoaded", function () {
  var modal = document.getElementById("editModal");

  function openEditModal() {
    modal.style.display = "block";
    // Add event listener to close modal on click outside
    document.addEventListener("mousedown", outsideClick);
  }

  function outsideClick(event) {
    if (!modal.contains(event.target)) {
      closeEditModal();
    }
  }

  function closeEditModal() {
    modal.style.display = "none";
    // Remove the event listener after closing the modal
    document.removeEventListener("mousedown", outsideClick);
  }
});

// modal for updating painting entries
function openEditModal(
  id,
  name,
  dimensions,
  classification,
  mediaType,
  location,
  availability
) {
  var modal = document.getElementById("editModal");
  var modalContent = modal.querySelector(".modal-content");

  document.getElementById("editName").value = name;
  document.getElementById("editDimensions").value = dimensions;
  document.getElementById("editClassification").value = classification;
  document.getElementById("editMediaType").value = mediaType;
  document.getElementById("editLocation").value = location;

  // Set the painting ID in the form action
  document.getElementById("editForm").action = `/paintings/update/${id}`;

  // Select the correct radio button based on availability
  var availableRadio = document.getElementById("editAvailable");
  var soldRadio = document.getElementById("editSold");

  // Set the value attribute of the radio buttons
  availableRadio.value = 1;
  soldRadio.value = 0;

  // Check the radio button based on availability
  availableRadio.checked = availability == 1;
  soldRadio.checked = availability == 0;

  modal.style.display = "block";

  // Allow the modal to dynamically adjust its size based on content
  modalContent.style.maxWidth = "80vw";
  modalContent.style.width = "auto";
  modalContent.style.maxHeight = "80vh";
  modalContent.style.overflowY = "auto";

  modalContent.style.maxHeight = maxHeight + "px";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

// update order of paintings if logged in
function updateOrder(paintingId, newOrder) {
  fetch(`/updateOrder/${paintingId}/${newOrder}`, {
    method: "POST",
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
      // Optionally, you can reload the page or update the UI after a successful update
    })
    .catch((error) => console.error("Error updating order:", error));
}
