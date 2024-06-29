// Handles button effect and routing
const buttons = document.querySelectorAll('.nav-btn');
buttons.forEach(button => {
    button.addEventListener('click', function() {
        buttons.forEach(btn => {
            btn.classList.remove('active-button');
            btn.querySelector('h5').classList.remove('text-dark');
            btn.querySelector('h5').classList.add('text-info-emphasis');
        });
        this.classList.add('active-button');
        this.querySelector('h5').classList.remove('text-info-emphasis');
        this.querySelector('h5').classList.add('text-dark');

        map_route = { // DEFAULT VALUES
            'laboratory-logs': `/instructor/laboratory-logs/0/laboratory_last_updated/desc/current_date`,
            'clinicians' : `/instructor/clinicians/0/clinician_id/desc`,
            'patients' : `/instructor/patients/0/patient_last_updated/desc`
        }

        if (map_route.hasOwnProperty(this.id), insert_to_table(map_route[this.id], "table-data"));
    });
});
// Add listener to a dynamically added content
document.getElementById('table-data').addEventListener('click', function(event) {
    const map_view = {
        'back-to-lab-logs': `/instructor/laboratory-logs/0/laboratory_last_updated/desc/current_date`
    };

    const map_add = {
        'search'             : search
    };

    const map = {
        
    };

    const actions = {
        'cl-view'     : `/instructor/view-clinician/`,
    };

    if (map.hasOwnProperty(event.target.id)) insert_to_table(map[event.target.id], "table-data");

    else if (map_add.hasOwnProperty(event.target.id)) map_add[event.target.id](event);

    else if (actions.hasOwnProperty(event.target.id)) insert_to_table(`${actions[event.target.id]}${event.target.name}`, "table-data");

    else if (map_view.hasOwnProperty(event.target.id)) insert_to_table(map_view[event.target.id], "table-data");
});

// Helper functions
function insert_to_table(from, to){
    console.log(from);
    fetch(from) 
    .then(response => response.text())
    .then(data => {
        document.getElementById(to).innerHTML = data;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function search(event){
    event.preventDefault();
    var search_bar = document.getElementById('search-bar');
    if (search_bar.value == "") return;

    insert_to_table(`${event.target.name}/${search_bar.value}`, "table-data");
}

// Log out
document.getElementById('logout_confirm').addEventListener('click', function() {
    fetch('/') 
    .then(response => {
        if (response.ok) {
            console.log('Succesfully logged out');
            window.location.href = '/';
        } 
        else {
            console.error('Error calling route:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
});