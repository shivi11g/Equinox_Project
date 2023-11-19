let arr = []; // Initialize an empty array to store event IDs

const getEvents = async () => {
    let email = localStorage.getItem('email');
    if (email) {
        const requestBody = {
            email: email // Set the email in the request body
        };

        await fetch('http://localhost:5000/getRegisteredEvents', {
            method: 'POST', // Change the method to POST
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody) // Send email in the request body as JSON
        })
        .then(response => response.json())
        .then(data => {
            arr = data.eventIds || [];
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

        for (let i = 0; i < arr.length; i++) {
            const parentElement = document.getElementById(arr[i]);
            console.log(parentElement);
            if (parentElement) {
                const childElement = parentElement.querySelector('.btn.r');
                console.log(childElement);
                if (childElement) {
                    console.log(childElement.innerText);
                    childElement.innerText = 'Registered';
                }
            }
        }
    }
};

getEvents();
