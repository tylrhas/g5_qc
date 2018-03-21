var jobid
$('#crawl').click(function () {
  $(this).html('Crawling')
  var url = $('#website').val()
  socket.emit('crawl', { url: url })
})

socket.on('enqueued', function (data) {
  jobid = data.id
  console.log(jobid)
})
socket.on('qcDone', function (data) {
  // check if completed job is the correct job
  if (jobid === data.jobID) {
    console.log(data)
    renderResults(data)
  }
})

function renderResults(data) {
  // enable the results tab
  $('#results-tab').removeClass('disabled')
  renderSpelling(data)
  renderLazyLoad(data)
  $('#crawl').html('Done')
}

function renderLazyLoad(data) {
  for (let i = 0; i < Object.keys(data.crawled).length; i++) {
    let webPage = Object.keys(data.crawled)[i]
    let lazyLoad = data.crawled[webPage].lazyLoad
    let target = '#lazy-' + i
    if (lazyLoad.length === 0) {
      $(target).addClass('btn-success')
    } else {
      // create the Images table
      $(target).addClass('btn-danger')
      for (let i2 = 0; i2 < lazyLoad.length; i2++) {
        if (i2 === 0) {
          // it is the first image load in the table HTML
          $('#webpage' + i).append('<div class="row collapse" id="lazy-load-' + i + '"><table class="table table-bordered table-striped"><tbody id="lazy-table-' + i + '"></tbody></table></div>')
        }
        let imgUrl = lazyLoad[i2]
        let htmlLazy = '<tr><td>' + imgUrl + '</td></tr>'
        document.getElementById('lazy-table-' + i).insertAdjacentHTML('beforeend', htmlLazy)
      }
    }
  }
}

function renderSpelling(data) {
  for (let i = 0; i < Object.keys(data.crawled).length; i++) {
    var webPage = Object.keys(data.crawled)[i]
    var mispelledWords = data.crawled[webPage].copy
    createWebButton(i, webPage)
    let target = '#spelling-' + i
    // create class of passed or failed for the
    if (mispelledWords.length === 0) {
      $(target).addClass('btn-success')
    } else {
      // create the words table
      $(target).addClass('btn-danger')
      for (let i2 = 0; i2 < mispelledWords.length; i2++) {
        createWord(i, i2, mispelledWords[i2])
      }
    }
  }
  $('.add-word').click(function () {
    let target = this
    var word = {}
    word.add = $(this).attr('word')
    $(this).html('Adding')
    $.ajax({
      type: 'POST',
      url: '/dictionary/add',
      data: word,
      success: function (data) {
        $(target).addClass('disabled')
        $(target).html('Added')
      },
      dataType: 'JSON'
    })
  })
}

function createWebButton(i, webPage) {
  var anchor = '<div class="container result-webpage"><a class="btn btn-primary collapsed g5-button-small" data-toggle="collapse" href="#webpage' + i + '" role="button" aria-expanded="false" aria-controls="collapseExample"><div class="row"><div class="container">' + webPage + '</div></div></a></div>'
  $('#results').append(anchor)
  createQC(i)
}
function createQC(i) {
  var qcCheck = '<div class="qc-checks container collapse" id="webpage' + i + '"><div class="row"><a class="col-4 center qc-check btn" id="spelling-' + i + '" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="collapseExample" href="#spelling-words-' + i + '">Spelling</a><a class="col-4 center qc-check btn" id="grammar-' + i + '">Grammar</a><a class="col-4 center qc-check btn" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="lazy-load-' + i + '" id="lazy-' + i + '" href="#lazy-load-' + i + '">Lazy Load</a></div></div>'
  $('#results').append(qcCheck)
}
function createWord(i, i2, word) {
  if (i2 === 0) {
    $('#webpage' + i).append('<div class="row collapse" id="spelling-words-' + i + '"><table class="table table-bordered table-striped"><tbody id="spelling-table-' + i + '"></tbody></table></div>')
  }
  var htmlWord = '<tr><td><h4>' + word + '</h4><button word="' + word + '" class="add-word btn btn-success">Add Word</button></td></tr>'
  $('#spelling-table-' + i).append(htmlWord)
}
