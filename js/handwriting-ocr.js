// EduVerse - Handwriting OCR & Word Export Module
// Converts handwritten/drawn images to digital text using Tesseract.js
// Exports transcribed text as Microsoft Word-compatible documents

var _ocrLastImageData = '';
var _ocrLastResult = '';

(function() {
  if (document.getElementById('ocr-styles')) return;
  var s = document.createElement('style');
  s.id = 'ocr-styles';
  s.textContent = '.ocr-upload-area{border:2px dashed #e2e8f0;border-radius:12px;padding:40px 20px;text-align:center;cursor:pointer;transition:border-color .3s,background .3s;background:var(--bg-subtle,#f7fafc)}.ocr-upload-area:hover{border-color:var(--primary);background:#ebf8ff}.ocr-upload-area.dragover{border-color:var(--primary);background:#ebf8ff}.ocr-progress{width:100%;height:6px;background:#e2e8f0;border-radius:3px;margin:8px 0;overflow:hidden}.ocr-progress-fill{width:0%;height:100%;background:var(--primary);border-radius:3px;transition:width .3s}.ocr-image-preview{max-width:100%;max-height:400px;overflow:auto;border-radius:8px;border:1px solid #e2e8f0;text-align:center;padding:8px}.ocr-image-preview img{max-width:100%;max-height:380px;border-radius:4px}';
  document.head.appendChild(s);
})();

