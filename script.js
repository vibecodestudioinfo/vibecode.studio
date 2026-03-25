
// ── Custom Cursor ──
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function animateCursor() {
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top = ry + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();
document.querySelectorAll('a, button, .service-card, .portfolio-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '14px'; cursor.style.height = '14px';
    cursorRing.style.width = '50px'; cursorRing.style.height = '50px';
    cursorRing.style.opacity = '.8';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '8px'; cursor.style.height = '8px';
    cursorRing.style.width = '32px'; cursorRing.style.height = '32px';
    cursorRing.style.opacity = '.5';
  });
});

// ── Navbar scroll ──
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

// ── Scroll reveal ──
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.12 });
reveals.forEach(r => observer.observe(r));

// ── Mobile nav ──
function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

const track = document.getElementById("marqueeTrack")
track.innerHTML += track.innerHTML

// ── Form submit ──
async function handleSubmit(btn) {
  const orig = btn.innerHTML;

  // 1. Gather form data
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const service = document.getElementById('contactService').value;
  const budget = document.getElementById('contactBudget').value;
  const description = document.getElementById('contactDescription').value.trim();

  // 2. Validate required fields
  if (!name || !email || !service || !description) {
    alert("Please fill in all required fields marked with *");
    return;
  }

  // Prepare payload matching the Google Apps Script Lead data structure expectations
  const payload = {
    Name: name,
    Email: email,
    Phone: phone,
    Company: "Direct Contact Form", // Default since there's no company field in the form
    Service: service,
    Budget: budget,
    Timeline: "Not specified", // Default since there's no timeline field
    ProjectDescription: description,
    Source: "ContactForm",
    Timestamp: new Date().toLocaleString()
  };

  // Replace this with your actual Web App URL from Google Apps Script
  // Ideally this could be shared with robot.js but we define it here again for the contact form
  const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLSKMuZGjI-d_9vl4fPamtiFF3kcVnIAl3j8eNCprDR_O1cGhlQNUIwhmcIPHA_pl2/exec";

  try {
    btn.innerHTML = 'Sending...';
    btn.disabled = true;

    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    // Show success
    btn.innerHTML = '✓ Message Sent!';
    btn.style.background = '#22CC66';
    btn.style.color = '#fff';

    // Reset form fields
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactPhone').value = '';
    document.getElementById('contactService').value = '';
    document.getElementById('contactBudget').value = '';
    document.getElementById('contactDescription').value = '';

  } catch (error) {
    console.error("Form Submit Error:", error);
    btn.innerHTML = 'Error Sending';
    btn.style.background = '#e74c3c';
    btn.style.color = '#fff';
  } finally {
    // Revert button text after 3 seconds
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 3000);
  }
}

// Make handleSubmit globally accessible since it is called via inline onClick in HTML
window.handleSubmit = handleSubmit;
// Loader

const text = "vibecode.studio"
const target = document.getElementById("typingText")
const textWrap = document.querySelector(".loader-text")

let i = 0

function typeWriter() {

  if (i < text.length) {

    const char = text.charAt(i)

    /* color split logic */

    if (i < 8) {
      target.innerHTML += `<span class="white">${char}</span>`
    } else {
      target.innerHTML += `<span class="blue">${char}</span>`
    }

    i++
    setTimeout(typeWriter, 70)

  }

}

/* LOADER EXIT */

if (sessionStorage.getItem("loaderSeen")) {
  document.body.classList.add("hero-start");
}

window.addEventListener("load", () => {

  const loaderEl = document.getElementById("loader");

  /* Check if loader was already seen this session */
  if (sessionStorage.getItem("loaderSeen")) {
    if (loaderEl) loaderEl.style.display = "none";
    startProjectCounter();
    window.dispatchEvent(new Event("robotStart"));
    return;
  }

  /* Mark loader as seen */
  sessionStorage.setItem("loaderSeen", "true");

  /* start typing after logo */
  setTimeout(() => {
    textWrap.classList.add("show")
    typeWriter()
  }, 1700)

  /* premium exit */
  setTimeout(() => {

    /* hide loader */
    if (loaderEl) loaderEl.classList.add("hide")

    /* START HERO ANIMATION */
    document.body.classList.add("hero-start")

    /* start counter animation */
    startProjectCounter()

  }, 4300)

  /* robot start event */
  setTimeout(() => {
    window.dispatchEvent(new Event("robotStart"));
  }, 4400);

})

/* ===== PROJECT COUNTER ===== */

function startProjectCounter() {

  const counter = document.getElementById("projectsCount");
  if (!counter) return;

  const target = +counter.getAttribute("data-target");

  let count = 0;

  const speed = 40; // adjust feel here

  const updateCount = () => {

    if (count < target) {

      count++;
      counter.childNodes[0].nodeValue = count;

      setTimeout(updateCount, speed);

    } else {
      counter.childNodes[0].nodeValue = target;
    }

  };

  updateCount();

}

/* ===== PORTFOLIO IMAGE SLIDER ===== */

document.querySelectorAll(".portfolio-card").forEach(card => {

  const images = card.querySelectorAll(".portfolio-img");
  const nextBtn = card.querySelector(".portfolio-arrow.right");
  const prevBtn = card.querySelector(".portfolio-arrow.left");

  let index = 0;

  function showImage(i) {
    images.forEach(img => img.classList.remove("active"));
    images[i].classList.add("active");
  }

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % images.length;
    showImage(index);
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + images.length) % images.length;
    showImage(index);
  });

});

/* ===== BLOCK COPY SHORTCUT ===== */

document.addEventListener("keydown", function (e) {

  if (
    e.ctrlKey && ["c", "x", "u", "s", "a"].includes(e.key.toLowerCase())
    // e.key === "F12"
  ) {
    e.preventDefault();
  }

});

/* ===== DISABLE RIGHT CLICK ===== */

document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("dragstart", e => e.preventDefault());

/* ================= PORTFOLIO FINAL SLIDER ================= */

document.querySelectorAll(".portfolio-card").forEach(card => {

  const images = card.querySelectorAll(".portfolio-img");
  const nextBtn = card.querySelector(".portfolio-arrow.right");
  const prevBtn = card.querySelector(".portfolio-arrow.left");

  let index = 0;
  let autoplay;

  /* show image */
  function showImage(i) {
    images.forEach(img => img.classList.remove("active"));
    images[i].classList.add("active");
  }

  /* autoplay */
  function startAuto() {
    autoplay = setInterval(() => {
      index = (index + 1) % images.length;
      showImage(index);
    }, 2800);
  }

  /* stop autoplay on hover */
  card.addEventListener("mouseenter", () => clearInterval(autoplay));
  card.addEventListener("mouseleave", startAuto);

  /* buttons */
  nextBtn.addEventListener("click", () => {
    index = (index + 1) % images.length;
    showImage(index);
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + images.length) % images.length;
    showImage(index);
  });

  /* start */
  showImage(index);
  startAuto();

});