function getCurrentPage() {
  // Get the pathname
  var pathname = window.location.pathname;

  // Split the pathname by '/' and get the last part
  var pageName = pathname.split('/').pop();

  return pageName;
}

let currentPage = getCurrentPage();
let storedWindows = JSON.parse(sessionStorage.getItem('openWindows')) || {};
let openWindows = { ...storedWindows, [currentPage]: true };

// Update sessionStorage immediately after merging
sessionStorage.setItem('openWindows', JSON.stringify(openWindows));


// let flag = false;
// if (!flag) {
//   sessionStorage.setItem('openWindows', JSON.stringify(openWindows));
//   openWindows[currentPage] = true;
//   flag = true;
// }

let activeWindow = sessionStorage.getItem('activeWindow') || currentPage;


document.addEventListener('DOMContentLoaded', () => {
  console.log('Document loaded. Updating taskbar.');

  // Initialize openOrder if it's the first load
  if (!sessionStorage.getItem('openOrder')) {
    for (const page in openWindows) {
      if (openWindows[page]) {
        openOrder.push(page);
      }
    }
    console.log(`AAAAAAAA ${openOrder}`)
    sessionStorage.setItem('openOrder', JSON.stringify(openOrder));
  }

  updateTaskbar();
  startClock();
});


let openOrder = JSON.parse(sessionStorage.getItem('openOrder')) || [];

const debug = () => {
  console.log(`Open Order: ${JSON.stringify(openOrder)}`); // Shows the order in which windows were opened
  console.log(`Open Windows: ${JSON.stringify(openWindows)}`); // Displays which windows are open
  console.log(`Active Window: ${activeWindow}`); // Shows which window is currently active
};

debug();


const pageInfo = {
  'index.html': { icon: './assets/xfce4-notes-plugin.svg', label: 'Welcome', url: 'index.html' },
  'aboutme.html': { icon: './assets/users.svg', label: 'About Me', url: 'aboutme.html' },
  'contactme.html': { icon: './assets/phone.svg', label: 'Contact Me', url: 'contactme.html' },
  'writing.html': { icon: './assets/wordprocessing.svg', label: 'Writing', url: 'writing.html' },
  'technology.html': { icon: './assets/computer.svg', label: 'Technology', url: 'technology.html' },
  'videography.html': { icon: './assets/camera-video.svg', label: 'Videography', url: 'videography.html' },
  'photography.html': { icon: './assets/camera.svg', label: 'Photography', url: 'photography.html' },
  'sitemap.html': { icon: './assets/gnome-globe.svg', label: 'Site Map', url: 'sitemap.html' }
};

function subWindow(baseWindow, subWindow) {
  if (!openOrder.includes(baseWindow)) {
    console.log("Balls");
  }
  console.log(openOrder);
  navigateTo(subWindow);
  activeWindow = baseWindow;
}

function toggleWindow(pageName, isOpen) {
  console.log(`Toggling window: ${pageName}, isOpen: ${isOpen}`);
  if (!openOrder.includes(pageName)) {
    openOrder.push(pageName);
  }
  console.log(`AAAAAAAA ${openOrder}`);
  if (isOpen) {
    console.log((openWindows[pageName]))
    if (!openWindows[pageName]) {  // If the window is truly not open
      console.log(`Opening new window: ${pageName}`);
      openWindows[pageName] = true;
      // Only add to the end if it's being opened for the first time or after being closed

    } else {
      console.log(`Window ${pageName} is already open.`);
      // Do not move to end if it's just becoming active again, it stays in its original place
    }
    sessionStorage.setItem('openWindows', JSON.stringify(openWindows));
    sessionStorage.setItem('openOrder', JSON.stringify(openOrder));
    updateTaskbar();
    if (activeWindow !== pageName) {
      console.log(`Switching active window from ${activeWindow} to ${pageName}`);
      activeWindow = pageName;
      sessionStorage.setItem('activeWindow', activeWindow);
      updateTaskbar();
      navigateTo(pageName);
    }
  } else {
    if (openWindows[pageName]) {
      console.log(`Closing window: ${pageName}`);
      openWindows[pageName] = false;
      // Remove from openOrder when closed

      sessionStorage.setItem('openWindows', JSON.stringify(openWindows));
      sessionStorage.setItem('openOrder', JSON.stringify(openOrder));
      updateTaskbar();
    }
  }
  debug();
}


