var body_background_color = '#f8f8f8',
  body_text_color = '#000',
  svg_background_color = '#1c2733',
  svg_text_color = '#fff',
  newuser_box_color = 'rgb(41, 128, 185)',
  bot_color = 'rgb(155, 89, 182)',
  anon_color = 'rgb(46, 204, 113)',
  edit_color = '#fff';

var loaded_sounds = 0;
var sound_totals = 51;
var sound_load = function(r) {
  loaded_sounds += 1
  if (loaded_sounds == sound_totals) {
    all_loaded = true
    console.log('Loading complete')
    console.log(celesta);
  } else {
    // console.log('Loading : ' + loaded_sounds + ' files out of ' + sound_totals)
  }
}

var panoptes_projects = {};

(function loadPanoptesProjects() {
  var request = new XMLHttpRequest();
  request.open('GET', "https://www.zooniverse.org/api/projects/?page=1&page_size=100&launch_approved=true");
  request.setRequestHeader('Accept', 'application/vnd.api+json; version=1');
  request.setRequestHeader('Content-Type', 'application/json');
  request.send();
  request.onload = function (e) {
    var projects = JSON.parse( this.responseText ).projects;
    projects.forEach( function (project) {
      panoptes_projects[project.id] = project;
    })
  }
})();

var ouroboros_projects = {};

(function loadProjects() {
  // List of identifiers to ignore (i.e. Not show)
  ignore_these = ["m83", "impossible_line", "leaf", "cancer_gene_runner", "galaxy_zoo_starburst", "galaxy_zoo_quiz"]

  // Get .ist of projects from API annd create items for display
  var request = new XMLHttpRequest();
  request.open('GET', "https://api.zooniverse.org/projects/list");
  request.send();
  request.onload = function (e) {
    var projects = JSON.parse( this.responseText);
    projects.forEach( function (project){
      ouroboros_projects[project.name] = project.display_name;
    });
  };
})();


var pusher = new Pusher('79e8e05ea522377ba6db');
var panoptes = pusher.subscribe('panoptes');
var ouroboros = pusher.subscribe('ouroboros');
var talk = pusher.subscribe('talk');

var subjects = [];
var imgs = Array.from(document.getElementsByTagName('img'));

panoptes.bind('classification', function(data) {
  var user_id = ( !!data.user_id ) ? parseInt( data.user_id ) : 0;
  var project = parseInt(data.project_id) + parseInt(data.workflow_id) + user_id + parseInt(data.classification_id);
  var red = parseInt(data.project_id) % 256;
  var green = parseInt(data.workflow_id) % 256;
  var blue = parseInt(user_id) % 256;
  if (panoptes_projects[data.project_id]) {
    setTimeout(function() {
      var image = data.subject_urls[0];
      var body = document.body;
      var image_type = Object.keys(image)[0]
      var subject = image[image_type] || '';
      subjects.unshift(subject);
      if (subjects.length > 20) {
        subjects.pop();
      }
      subjects.forEach(function(subject, i) {
        imgs[i].src = subject;
        imgs[i].alt = panoptes_projects[data.project_id].display_name;
      });
    }, 2000);
  }
  // console.log( "panoptes classification", data );
});
talk.bind('comment', function(data) {
  console.log("panoptes comment", data);
});

ouroboros.bind('classification', function(data) {
  console.log( "ouroboros classification", data );
});
ouroboros.bind('comment', function(data) {
  console.log("ouroboros comment", data);
});
