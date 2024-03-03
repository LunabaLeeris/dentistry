// Handles button effect and routing
const buttons = document.querySelectorAll('.nav-btn');
buttons.forEach(button => {
    button.addEventListener('click', function() {
        buttons.forEach(btn => {
            btn.classList.remove('active-button');
            btn.querySelector('h5').classList.remove('text-dark');
            btn.querySelector('h5').classList.add('text-info-emphasis');
        });
        // Add "active" class to the clicked button
        this.classList.add('active-button');
        this.querySelector('h5').classList.remove('text-info-emphasis');
        this.querySelector('h5').classList.add('text-dark');
        
        // func to call
        map_route = { // DEFAULT VALUES
            'laboratory-logs': `/clinician/laboratory-logs/0/laboratory_last_updated/desc`,
            'patient-chart' : `/clinician/patient-chart/0/patient_last_updated/desc`
        }

        if (map_route.hasOwnProperty(this.id), insert_to_table(map_route[this.id]));
    });
});

// Add listener to a dynamically added content
document.getElementById('table-data').addEventListener('click', function(event) {
    if (!event.target) return;

    const map_view = {
        'add-new-lab-logs'      : `/clinician/add-new-laboratory-log`,
        'back-to-lab-logs'      : `/clinician/laboratory-logs/0/laboratory_last_updated/desc`,
        'add-new-proced-log'    : `/clinician/add-new-procedure-log`,
        'back-to-proced-logs'   : `/clinician/procedure-logs`,
        'add-new-patient'       : `/clinician/add-new-patient`,
        'back-to-patient-chart' : `/clinician/patient-chart/0/patient_last_updated/desc`
    };

    const map_add = { // POST REQUESTS
        'add-laboratory-log' : add_new_laboratory_log,
        'edit-laboratory-log': edit_laboratory_log,
        'add-procedure-log'  : add_new_procedure_log,
        'add-patient'        : add_patient,
        'pat-save-changes'   : edit_patient_chart,
        'search'             : search
    };

    const actions = { // RE-ROUTING
        'lab-view'     : `/clinician/view-laboratory_log/`,
        'lab-delete'   : `/clinician/delete-laboratory-log/`,
        'lab-edit'     : `/clinician/edit-laboratory-log/`,
        'lab-table-nav'    : `/clinician/laboratory-logs/`,
        'pat-view'     : `/clinician/view-patient-chart/`,
        'pat-delete'   : `/clinician/delete-patient-chart/`,
        'pat-edit'     : `/clinician/edit-patient-chart/`,
        'pat-table-nav'    : `/clinician/patient-chart/`
    }

    if (map_view.hasOwnProperty(event.target.id)) insert_to_table(map_view[event.target.id]);

    else if (map_add.hasOwnProperty(event.target.id)) map_add[event.target.id](event);

    else if (actions.hasOwnProperty(event.target.id)) insert_to_table(`${actions[event.target.id]}${event.target.name}`);

    else if (event.target.id == "lab-ask-delete"){
        confirm_delete_modal(event, `lab`, `Are you sure you want to delete this laboratory log?
        This will be deleted permanently!`);
    }

    else if (event.target.id == "pat-ask-delete"){
        confirm_delete_modal(event, `pat`, `Are you sure you want to delete this patient chart?
        Deleting this patient will affect other clinicians. Please think this through...`);
    }

}); 

