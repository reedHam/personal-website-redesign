window.onload = function () {
  bindInputs();
  window.onscroll = function () { sticky() };
  new Cocoen(document.querySelector('.cocoen'));
  const nav = document.getElementsByTagName("nav")[0];
  let serviceModalTitle = document.getElementsByClassName('modal-title');
  let serviceModalBody = document.getElementsByClassName('modal-body');
  const cardTitles = document.getElementsByClassName('card-title');
  serviceModalTitle = serviceModalTitle[0];
  serviceModalBody = serviceModalBody[0];
  const modelBodyContent = [
    // Lawn Maintenance
    ['content-needed',
    'content-needed',
    'content-needed',
    'content-needed',
    'content-needed'],
    // Garden Maintenance
    ['content-needed',
    'content-needed',
    'content-needed',
    'content-needed',
    'content-needed',
    'content-needed'],
    // Spring Clean Up
    ['content-needed',
    'content-needed',
    'content-needed',
    'content-needed',
    'content-needed',
    'content-needed',
    'content-needed'],
    // Fall Clean Up
    ['content-needed',
    'content-needed',
    'content-needed',
    'content-needed'],
    // Delivering & Hauling
    ['We deliver aggregates, mulch, and all types of soils as well as haul away any yard waste'],
    // Mulching
    ['content-needed']
  ]
  let isSticky = false;
  let navOffset = 0;

  function sticky() {
    if (!isSticky) {
      navOffset = nav.offsetTop;
    }
    if (window.pageYOffset >= navOffset - 5) {
      isSticky = true;
      nav.classList.add('sticky');
    } else {
      isSticky = false;
      nav.classList.remove('sticky');
    }
  }

  function bindInputs() {
    let listGroups = document.getElementsByClassName('list-group-item');
    listGroups = [...listGroups];
    listGroups.forEach(listGroup => {
      listGroup.addEventListener('click', openModal);
    });
  }

  function openModal(modal) {
    const targetId = modal.target.id;
    findService(targetId);
    $('#serviceModal').modal('show');
  }

  function findService(id) {
    const serviceGroupItem = document.getElementById(parseInt(id, 10));
    const serviceTitle = id.substring(0, 1);
    const serviceBody = id.substring(1, 2);
    let serviceTitleKey = parseInt(serviceTitle, 10);
    let serviceBodyKey = parseInt(serviceBody, 10);
    serviceTitleKey--;
    serviceBodyKey--;
    if (cardTitles[serviceTitleKey].innerText === serviceGroupItem.innerText) {
      serviceModalTitle.innerText = cardTitles[serviceTitleKey].innerText;
    } else {
      serviceModalTitle.innerText = cardTitles[serviceTitleKey].innerText + ' > ' + serviceGroupItem.innerText;
    }
    serviceModalBody.innerText = modelBodyContent[serviceTitleKey][serviceBodyKey];
  }

};

function toggleContactForm() {
  let contactPopup = document.getElementsByClassName("form-container")[0];
  let togglebtn = document.getElementById("toggle-contact-btn");
  if (contactPopup.style.display === "none") {
    contactPopup.style.display = "block";
    togglebtn.innerHTML = "Close";
    togglebtn.classList.replace("open-form-btn-hvr", "close-form-btn-hvr");
    
  } else {
    contactPopup.style.display = "none";
    togglebtn.innerHTML = "Contact Us";
    togglebtn.classList.replace("close-form-btn-hvr", "open-form-btn-hvr", );
  }
}