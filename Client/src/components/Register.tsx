import { useState } from 'react'
const fetchData = async (email: string, username: string, password: string, isAdmin: boolean) => {
    try {
        const response = await fetch("http://localhost:4000/api/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                username,
                password,
                isAdmin
            })
        })
        const data = await response.json();
        if (response.status === 403) {
            console.log(data.email);
        } else if (response.status === 200) {
            console.log("Registration successful");
            window.location.href = "/login";
        }
        //console.log("Resgistration successfully: ", data);
        
    } catch(error) {
        if (error instanceof Error) {
            console.log("Error when trying to register: " + error.message);
        }
    }
}

const Register = () => {
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    return (
        <div>
            <form id = "registerForm" onSubmit={(e) => {
                e.preventDefault();
                fetchData(email, username, password, isAdmin);
            }}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="text" id="email" name="email" required defaultValue={""} onChange={(e)=>setEmail(e.target.value)}/>
                </div>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" required defaultValue={""} onChange={(e)=>setUsername(e.target.value)}/>
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="text" id="password" name="password" required defaultValue={""} onChange={(e)=>setPassword(e.target.value)}/>
                </div>
                <div className="form-group">
                    <label htmlFor="isAdmin">Is Admin:</label>
                    <input type="checkbox" id="isAdmin" name="isAdmin" onChange={(e) => setIsAdmin(e.target.checked)}/>
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;