// Helper functions
function insert_to_table(from){
    console.log(from);
    fetch(from) 
    .then(response => response.text())
    .then(data => {
        document.getElementById("table-data").innerHTML = data;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// SIMILAR TO ADD LABORATORY LOGS. FIND WAY TO MERGE
function add_patient(event){
    event.preventDefault();
    
   const myForm = document.getElementById('PatientFormNew');
   if (!myForm.checkValidity()){
       Array.from(myForm.elements).forEach(element => {
           if (element.hasAttribute('required')) {
               element.reportValidity();
               return;
           }
       });

       return;
   }

   const data = new FormData(myForm);

    const formDataJson = {};
    data.forEach((value, key) => {
        formDataJson[key] = value;
    });
   // handle fetching logic
   fetch('/clinician/add-new-patient', {
        method: 'POST',
        headers: {
                'Content-Type': 'application/json'
            },
        body: JSON.stringify(formDataJson)
   })
   .then(response => response.text())
   .then(htmlResponse => {
       // Update the innerHTML of an element with the received HTML response
       document.getElementById('table-data').innerHTML = htmlResponse;
       open_alert("add-patient-success", "success", "Patient successfully added!");
   })
   .catch(error => {
       console.error('Error:', error);
   });
}

// @CHANGE: ALMOST THE SAME AS ADD, TRY TO MAKE THEM AS ONE
function edit_patient_chart(event){
   event.preventDefault();

   const myForm = document.getElementById('PatientFormEdit');
   if (!myForm.checkValidity()){
       Array.from(myForm.elements).forEach(element => {
           if (element.hasAttribute('required')) {
               element.reportValidity();
               return;
           }
       });

       return;
   }
   
   const data = new FormData(myForm);

    const formDataJson = {};
    data.forEach((value, key) => {
        formDataJson[key] = value;
    });

    console.log(formDataJson);
    console.log(event.target.name);
   // handle fetching logic
   fetch(`/clinician/edit-patient-chart/${event.target.name}`, {
        method: 'POST',
        headers: {
                'Content-Type': 'application/json'
            },
        body: JSON.stringify(formDataJson)
   })
   .then(response => response.text())
   .then(htmlResponse => {
       // Update the innerHTML of an element with the received HTML response
       document.getElementById('table-data').innerHTML = htmlResponse;
       open_alert("add-patient-success", "success", "Patient chart succesfully edited!");
   })
   .catch(error => {
       console.error('Error:', error);
   });
}

function add_new_procedure_log(event){
    event.preventDefault();
    // checks if the selections have values
   
   /*
   const myForm = document.getElementById('myForm');
   if (!myForm.checkValidity()){
       Array.from(myForm.elements).forEach(element => {
           if (element.hasAttribute('required')) {
               element.reportValidity();
               return;
           }
       });

       return;
   }
   */

   // handle fetching logic
   fetch('/clinician/add-new-procedure-log', {
       method: 'POST',
       headers: new FormData(myForm)
   })
   .then(response => response.text())
   .then(htmlResponse => {
       // Update the innerHTML of an element with the received HTML response
       document.getElementById('table-data').innerHTML = htmlResponse;
       open_alert("add-proced-success", "success", "Procedure log successfully added!");
   })
   .catch(error => {
       console.error('Error:', error);
   });
}

function add_new_laboratory_log(event){
    event.preventDefault();
    var instructorSelect = document.getElementById('instructor-id');
    var selectedOption = instructorSelect.value;
    
    if (selectedOption == 'Select instructor') { 
        instructorSelect.focus();
        return;
    }
    
    const myForm = document.getElementById('LaboratoryForm');
    if (!myForm.checkValidity()){
        Array.from(myForm.elements).forEach(element => {
            if (element.hasAttribute('required')) {
                element.reportValidity();
                return;
            }
        });

        return;
    }

    const data = new FormData(myForm);

    const formDataJson = {};
    data.forEach((value, key) => {
        formDataJson[key] = value;
    });

    // handle fetching logic
    fetch('/clinician/add-new-laboratory-log', {
        method: 'POST',
        headers: {
                'Content-Type': 'application/json'
            },
        body: JSON.stringify(formDataJson)
    })
    .then(response => response.text())
    .then(htmlResponse => {
        // Update the innerHTML of an element with the received HTML response
        document.getElementById('table-data').innerHTML = htmlResponse;
        open_alert("add-log-success", "success", "Laboratory log successfully added!");
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// @CHANGE: ALMOST THE SAME AS ADD, TRY TO MAKE THEM AS ONE
function edit_laboratory_log(event){ 
    event.preventDefault();
    var instructorSelect = document.getElementById('instructor-id');
    var selectedOption = instructorSelect.value;
    
    if (selectedOption == 'Select instructor') { 
        instructorSelect.focus();
        return;
    }
    
    const myForm = document.getElementById('LaboratoryForm');
    if (!myForm.checkValidity()){
        Array.from(myForm.elements).forEach(element => {
            if (element.hasAttribute('required')) {
                element.reportValidity();
                return;
            }
        });

        return;
    }

    const data = new FormData(myForm);

    const formDataJson = {};
    data.forEach((value, key) => {
        formDataJson[key] = value;
    });

    console.log(formDataJson);

    // handle fetching logic
    fetch(`/clinician/edit-laboratory-log/${event.target.name}`, {
        method: 'POST',
        headers: {
                'Content-Type': 'application/json'
            },
        body: JSON.stringify(formDataJson)
    })
    .then(response => response.text())
    .then(htmlResponse => {
        // Update the innerHTML of an element with the received HTML response
        document.getElementById('table-data').innerHTML = htmlResponse;
        open_alert("add-log-success", "success", "Lab Log sucesfully edited!");
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function search(event){
    event.preventDefault();
    var search_bar = document.getElementById('search-bar');
    if (search_bar.value == "") return;

    insert_to_table(`${event.target.name}/${search_bar.value}`);
}

function confirm_delete_modal(event, where, message){
    const modal = `
    <div class="modal fade" id="delete-modal" tabindex="-1" aria-labelledby="delete-modal" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel">DANGER</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                ${message}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" id="${where}-delete" name="${event.target.name}"class="btn btn-danger" data-bs-dismiss="modal">Delete</button>
            </div>
            </div>
        </div>
    </div>
    `;

    document.getElementById('modal-container').innerHTML = modal;
    new bootstrap.Modal(document.getElementById('delete-modal')).show();
}

function open_alert(id, type, message) {
    const alertPlaceholder = document.getElementById(id)
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
}

// Handles log out logic
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