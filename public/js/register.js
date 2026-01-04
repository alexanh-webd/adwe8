const registerForm = document.getElementById("registerForm");
const email = document.getElementById("email");
const password = document.getElementById("password");



registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = {
        email: email.value,
        username: username.value,
        password: password.value,
        isAdmin: isAdmin.checked
    };
    try {
        const response = await fetch("/api/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        console.log("Registration successful:", data);
        window.location.href = "/";
    } catch(error) {
        console.error("Error during registration:", error);
    }
});






