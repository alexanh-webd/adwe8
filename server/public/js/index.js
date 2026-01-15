const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const topicFormDiv = document.getElementById("topicForm");
const registerBtn = document.getElementById("registerbtn");
const h2Element = document.getElementById("postAppear");

registerBtn.addEventListener("click", async(e) => {
    e.preventDefault();
    window.location.href ="/register.html"
})


loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = {
        email: email.value,
        password: password.value
    }
    try{
        const fetchData = await fetch("/api/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });
        const data = await fetchData.json();
        console.log(data);
        console.log("login status: " + data.token);
        if (data.token) {
            localStorage.setItem("userToken", data.token);
            
            await onLoadResponse;
            
            //testRes.innerText = topicResponse[1].title;
            const titleArea = document.createElement("input");
            titleArea.type = "text";
            titleArea.id = "topicTitle";
            titleArea.placeholder = "Enter title";
            titleArea.name = "topicTitle";
            const textArea = document.createElement("textarea");
            textArea.id= "topicText";
            textArea.name = "topicText";
            textArea.placeholder = "Enter description";
            textArea.className = "materialize-textarea"
            const submitTextBtn = document.createElement("button");
            submitTextBtn.id = "postTopic";
            submitTextBtn.innerText = "Post Topic";
            submitTextBtn.className = "btn waves-effect waves-light"
            //submitTextBtn.type = "submit";
            topicFormDiv.innerHTML = "";
            topicFormDiv.appendChild(titleArea);
            topicFormDiv.appendChild(textArea);
            topicFormDiv.appendChild(submitTextBtn);
            submitTextBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                const topicsDiv = document.getElementById("topics");
                topicsDiv.innerHTML = "";
                const topicFormData = {
                    title: titleArea.value,
                    content: textArea.value
                }
                try {
                    const topicPostedResponse = await fetch("/api/topic", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("userToken")}`
                        },
                        body: JSON.stringify(topicFormData)
                    });
                    const topicPostedData = await topicPostedResponse.json();
                    console.log("Topic posted successfully:", topicPostedData);
                    await getTopicResponseAll();
                } catch (error) {
                    console.error("Error posting topic:", error);
                }
            })
        } else {
            console.error("Login failed");
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
});


const allTopics = async () => {
    //topicFormDiv.innerHTML = ""
    const allTopicsResponse = await fetch("/api/topics");
    const allTopicsData = await allTopicsResponse.json();
    return allTopicsData;
};

const deleteFunction = async (topicE, topicDiv) => {
    try {
        const response = await fetch(`/api/topic/${topicE._id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("userToken")}`
            }
        });

        const data = await response.json();
        if (response.status === 401 || response.status === 403) {
            console.warn(data.message);
            alert("Only admins can delete topics.");
            return;
        }
        if (!response.ok) {
            console.error("Delete failed:", data.message);
            return;
        }
        topicDiv.remove();
        console.log("Topic deleted successfully.");

    } catch (error) {
        console.error("Error deleting topic:", error);
    }
};


const getTopicResponseAll = async () => {

    let topicResponse = await allTopics();
    console.log(topicResponse);
    
    const topicsDiv = document.getElementById("topics");
    topicResponse.forEach((topicE) => {
    const topicDiv = document.createElement("div");
    topicDiv.className = "card z-depth-2 hoverable grey lighten-2"
    const cardContentDiv = document.createElement("div");
    cardContentDiv.className = "card-content"
    const buttonCardDiv = document.createElement("div");
    buttonCardDiv.className = "card-action";
    const topicTitle = document.createElement("span");
    topicTitle.className = "card-title"
    topicTitle.innerText = topicE.title;
    const topicContent = document.createElement("p");
    topicContent.className = "grey-text text-darken-2"
    topicContent.innerText = topicE.content;
    const userInfo = document.createElement("p");
    userInfo.className = "grey-text text-darken-2";
    userInfo.innerText = "Posted by " + topicE.username;
    const createdAtInfo = document.createElement("p");
    createdAtInfo.className = "grey-text text-darken-2"
    createdAtInfo.innerText = "Created at: " + topicE.createdAt;
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn waves-effect waves-light"
    deleteBtn.innerText = "Delete Topic";
    deleteBtn.id = "deleteTopic";
    deleteBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await deleteFunction(topicE, topicDiv);
                    
    })
        buttonCardDiv.appendChild(deleteBtn);
        cardContentDiv.appendChild(topicTitle);
        cardContentDiv.appendChild(topicContent);
        cardContentDiv.appendChild(userInfo);
        cardContentDiv.appendChild(createdAtInfo);
        topicDiv.appendChild(cardContentDiv);
        topicDiv.appendChild(buttonCardDiv);
        topicsDiv.appendChild(topicDiv);
    });
}

const onLoadResponse = async (event) => {
    event.preventDefault();
    h2Element.innerText = "POSTS"
    await getTopicResponseAll();

}



window.onload = allTopics;
window.onload = onLoadResponse;