function renderHandwritingOCR(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML =
    '<div class="ocr-container">' +
      '<div class="card" style="margin-bottom:16px">' +
        '<h3><i class="fas fa-pen"></i> Handwriting to Text</h3>' +
        '<p class="subtitle">Upload a photo of handwritten notes, exam questions, or lesson plans. The system transcribes them into digital text using OCR technology.</p>' +
        '<div class="ocr-upload-area" id="ocrUploadArea" ondragover="event.preventDefault();this.classList.add(\'dragover\')" ondrop="event.preventDefault();this.classList.remove(\'dragover\');handleOCRFile(event.dataTransfer.files[0])">' +
          '<i class="fas fa-cloud-upload-alt" style="font-size:48px;color:var(--text-light)"></i>' +
          '<p style="font-weight:600;margin:8px 0">Drag & drop an image here, or click to browse</p>' +
          '<p style="font-size:13px;color:var(--text-light)">Supports JPG, PNG, WEBP (max 10MB)</p>' +
          '<input type="file" id="ocrFileInput" accept="image/*" style="display:none" onchange="handleOCRFile(this.files[0])">' +
          '<button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="document.getElementById(\'ocrFileInput\').click()"><i class="fas fa-upload"></i> Choose Image</button>' +
        '</div>' +
      '</div>' +
      '<div id="ocrPreviewArea" style="display:none">' +
        '<div class="card" style="margin-bottom:16px">' +
          '<h3><i class="fas fa-image"></i> Image Preview</h3>' +
          '<div class="ocr-image-preview" id="ocrImagePreview"></div>' +
        '</div>' +
        '<div class="card" style="margin-bottom:16px">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px">' +
            '<h3 style="margin:0"><i class="fas fa-file-alt"></i> Transcribed Text</h3>' +
            '<button class="btn btn-primary btn-sm" onclick="runOCR()"><i class="fas fa-magic"></i> Transcribe</button>' +
          '</div>' +
          '<p class="subtitle" id="ocrStatus">Click "Transcribe" to process the image. You can also edit the text manually.</p>' +
          '<div class="ocr-progress" id="ocrProgressBar" style="display:none"><div class="ocr-progress-fill" id="ocrProgressFill"></div></div>' +
          '<textarea id="ocrTranscribedText" class="ocr-result-text" rows="10" style="width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:14px;line-height:1.6;resize:vertical;box-sizing:border-box;margin-top:8px" placeholder="Transcribed text will appear here after processing..."></textarea>' +
        '</div>' +
        '<div class="card">' +
          '<h3><i class="fas fa-download"></i> Export & Save</h3>' +
          '<p class="subtitle">Export as a Word document, or save directly to Lesson Notes / Exam Questions.</p>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' +
            '<button class="btn btn-primary" onclick="exportOCRToWord()"><i class="fas fa-file-word"></i> Export to Word</button>' +
            '<button class="btn btn-success" onclick="saveOCRAsLessonNote()"><i class="fas fa-save"></i> Save as Lesson Note</button>' +
            '<button class="btn btn-accent" onclick="saveOCRAsExamQuestion()"><i class="fas fa-question-circle"></i> Save as Exam Question</button>' +
            '<button class="btn btn-outline" onclick="clearOCR()" style="color:var(--text);border-color:#e2e8f0"><i class="fas fa-trash"></i> Clear</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function handleOCRFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('Please select an image file (JPG, PNG, WEBP)', 'error'); return; }
  if (file.size > 10 * 1024 * 1024) { toast('Image exceeds the 10MB size limit', 'error'); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    _ocrLastImageData = e.target.result;
    var preview = document.getElementById('ocrImagePreview');
    if (preview) preview.innerHTML = '<img src="' + htmlEscape(_ocrLastImageData) + '" alt="Uploaded image">';
    document.getElementById('ocrPreviewArea').style.display = 'block';
    var status = document.getElementById('ocrStatus');
    if (status) status.textContent = 'Image loaded. Click "Transcribe" to process it.';
    var ta = document.getElementById('ocrTranscribedText');
    if (ta) ta.value = '';
    _ocrLastResult = '';
    var uploadArea = document.getElementById('ocrUploadArea');
    if (uploadArea) uploadArea.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function runOCR() {
  if (typeof Tesseract === 'undefined') { toast('OCR engine is not loaded. Please refresh the page.', 'error'); return; }
  if (!_ocrLastImageData) { toast('No image loaded. Upload an image first.', 'error'); return; }
  var status = document.getElementById('ocrStatus');
  var progressBar = document.getElementById('ocrProgressBar');
  var progressFill = document.getElementById('ocrProgressFill');
  var textarea = document.getElementById('ocrTranscribedText');
  if (progressBar) progressBar.style.display = 'block';
  if (status) status.textContent = 'Starting OCR engine...';
  try {
    var result = await Tesseract.recognize(_ocrLastImageData, 'eng', {
      logger: function(m) {
        if (m.status === 'recognizing text') {
          if (progressFill) progressFill.style.width = Math.round(m.progress * 100) + '%';
          if (status) status.textContent = 'Recognizing text... ' + Math.round(m.progress * 100) + '%';
        }
      }
    });
    _ocrLastResult = (result && result.data && result.data.text) ? result.data.text : '';
    if (textarea) textarea.value = _ocrLastResult;
    if (progressBar) progressBar.style.display = 'none';
    if (status) {
      if (_ocrLastResult.trim()) {
        status.textContent = 'Transcription complete! Review and edit the text below.';
        toast('Transcription complete!');
      } else {
        status.textContent = 'No text was detected. Try a clearer image or adjust handwriting.';
        toast('No text detected', 'error');
      }
    }
  } catch(err) {
    if (progressBar) progressBar.style.display = 'none';
    if (status) status.textContent = 'Error: ' + (err.message || 'Unknown error');
    toast('OCR failed: ' + (err.message || 'Unknown error'), 'error');
  }
}

function exportOCRToWord() {
  var textarea = document.getElementById('ocrTranscribedText');
  if (!textarea) return;
  var text = textarea.value.trim();
  if (!text) { toast('No text to export', 'error'); return; }
  var schoolName = (typeof data !== 'undefined' && data && data.schoolName) ? data.schoolName : 'EduVerse';
  var teacherName = (typeof currentTeacher !== 'undefined' && currentTeacher) ? currentTeacher.name : 'Teacher';
  var classInfo = (typeof currentTeacher !== 'undefined' && currentTeacher && currentTeacher.assignedClass) ? currentTeacher.assignedClass : '';
  var date = new Date().toLocaleDateString();
  var escapedText = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  var html = '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Transcribed Content</title><style>body{font-family:Calibri,Arial,sans-serif;font-size:12pt;line-height:1.6;margin:72pt;}h1{font-size:18pt;color:#1a3a5c;text-align:center;}h2{font-size:14pt;color:#1a3a5c;border-bottom:1px solid #1a3a5c;padding-bottom:4pt;}.header{text-align:center;margin-bottom:24pt;font-size:10pt;color:#666;}.footer{text-align:center;margin-top:24pt;font-size:9pt;color:#999;}</style></head><body><h1>' + htmlEscape(schoolName) + '</h1><div class="header">Teacher: ' + htmlEscape(teacherName) + ' | Class: ' + htmlEscape(classInfo) + ' | Date: ' + htmlEscape(date) + '</div><h2>Transcribed Content</h2><p>' + escapedText + '</p><div class="footer">Generated by EduVerse Handwriting OCR | ' + date + '</div></body></html>';
  var blob = new Blob([html], { type: 'application/msword' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Transcribed_Content_' + new Date().toISOString().split('T')[0] + '.doc';
  a.click();
  setTimeout(function() { URL.revokeObjectURL(a.href); }, 1000);
  toast('Word document downloaded!');
}

function saveOCRAsLessonNote() {
  var ta = document.getElementById('ocrTranscribedText');
  if (!ta) return;
  var text = ta.value.trim();
  if (!text) { toast('No text to save', 'error'); return; }
  if (typeof currentTeacher === 'undefined' || !currentTeacher) { toast('Please log in as a teacher', 'error'); return; }
  if (!data.lessonNotes) data.lessonNotes = [];
  data.lessonNotes.push({
    id: genId('LN'),
    teacherId: currentTeacher.id,
    class: currentTeacher.assignedClass || '',
    subject: '',
    title: 'Handwritten Notes - ' + new Date().toLocaleDateString(),
    content: text,
    week: '',
    term: data.currentTerm || 'Term 2 2026',
    date: new Date().toISOString().split('T')[0]
  });
  saveData();
  toast('Saved as Lesson Note!');
  if (typeof renderLessonNotes === 'function') renderLessonNotes('tchLessonNotes', currentTeacher.id);
}

function saveOCRAsExamQuestion() {
  var ta = document.getElementById('ocrTranscribedText');
  if (!ta) return;
  var text = ta.value.trim();
  if (!text) { toast('No text to save', 'error'); return; }
  if (typeof currentTeacher === 'undefined' || !currentTeacher) { toast('Please log in as a teacher', 'error'); return; }
  if (!data.examQuestions) data.examQuestions = [];
  data.examQuestions.push({
    id: genId('EQ'),
    teacherId: currentTeacher.id,
    class: currentTeacher.assignedClass || '',
    subject: '',
    question: text,
    options: ['','','',''],
    answer: '',
    type: 'theory',
    term: data.currentTerm || 'Term 2 2026',
    date: new Date().toISOString().split('T')[0]
  });
  saveData();
  toast('Saved as Exam Question!');
}

function clearOCR() {
  _ocrLastResult = '';
  _ocrLastImageData = '';
  var previewArea = document.getElementById('ocrPreviewArea');
  if (previewArea) previewArea.style.display = 'none';
  var ta = document.getElementById('ocrTranscribedText');
  if (ta) ta.value = '';
  var uploadArea = document.getElementById('ocrUploadArea');
  if (uploadArea) uploadArea.style.display = 'block';
}
