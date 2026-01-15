import { use, useEffect, useState } from "react";
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { Link } from 'react-router-dom'
import { Box, Card, CardActions, CardContent, TextField, Typography } from '@mui/material'
interface ITopic {
    title: string;
    content: string;
    username: string;
    createdAt: Date;
}

interface ITextFile {
    _id: string;
    filename: string;
    path: string;
    uploadedAt: Date;
    owner: string;
    editor: string[];
    editingSessions: {
        userId: string | null;
        fileLocked: boolean;
    },
    readonly: boolean
}

interface INonAuthFile {
    file: ITextFile[];
}

const Home = () => {
    const [jwt, setJwt] = useState<string | null>(null);
    const [topics, setTopics] = useState<ITopic[]>([]);
    const [title, setTitle] = useState<string>("123");
    const [content, setContent] = useState<string>("default");
    const [fileNameIn, setFileNameIn] = useState<File | null>(null);
    const [fetchedFiles, setFetchedFiles] = useState<ITextFile[]>([]);
    const [userId, setUserId] = useState<string>("");
    const [nonAuthFile, setNonAuthFile] = useState<ITextFile[]>([]);
    useEffect(() => {
        if(localStorage.getItem("userToken")) {
            setJwt(localStorage.getItem("userToken"));
        }
    }, [jwt]);

    const postFile = async () => {
        try {
            if (!fileNameIn) {
                console.log("No file selected");
                return;
            } else {
                const formData = new FormData();
                formData.append("image", fileNameIn);
                const res = await fetch("http://localhost:4000/api/upload", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${jwt}`
                    },
                    body: formData
                });
                const data = await res.json();
                if (res.status === 201) {
                    console.log("File uploaded successfully");
                    console.log(data);
                    setUserId(data.owner);
                }
            }
        } catch(error: any) {
            if (error instanceof Error) {
                console.log("Error when trying to post file: " + error.message);
            }
        }
    }

    const fetchFileCorrespondingToUser = async () => {
        try {
            const formfetch = new FormData();
            formfetch.append("owner", userId);
            const correspondingFile = await fetch("http://localhost:4000/api/files", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${jwt}`
                },
                body: formfetch
            });
            const data: ITextFile[] = await correspondingFile.json();
            console.log(data);
            setFetchedFiles(data);
        } catch(error: any) {
            if (error instanceof Error) {
                console.log("Error when trying to fetch file: " + error.message);
            }
        }
    }
    const fetchFileNonAuthen = async() => {
        try {
            const fetchFile = await fetch("http://localhost:4000/api/file/nonAuthenticate", {
                cache: "no-store"
            });
            if (!fetchFile.ok) {
                console.log("Error when fetching file");
                return
            }
            const dataFetched: INonAuthFile = await fetchFile.json();
            
            console.log(dataFetched);
            setNonAuthFile(dataFetched.file);
        } catch(error: any) {
            if (error instanceof Error) {
                console.log("Error when fetching file for non authenticate user");
            }
        }
    }

    const handleEdit = async (fileId: string) => {
        console.log(`Edit file with ID: ${fileId}`);
        window.location.href = `/edit/${fileId}`;
    }

    const handleContent = async (fileId: string) => {
        console.log(`Edit file with ID: ${fileId}`)
        window.location.href = `/content/${fileId}`
    }
    const handleDelete = async (fileId: string) => {
        console.log(`Delete file with ID: ${fileId}`);
        try {
            const deleteResponse = await fetch("http://localhost:4000/api/delete/" + fileId, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${jwt}`,
                    "Content-Type": "application/json"
                }
            })
            const responseFromServer = await deleteResponse.json();
            if (deleteResponse.ok) {
                console.log("File deleted successfully");
                // Reload the files after deletion --> UI update CHATGPT suggestion
                setFetchedFiles((prev) =>
                    prev.filter((file) => file._id !== fileId)
                );
            }
            console.log(responseFromServer);
        } catch (error: any) {
            console.log("Error when trying to delete file: " + error.message);
        }
    }

    return (
        <>
         {/* Top-left fixed logout button */}
        <Box
            sx={{
            position: "fixed", // stay fixed on screen
            top: 16,           // distance from top
            right: 16,          // distance from left
            zIndex: 1000       // make sure it's above other elements
            }}
        >
            <Button
            variant="contained"
            color="primary"
            onClick={() => {
                localStorage.removeItem("userToken"); // clear JWT
                window.location.href = "/login";       // redirect to login page
            }}
            >
            Log in
            </Button>
        </Box>
        <div>
        <h2>Home</h2>
        {!jwt ? (
            <>
                <p>Please login to use OneDrive.</p>
                <Button onClick={fetchFileNonAuthen}>Get files</Button>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                        {nonAuthFile.map((file) => (
                            <Card key={file._id} sx={{ width: 300 }}>
                                <CardContent>
                                    <Typography variant="h6">{file.filename}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Created: {new Date(file.uploadedAt).toLocaleDateString()}
                                    </Typography>
                                    <button onClick={() => handleContent(file._id)}>View file</button>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

            </>
            ): (
                <>
                    <Box
                        component="form"
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                            marginLeft: 18,
                        '& .MuiTextField-root': { m: 1, width: '25ch' },
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <TextField
                            required
                            id="outlined-required"
                            label="Title"
                            type = "text"
                            defaultValue=""
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <TextField
                            required
                            id="outlined-password-input"
                            label="Content"
                            type="text"
                            autoComplete="current-password"
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <Button sx={{ display: 'flex', justifyContent: 'center', marginLeft: 2 }} variant="contained" color="primary" >Search File</Button>

                        <ul>
                            {topics.map((topic, index) => (
                                <li key={index}>
                                    <h3>{topic.title}</h3>
                                    <p>{topic.content}</p>
                                    <p>Posted by: {topic.username} at {new Date(topic.createdAt).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    </Box>

                    <Box>
                    <input type="file" accept=".txt" placeholder="Upload a text file" onChange={(e) => setFileNameIn(e.target.files?.[0] ?? null)}/>
                    <Button onClick={postFile}>Upload File To Server</Button>
                    <Button onClick={fetchFileCorrespondingToUser}>Get files</Button>
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                        {fetchedFiles.map((file) => (
                            <Card key={file._id} sx={{ width: 300 }}>
                            <CardContent>
                                <Typography variant="h6">{file.filename}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                Created: {new Date(file.uploadedAt).toLocaleDateString()}
                                </Typography>
                            </CardContent>

                            <CardActions>
                                <Button size="small" onClick={() => handleEdit(file._id)}>
                                Edit
                                </Button>
                                <Button
                                size="small"
                                color="error"
                                onClick={() => handleDelete(file._id)}
                                >
                                Delete
                                </Button>
                            </CardActions>
                            </Card>
                        ))}
                        </Box>
                </>
            )}
       </div> 
    </>

    );
}

export default Home;