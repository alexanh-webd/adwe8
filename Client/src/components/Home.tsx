import { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import { Box, Card, CardActions, CardContent, TextField, Typography } from '@mui/material';
import {useTranslation} from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';

import AppTheme from "../theme/AppTheme";
import ColorModeSelect from "../theme/ColorModeSelect";

import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ContentPasteSearchOutlinedIcon from '@mui/icons-material/ContentPasteSearchOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';

const drawerWidth = 287;

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
    savedAt: Date
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
    const {t, i18n} = useTranslation();
    const [jwt, setJwt] = useState<string | null>(null);
    const [topics, setTopics] = useState<ITopic[]>([]);
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [fileNameIn, setFileNameIn] = useState<File | null>(null);
    const [fetchedFiles, setFetchedFiles] = useState<ITextFile[]>([]);
    const [userId, setUserId] = useState<string>("");
    const [nonAuthFile, setNonAuthFile] = useState<ITextFile[]>([]);
    const [visible, setVisible] = useState<number>(2);
    //getJWT from local storage --> will be used to fetch files corresponding to users
    useEffect(() => {
        if(localStorage.getItem("userToken")) {
            setJwt(localStorage.getItem("userToken"));
        }
    }, []);
    // If JWT is valid --> Fetching the file
    useEffect(() => {
        if (!jwt) return
        fetchFileCorrespondingToUser();
    }, [jwt])
    // Upload file to server
    const postFile = async () => {
        try {
            if (!fileNameIn) {
                toast("No file selected");
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
                    toast("File uploaded successfully");
                    fetchFileCorrespondingToUser();
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
    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
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

    const showMoreBtn = () => {
        setVisible(visible => visible + 2);
    }
    // This is from ChatGPT
    const displayFiles = title
    ? fetchedFiles.filter(file =>
        file.filename.toLowerCase().includes(title.toLowerCase())
      )
    : fetchedFiles;

    // The UI is from MUI library

    return (
        <AppTheme>
        <CssBaseline enableColorScheme />
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000 }} />
        <Toaster  // This is for the warning message 
            toastOptions={{
            className: 'Toast-dis',
            style: {
            border: '2px',
            padding: '20px',
            width: '180px',
            color: '#ffffff',
            backgroundColor: '#fc84e2'
            },
        }} />
         {/* Top-left fixed logout button */}
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        OneDrive
                    </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'background.paper', },
                    }}
                >
                    <Toolbar />
                    <Box sx={{ overflow: 'auto' }}>
                    <List>
                         <ListItem key={"searchFile"} disablePadding alignItems="flex-start">
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <SearchOutlinedIcon />
                                </ListItemIcon>
                                <Accordion defaultExpanded sx={{ width: '100%' }}>
                                    <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel3-content"
                                    id="panel3-header"
                                    >
                                    <Typography component="span">{t("Search")}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {t("Search by title")}
                                    <Box paddingTop={2}>
                                    <TextField
                                        required
                                        id="outlined-required"
                                        label={t("Title")}
                                        type = "text"
                                        defaultValue=""
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                    </Box>
                                    </AccordionDetails>
                                    <AccordionActions>
                                    </AccordionActions>
                                </Accordion>
                        </ListItem>
                        <ListItem key={"uploadFile"} disablePadding>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <DriveFolderUploadOutlinedIcon />
                            </ListItemIcon>
                            <Accordion defaultExpanded sx={{ width: '100%' }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel3-content"
                                id="panel3-header"
                                >
                                <Typography component="span">{t("Upload")}</Typography>
                            </AccordionSummary>
                                <AccordionDetails>
                                {t("Upload file to your drive")}
                                <Box paddingTop={2}>
                                    <input 
                                    type="file"
                                    accept=".txt" 
                                    placeholder="Upload a text file" 
                                    style={
                                        {
                                            width: '100%',
                                            height: '56px', // same as MUI TextField default height
                                            padding: '16.5px 14px', // match MUI TextField padding
                                            borderRadius: 4,
                                            boxSizing: 'border-box',
                                            background: 'transparent',
                                            color: 'inherit',
                                            border: '1px solid currentColor',

                                        }
                                    }
                                    onChange={(e) => setFileNameIn(e.target.files?.[0] ?? null)}
                                    />
                                </Box>
                            </AccordionDetails>
                            <AccordionActions>
                                <Button endIcon={<SendOutlinedIcon/>} onClick={postFile}>{t("Upload")}</Button>
                            </AccordionActions>
                            </Accordion>
                        </ListItem>
                    </List>
                    <Divider />
                    <List>
                        <ListItem key={"logOut"}>
                            <Button
                                variant="outlined"
                                color="warning"
                                fullWidth
                                onClick={() => {
                                    localStorage.removeItem("userToken"); // clear JWT
                                    window.location.href = "/";       // redirect to login page
                                }}
                                >
                                {t("log out")}
                            </Button>
                        </ListItem>
                    </List>
                    
                    <Button onClick={() => changeLanguage("fi")}>FI</Button>
                    <Button onClick={() => changeLanguage("en")}>EN</Button>
                    <p>User id: {userId || "Loading..."}</p>
            </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <div>
        <Typography variant="h4">{t("Home")}</Typography>
        {!jwt ? (
            <>
                <p>{t("Please login to use OneDrive.")}</p>
                <Button onClick={fetchFileNonAuthen}>{t("Get files")}</Button>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                        {nonAuthFile.map((file) => (
                            <Card key={file._id} sx={{ width: 300 }}>
                                <CardContent>
                                    <Typography variant="h6">{file.filename}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t("Created")}: {new Date(file.uploadedAt).toLocaleDateString()}
                                    </Typography>
                                    <button onClick={() => handleContent(file._id)}>{t("View file")}</button>
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
                        <ul>
                            {topics.map((topic, index) => (
                                <li key={index}>
                                    <h3>{topic.title}</h3>
                                    <p>{topic.content}</p>
                                    <p>{t("Posted by")}: {topic.username} {t("at")} {new Date(topic.createdAt).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    </Box>

                    <Box>
                    <Button onClick={fetchFileCorrespondingToUser}>{t("Get files")}</Button>
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 3 }}>
                        {displayFiles.slice(0, visible).map((file) => (

                            <Card key={file._id} sx={{ width: 300 }}>
                            <CardContent>
                                <Typography variant="h6">{file.filename}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                {t("Created")}: {new Date(file.uploadedAt).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                {t("Saved & Modified")}: {new Date(file.savedAt).toLocaleTimeString()}
                                </Typography>
                            </CardContent>

                            <CardActions>
                                <Button size="small" onClick={() => handleEdit(file._id)}>
                                {t("Edit")}
                                </Button>
                                <Button
                                size="small"
                                color="error"
                                onClick={() => handleDelete(file._id)}
                                >
                                {t("Delete")}
                                </Button>
                            </CardActions>
                            </Card>
                        ))}
                        
                        </Box>
                        <Box paddingTop={2}>
                            <Button variant="outlined" onClick={showMoreBtn}>
                                {t("Show more")}
                            </Button>
                        </Box>
                </>
            )}
       </div> 
      </Box>
    </Box>
    </AppTheme>

    );
}

export default Home;