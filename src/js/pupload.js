// Convert file sizes to nice formats (actually kibibytes not kilobytes...)
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Display error msg in rightmost box
function errorMsg(msg) {
  _('bigPrew').innerHTML += `
    <p class="gotham font16" style="color: #ff4a4a;">${msg}</p>
  `;
}

_('fdzB').addEventListener('click', function(e) {
  _('fileInput').click(); 
});

let isSubmitted = false;

// Display files in the rightmost box
function displayFiles() {
  let fileCount = 0;
  let hasStl = false;
  let hasImg = false;
  let files = _('fileInput').files;
  _('prew').innerHTML = '';

  // Handle selected files & display them in the right div
  // Make sure the maximum number of files to be uploaded is 5
  if (fileCount >= 5 || files.length > 5) {
    errorMsg('Egyszerre maximum 5db fájl tölthető fel');
    return;
  }

  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let size = formatBytes(file.size);
    if (file.size > 10 * 1048576) {
      // Make sure none of the files are above 10MB
      errorMsg('A maximum fájlméret 10MB');
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

    // Do not allow the user to upload more than 1 img, only STLs
    if (hasImg && files.length > 1) {
      errorMsg('Egyszerre csak 1 képet tölthetsz fel');
      return;
    }

    // Make sure images for lithophane and STLs for custom print are not mixed
    if (hasStl && hasImg) {
      errorMsg('Egyszerre csak képeket vagy csak STL fájlokat tölthtesz fel');
      return;
    // Make sure only STls and images (PNG, JPG/JPEG) are uploaded
    } else if (wrongFileType) {
      errorMsg('Csak STL fájlok és képek (PNG, JPG, JPEG) tölthetők fel');
      return;
    }

    let indicator = '<img src="/images/icons/checkmark.png" width="24">';

    // Build output
    _('prew').innerHTML += `
      <div class="flexDiv ddFile animate__animated animate__fadeIn"
        style="align-items: center; justify-content: space-evenly;">
        <div class="flexDiv" style="align-items: center;">
          <div>${imgPrew}</div>
          <div class="oflow">
            ${file.name}<br>
            <span class="dgray gothamNormal font14">${size}</span>
          </div>
          <div id="cm_${i}">
            ${indicator}
          </div>
        </div>
      </div>
    `;

    // Add submit button if not yet added
    if (!sBtnAdded) {
      _('bigPrew').innerHTML += `
        <label for="submitForm" tabindex="0"
          class="btnCommon fillBtn animate__animated animate__fadeIn"
          style="margin: 20px auto; width: 60%;" id="continue">
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
  _('fileInput').files = e.dataTransfer.files;

  displayFiles();
  
  _('dropDiv').style.border = '2px solid #f4f4f4';
}