// Convert file sizes to nice formats (actually kibibytes not kilobytes...)
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Byte';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Display error msg in rightmost box
function errorMsg(msg) {
  _('bigPrew').innerHTML += `
    <p class="gotham font16 errorMessage" style="color: #ff4a4a;">${msg}</p>
  `;
}

_('fdzB').addEventListener('click', function(e) {
  _('fileInput').click(); 
});

// Given n, create a new FileList with the first n Files
function subFirstN(n, files) {
  let list = new DataTransfer();
  for (let i = 0; i < n; i++) {
    list.items.add(files[i]);
  }
  return list.files;
}

// Reset ids of files when removing & adding
function resetIds() {
  let ddFiles = document.getElementsByClassName('ddFile');
  let inds = document.getElementsByClassName('delFile');
  let cms = document.getElementsByClassName('cms');
  for (let j = 0; j < ddFiles.length; j++) {
    ddFiles[j].setAttribute('id', 'fh_' + j);
    inds[j].setAttribute('onclick', `removeFile(${j}, _('fileInput').files)`);
    cms[j].setAttribute('id', 'cm_' + j);
  }
}

// Given n, remove the nth element from FileList
function removeFile(n, files) {
  let list = new DataTransfer();
  for (let i = 0; i < files.length; i++) {
    if (i != n) list.items.add(files[i]);
  }
  _('fileInput').files = list.files;
  _('fh_' + n).remove();
  if (!list.files.length) {
    _('bigPrew').innerHTML = DEFAULT_CONTENT;
    sBtnAdded = false;
  }
  resetIds();
}

let isSubmitted = false;
const DEFAULT_CONTENT  = _('bigPrew').innerHTML;

// Display files in the rightmost box
function displayFiles() {
  let fileCount = 0;
  let hasStl = false;
  let hasImg = false;
  let files = _('fileInput').files;
  let prewContent = _('prew').innerHTML;
  _('prew').innerHTML = '';

  // Remove previous error messages
  let errors = document.getElementsByClassName('errorMessage');
  for (let el of Array.from(errors)) {
    el.remove();
  }

  // Handle selected files & display them in the right div
  // Make sure the maximum number of files to be uploaded is 5
  if (fileCount >= 5 || files.length > 5) {
    _('fileInput').files = subFirstN(5, _('fileInput').files);
    _('prew').innerHTML = prewContent;
    errorMsg('Egyszerre maximum 5db fájl tölthető fel');
    return;
  }

  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let size = formatBytes(file.size);
    if (file.size > 100 * 1048576) {
      // Make sure none of the files are above 100MB
      errorMsg('A maximum fájlméret 100MB');
      return;
    }

    // Get file extension and display the proper icon for file
    let parts = file.name.split('.');
    let imgPrew;
    let wrongFileType = false;
    if (parts[parts.length - 1].toLowerCase() === 'stl') {
      imgPrew = '<img src="/images/icons/icostl.png" width="50">'; 
      hasStl = true;
    } else if (parts[parts.length - 1].toLowerCase() === 'png') {
      imgPrew = '<img src="/images/icons/icopng.png" width="50">'; 
      hasImg = true;
    } else if (parts[parts.length - 1].toLowerCase() === 'jpg' ||
      parts[parts.length - 1].toLowerCase() === 'jpeg') {
      imgPrew = '<img src="/images/icons/icojpg.png" width="50">'; 
      hasImg = true;
    } else {
      imgPrew = '<img src="/images/icons/icoother.png" width="50">'; 
      wrongFileType = true;
    }

    // Make sure images for lithophane and STLs for custom print are not mixed
    if (hasStl && hasImg) {
      errorMsg('Egyszerre vagy csak képeket vagy csak STL fájlokat tölthtesz fel');
      return;
    // Make sure only STls and images (PNG, JPG/JPEG) are uploaded
    } else if (wrongFileType) {
      errorMsg('Csak STL fájlok és képek (PNG, JPG, JPEG) tölthetők fel');
      return;
    }

    // Do not allow the user to upload more than 1 img, only STLs
    if (hasImg && files.length > 1) {
      _('fileInput').files = subFirstN(1, _('fileInput').files);
      _('prew').innerHTML = prewContent;
      errorMsg('Egyszerre csak 1 képet tölthetsz fel');
      return;
    }

    let indicator = `
      <img src="/images/icons/moreClose.svg" width="16" height="16" class="trans delFile"
        onclick="removeFile(${i}, _('fileInput').files)">
    `;

    // Build output
    _('prew').innerHTML += `
      <div class="flexDiv ddFile animate__animated animate__fadeIn"
        style="align-items: center; justify-content: space-evenly;" id="fh_${i}">
        <div class="flexDiv" style="align-items: center;">
          <div>${imgPrew}</div>
          <div class="oflow">
            ${file.name}<br>
            <span class="dgray gothamNormal font14">${size}</span>
          </div>
          <div id="cm_${i}" class="cms">
            ${indicator}
          </div>
        </div>
      </div>
    `;

    resetIds();

    // Add submit button if not yet added
    if (!sBtnAdded) {
      _('bigPrew').innerHTML += `
        <label for="submitForm" tabindex="0"
          class="btnCommon fillBtn animate__animated animate__fadeIn"
          style="margin: 20px auto; width: 60%; max-width: 320px;" id="continue">
          Tovább
        </label> 
      `; 

      sBtnAdded = true;

      _('continue').addEventListener('click', function showSpinner(e) {
        if (!isSubmitted) {
          // Display loader and "disable" submit btn
          _('bigPrew').innerHTML += `
            <img src="/images/icons/loader.gif" width="24" style="margin: 0 auto"
              class="animate__animated animate__fadeIn">
            <p class="blue">Ez akár pár percig is eltarthat...</p>
          `;
          _('continue').style.cursor = "not-allowed";
          _('continue').style.opacity = "0.8";

          // Make checkmarks green
          let cnt = 0;
          while (_('cm_' + cnt)) {
            _('cm_' + cnt).innerHTML = `
              <img src="/images/icons/cmgreen.png" width="24"
              class="animate__animated animate__fadeIn">
            `;
            cnt++;
          }

          // Submit form & do not allow further submissions
          _('fdz').submit();
          isSubmitted = true;
        }
      });
    }
    fileCount++;
  }
}

