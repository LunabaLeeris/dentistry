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


        insert_to_table(`/instructor/${this.id}`);
    });
});
// Add listener to a dynamically added content
document.getElementById('table-data').addEventListener('click', function(event) {
    const map = {
        
    };

    if (map.hasOwnProperty(event.target.id)) insert_to_table(map[event.target.id]);
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