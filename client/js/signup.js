const signupsbmtBtn = document.getElementById("sgnbutton");


const handleSignUp = async (name, email, password) => {
    let result = await fetch(
        'http://localhost:5000/signup', {
        method: "post",
        body: JSON.stringify({ name, email, password}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    result = await result.json();
    console.warn(result);
    if(result.message === "Email already exists. Please use another email.")alert("User already exist")
    else if (result) {
        alert("Data saved successfully");
    }
    else {
        alert("Issue");
    }
}

signupsbmtBtn.addEventListener('click', (e) => {
    console.log("hey")
    e.preventDefault();
    const username = document.getElementById('name').value;
    const useremail = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(useremail,username,password)
    handleSignUp(username, useremail, password);
})