let sBtnAdded = false;
_('fileInput').addEventListener('change', displayFiles);

// Implement drag & drop feature
let drags = 0;
_('dropDiv').addEventListener('dragenter', function(e) {
  e.preventDefault();
  drags++;
  _('dropDiv').style.border = '2px solid #4285f4';
});

_('dropDiv').addEventListener('dragover', function(e) {
  e.preventDefault();
});

_('dropDiv').addEventListener('dragleave', function(e) {
  drags--;
  if (drags == 0) {
    _('dropDiv').style.border = '2px solid #f4f4f4';
  }
});

function dropFile(e) {
  e.preventDefault();
  let savedContent = new DataTransfer();
  for (let i = 0; i < _('fileInput').files.length; i++) {
    savedContent.items.add(_('fileInput').files[i]);
  }

  for (let i = 0; i < e.dataTransfer.files.length; i++) {
    savedContent.items.add(e.dataTransfer.files[i]);
  }

  // Make sure no more than 15 items are in the cart
  let numOfItemsSoFar = Object.keys(JSON.parse(getCookie('cartItems'))).length;
  let uploadedFiles = savedContent.files.length;
  if (getCookie('cartItems') && (numOfItemsSoFar + uploadedFiles) > 15) {
    _('bigPrew').innerHTML = '';     
    errorMsg('A fájlok feltöltésével több mint 15 termék lenne a kosaradban')
    return;
  }

  _('fileInput').files = savedContent.files;
  
  displayFiles();
  
  _('dropDiv').style.border = '2px solid #f4f4f4';
}

// Set cookie to a false state when uploading, allow exactly 1 time to add the item to cookies
setCookie('isVisited', 'no', 365);
localStorage.setItem('refresh', '');