function createTaskbarButton(page) {
  const button = document.createElement('button');
  button.className = 'app-icon';
  button.dataset.page = page;
  button.onclick = function() {
    console.log(`Button for ${page} clicked`);
    toggleWindow(page, true);
  };
  button.title = pageInfo[page].label;

  const img = document.createElement('img');
  img.src = pageInfo[page].icon;
  img.alt = pageInfo[page].label;
  img.style = "vertical-align: middle;";

  const textNode = document.createTextNode(' ' + pageInfo[page].label);
  button.appendChild(img);
  button.appendChild(textNode);

  return button;
}

function navigateTo(pageName) {
  console.log(`Navigating to: ${pageName}`);
  window.location.href = pageInfo[pageName].url;
}

function updateTaskbar() {
  const dynamicWindows = document.getElementById('dynamic-windows');
  dynamicWindows.innerHTML = '';  // Clear all existing entries first

  openOrder.forEach(page => {
    if (openWindows[page]) {  // Only display windows that are open
      const button = createTaskbarButton(page);
      dynamicWindows.appendChild(button);
      button.classList.toggle('active', page === activeWindow);
    }
  });
}


function navigateTo(pageName) {
  console.log(`Navigating to: ${pageName}`);
  if (pageName) {
    window.location.href = pageInfo[pageName] ? pageInfo[pageName].url : pageName;
  }
}

function closeWindow(pageName) {
  console.log(`Attempting to close window: ${pageName}`);
  if (openWindows[pageName]) {
    // sessionStorage.setItem('openWindows', JSON.stringify(openWindows));
    console.log(`Window ${pageName} closed. Active window was: ${activeWindow}`);

    activeWindow = null;  // Set no active window
    sessionStorage.setItem('activeWindow', activeWindow);
    console.log(`No active windows. Navigating to blank page.`);
    const index = openOrder.indexOf(pageName);
    openOrder.splice(index, 1);

    openWindows[pageName] = false;

    sessionStorage.setItem('openWindows', JSON.stringify(openWindows));
    sessionStorage.setItem('openOrder', JSON.stringify(openOrder));
    navigateTo('blank.html'); // Always navigate to blank.html

    debug();

    updateTaskbar();
  } else {
    console.error(`Attempted to close a window that was not open: ${pageName}`);
  }
}

function minimizeWindow(pageName) {
  console.log(`Attempting to minimize window: ${pageName}`);
  if (openWindows[pageName]) {
    console.log(`Window ${pageName} minimized. Current active window was: ${activeWindow}`);

    // Set no active window since we're navigating to blank.html
    activeWindow = null;
    sessionStorage.setItem('activeWindow', activeWindow);
    console.log(`No active windows. Navigating to blank page.`);
    navigateTo('blank.html'); // Always navigate to blank.html

    updateTaskbar();
  } else {
    console.error(`Attempted to minimize a window that was not open: ${pageName}`);
  }
}

function maximizeWindow(windowId) {
  var windowElement = document.getElementById(windowId);
  if (!windowElement) return;

  var isMaximized = windowElement.classList.contains('maximized');
  if (isMaximized) {
    windowElement.style.removeProperty('width');
    windowElement.style.removeProperty('height');
    windowElement.style.removeProperty('top');
    windowElement.style.removeProperty('left');
    windowElement.style.removeProperty('right');
    windowElement.style.removeProperty('margin');
    windowElement.classList.remove('maximized');
    windowElement.classList.remove('crt');
  } else {
    windowElement.style.width = '100vw';
    windowElement.style.height = '100vh';
    windowElement.style.top = '0';
    windowElement.style.left = '0';
    windowElement.style.right = '0';
    windowElement.style.margin = '0';
    windowElement.classList.add('maximized');
    windowElement.classList.add('crt');
  }
}

function startClock() {
  updateClock();
  setInterval(updateClock, 1000);  // Update the clock every 1000 milliseconds
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = hours + ':' + minutes;
}

function toggleMenu() {
  var menu = document.getElementById('vertical-menu');
  var hamburger = document.querySelector('.hamburger-menu');
  var icons = document.querySelectorAll('.app-icon-vertical');
  var isVisible = menu.style.display === 'block';

  menu.style.display = isVisible ? 'none' : 'block';

  icons.forEach(function(icon) {
    icon.style.display = isVisible ? 'none' : 'block';
  });
  if (isVisible) {
    hamburger.style.right = '0';
  } else {
    hamburger.style.right = '30%';
  }
}
