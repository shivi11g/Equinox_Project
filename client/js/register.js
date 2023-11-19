// Correct way to select elements with both 'btn' and 'r' classes
let  registerButtons= document.querySelectorAll('.btn.r');
const sbmtBtn = document.getElementById("lgnbutton");

console.log(registerButtons)
// 


registerButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    try {
      const box = button.closest('.box');
      if (box) {
        const boxId = box.id;
        console.log('Box ID:', boxId);
        const email = localStorage.getItem('email');
        console.log(email)
        if (email) {
          handleLogin(email, boxId);
          console.log('Login handled for Box ID:', boxId);
        } else {
          console.error('Email not found in localStorage.');
        }
      } else {
        console.error('.box element not found for the clicked button.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});




// const handleLogin = async (email, eventId) => {
//   try {
//     let response = await fetch("http://localhost:5000/register", {
//       method: "post",
//       body: JSON.stringify({ email,  eventId }),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (response.ok) {
//       let result = await response.json();
//       if(result == "User is already registered for this event")alert("already registered");
//       else alert("Registered successfully");
//       localStorage.setItem("email",email);
//       localStorage.setItem('LoggedIn',true)
//       // You can add further logic here, such as redirecting to another page
//     } else {
//       alert("unable to registered");
//     }
//   }
//   catch (error) {
//     console.error("Error occurred:", error);
//     alert("Error occurred while logging in");
//   }
// };
const handleLogin = async (email, eventId) => {
  try {
    let response = await fetch("http://localhost:5000/register", {
      method: "post",
      body: JSON.stringify({ email, eventId }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      let result = await response.json();
      if (result.message === "User is already registered for this event") {
        alert("Already registered");
      } else if (result.message === "Registered Successfully") {
        alert("Registered successfully");
      }
      localStorage.setItem("email", email);
      localStorage.setItem("LoggedIn", true);
      // You can add further logic here, such as redirecting to another page
    } else {
      alert("Unable to register");
    }
  } catch (error) {
    console.error("Error occurred:", error);
    alert("Error occurred while logging in");
  }
};


// sbmtBtn.addEventListener("click", (e) => {
//   e.preventDefault();
//   const useremail = document.getElementById("email").value;
//   const password = document.getElementById("password").value;
//   const eventId= boxId
//   console.log(useremail, password,eventId);
//   handleLogin(useremail, password, eventId);
// });