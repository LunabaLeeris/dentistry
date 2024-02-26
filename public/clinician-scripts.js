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
        insert_to_table(`/clinician/${this.id}`);
    });
});

// Add listener to a dynamically added content
document.getElementById('table-data').addEventListener('click', function(event) {
    if (!event.target) return;

    const map_view = {
        'add-new-lab-logs'      : `/clinician/add-new-laboratory-log`,
        'back-to-lab-logs'      : `/clinician/laboratory-logs`,
        'add-new-proced-log'    : `/clinician/add-new-procedure-log`,
        'back-to-proced-logs'   : `/clinician/procedure-logs`,
        'add-new-patient'       : `/clinician/add-new-patient`,
        'back-to-patient-chart' : `/clinician/patient-chart`
    };

    if (map_view.hasOwnProperty(event.target.id)) insert_to_table(map_view[event.target.id]);
    
    const map_add = {
        'add-laboratory-log': add_new_laboratory_log,
        'add-procedure-log' : add_new_procedure_log,
        'add-patient'       : add_patient
    };

    if (map_add.hasOwnProperty(event.target.id)) map_add[event.target.id](event);
});


// Helper functions
function insert_to_table(from){
    fetch(from) 
    .then(response => response.text())
    .then(data => {
        document.getElementById("table-data").innerHTML = data;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function add_patient(event){
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
   fetch('/clinician/add-new-patient', {
       method: 'POST',
       headers: new FormData(myForm)
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
     // checks if the selections have values
    var instructorSelect = document.getElementById('instructor-name');
    var selectedOption = instructorSelect.value;
    
    /*
    if (selectedOption == 'Select instructor') { 
        instructorSelect.focus();
        return;
    }
    
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
    fetch('/clinician/add-new-laboratory-log', {
        method: 'POST',
        headers: new FormData(myForm)
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