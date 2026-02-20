import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Card, CardContent, TextField, Typography, Stack, Paper } from "@mui/material";
import {useTranslation} from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';

import AppTheme from "../theme/AppTheme";
import ColorModeSelect from "../theme/ColorModeSelect";

import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadDoneOutlinedIcon from '@mui/icons-material/DownloadDoneOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import MarkUnreadChatAltOutlinedIcon from '@mui/icons-material/MarkUnreadChatAltOutlined';

const drawerWidth = 360;

interface IComment {
    line: number;
    author: string;
    comment: string;
    createdAt: string;
}

const EditFile = () => {
    const {t, i18n} = useTranslation();
    const { fileId } = useParams<{ fileId: string }>(); // only call once
    const [jwt, setJwt] = useState<string | null>(null);
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [permitId, setPermitId] = useState<string>("");
    const [rename, setRename] = useState<string>("");
    const [comment, setComment] = useState<IComment[]>([]);
    const [line, setLine] = useState<Number>(0);
    const [inComment, setInComment] = useState<String>("");
    // Set JWT once on mount
    useEffect(() => {
        const token = localStorage.getItem("userToken");
        if (token) setJwt(token);
    }, []);
    // Fetch file content when JWT or fileId changes
    const fetchComment = async() => {
            if (!jwt || !fileId) return;
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:4000/api/file/${fileId}/getComment`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${jwt}`,
                    },
                });
                const data = await response.json();
                setComment(data.comment)
                
            } catch (error: any) {
                console.log("Error fetching comment:", error.message);
            } finally {
                setLoading(false);
            }
    };
    useEffect(() => {
        const fetchFileContent = async () => {
            if (!jwt || !fileId) return;
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:4000/api/content/${fileId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${jwt}`,
                    },
                });
                const data = await response.json();
                setContent(data.content); // update textarea
            } catch (error: any) {
                console.log("Error fetching file content:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFileContent();
        fetchComment();
    }, [jwt, fileId]);
    useEffect(() => {
        console.log("Updated comments:", comment);
    }, [comment]);

    const saveButton = async () => {
        if (!jwt || !fileId) return;
        setSaving(true);
        try {
            const response = await fetch(`http://localhost:4000/api/file/${fileId}/edit/start`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    content: content,
                    savedAt: Date.now()
                 }),
            });
            const data = await response.json();
            toast("Saved: "+ JSON.stringify(data)), {
                style: {
                    border: "1px solid black",
                    color: '#dd9477'
                }
            };
            
        } catch (error: any) {
            toast("Error saving file:", error.message);
        } finally {
            setSaving(false);
        }
    };
    // LOCK BUTTON ALLOWS THE USER TO PREVENT OTHERS FROM EDITING THE FILE
    const lockButton = async() => {
        try {
            const lockResponse = await fetch(`http://localhost:4000/api/lock/${fileId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${jwt}`,
                }
            });
            const lockData = await lockResponse.json();
            console.log(lockData);
            toast("File locked!");
        } catch (error: any) {
            console.error("Error locking file:", error.message);
        }
    }
    // UNLOCK BUTTON SHOULD BE USED WHEN USER WANTS TO SAVE THE FILE.
    const unLockButton = async() => {
        try {
            const lockResponse = await fetch(`http://localhost:4000/api/unlock/${fileId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${jwt}`,
                }
            });
            const lockData = await lockResponse.json();
            console.log(lockData);
            toast("File unlocked!");
        } catch (error: any) {
            console.error("Error unlocking file:", error.message);
        }
    }
    //Give permission to other user based on their id
    const permissionButton = async() => {
        try {
            const permissionResponse = await fetch(`http://localhost:4000/api/file/${fileId}/permission`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`,
                },
                body: JSON.stringify({ editorId: permitId }),
            });
            const permissionData = await permissionResponse.json();
            toast("Permission granted:", permissionData);
        }catch (error: any) {
            console.error("Error giving permission:", error.message);
        }
    };

    const renameButton = async() => {
        try {
            const renameFetching = await fetch(`http://localhost:4000/api/file/${fileId}/rename`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                },
                body: JSON.stringify({newFilename: rename})
            });
            const renameData = await renameFetching.json();
            toast(JSON.stringify(renameData.message))
        } catch (error: any) {
            console.error("Error rename the file " + error.message);
        }
    }
    // Set the file public to all user
    const viewToAllBtn = async() => {
        try {
            const giveViewFetching = await fetch(`http://localhost:4000/api/read=true/${fileId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${jwt}`
                }
            })
            if (!giveViewFetching.ok) {
                toast("Error when fetching data");
            }
            toast("Set view = true successfully");
        } catch(error: any) {
            toast("Error when giving view permission to all user!!!")
        }
    }
    // download the fileas pdf with name of myfile.pdf
    const downLoadPdfBtn = async() => {
        try {
            const dowloadPdf = await fetch(`http://localhost:4000/api/file/${fileId}/downloadPDF`);
            // Download from ChatGPT
            const blob = await dowloadPdf.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "myfile.pdf";
            a.click();
            window.URL.revokeObjectURL(url);
        } catch(error: any) {
            console.log("Error when download file as PDF")
        }
    }

    const commentBtn = async() => {
        const uploadComment = await fetch(`http://localhost:4000/api/file/${fileId}/comment`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                line: line,
                comment: inComment
            })
        });
        const upLoadCommentJson = await uploadComment.json();
        console.log(upLoadCommentJson);
        fetchComment();
    }
    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
    }
    const homeBtn = () => {
        window.location.href = `/home`;
    }
    // The UI in this edit page is the same as Home.tsx. The difference is the space where the text will showed and can be modified.
    return (
        <AppTheme>
            <CssBaseline enableColorScheme/>
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000 }} />
            <Box
                sx={{
                    width: "100%",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "background.default",
                    color: "text.primary",
                    overflowX: "hidden",
                    }}
                >
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
                        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                        }}
                    >
                        <Toolbar />
                        <Box sx={{ overflow: 'auto' }}>
                        <List>
                            <ListItem key={"Edit Permit"} disablePadding >
                                <DownloadDoneOutlinedIcon />
                                <Accordion defaultExpanded>
                                    <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel3-content"
                                    id="panel3-header"
                                    >
                                    <Typography component="span">{t("Edit Permit")}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                    {t("Give permit to your friends to edit the file")}
                                    </AccordionDetails>
                                    <AccordionActions>
                                        <TextField
                                            required
                                            id="outlined-required"
                                            label={t("Permit User ID")}
                                            type = "text"
                                            defaultValue=""
                                            onChange={(e) => setPermitId(e.target.value)}
                                        />
                                        <Button 
                                        type="button"
                                        sx={{
                                            display: 'flex', justifyContent: 'center', marginLeft: 2 }}
                                            variant="contained" color="primary" 
                                            onClick={() => permissionButton()}
                                            >
                                                {t("Give permit")}
                                        </Button>
                                    </AccordionActions>
                                </Accordion>
                            </ListItem>
                            <ListItem key={"Rename"} disablePadding >
                                <DriveFileRenameOutlineOutlinedIcon/>
                                <Accordion defaultExpanded>
                                    <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel3-content"
                                    id="panel3-header"
                                    >
                                    <Typography component="span">{t("Rename")}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                    {t("Only the owner can rename the file")}
                                    </AccordionDetails>
                                    <AccordionActions>
                                         <TextField
                                            required
                                            id="outlined-required"
                                            label={t("Rename the file")}
                                            type = "text"
                                            defaultValue=""
                                            onChange={(e) => setRename(e.target.value)}
                                            />
                                        <Button
                                            type="button"
                                            sx={{ display: 'flex', justifyContent: 'center', marginLeft: 2 }}
                                            variant="contained" 
                                            color="primary" 
                                            onClick={() => renameButton()}
                                            >
                                                {t("Rename")}
                                        </Button>
                                    </AccordionActions>
                                </Accordion>
                            </ListItem>
                            <ListItem key={"Comment"} disablePadding >
                                <MarkUnreadChatAltOutlinedIcon/>
                                <Accordion defaultExpanded>
                                    <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel3-content"
                                    id="panel3-header"
                                    >
                                    <Typography component="span">{t("Comment")}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                    {t("Give comment to improve the file content")}
                                    <Box paddingTop={2}>
                                        <TextField
                                            fullWidth
                                            required
                                            id="outlined-required"
                                            label={t("Comment line")}
                                            type = "number"
                                            defaultValue=""
                                            onChange={(e) => setLine(Number(e.target.value))}
                                            />
                                        <TextField
                                            fullWidth
                                            required
                                            id="outlined-required"
                                            label={t("Give comment")}
                                            type = "text"
                                            defaultValue=""
                                            onChange={(e) => setInComment(e.target.value)}
                                            />
                                    </Box>
                                    </AccordionDetails>
                                    <AccordionActions>
                                        <Button 
                                            type="button"
                                            sx={{
                                            display: 'flex', justifyContent: 'center'}}
                                            variant="contained"
                                            color="primary"
                                            onClick={() => commentBtn()}
                                            >
                                                {t("Comment")}
                                        </Button>
                                    </AccordionActions>
                                </Accordion>
                            </ListItem>
                        </List>
                        <Divider />
                        <List>
                            <ListItem key={"Lock"}>
                                <Button
                                    color="warning"
                                    variant="contained"
                                    fullWidth
                                    onClick={() => lockButton()}
                                    > {t("lock")}
                                </Button>
                            </ListItem>
                            <ListItem key={"Unlock"}>
                                <Button
                                    color = "success"
                                    variant="contained"
                                    fullWidth
                                    onClick={() => unLockButton()}
                                    > {t("Unlock")}
                                </Button>
                            </ListItem>
                            <ListItem key={"viewToAll"}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => viewToAllBtn()}
                                > {t("View to all")}
                                </Button>
                            </ListItem>
                            <ListItem key={"downloadPDF"}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => downLoadPdfBtn()}
                                > {t("Download PDF")}
                                </Button>
                            </ListItem>
                            <ListItem key={"homePage"}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => homeBtn()}
                                > {t("Go home")}
                                </Button>
                            </ListItem>
                        </List>
                        <p>{t("Change language")}</p>
                        <Button variant="text" onClick={() => changeLanguage("fi")}>FI</Button>
                        <Button variant="text" onClick={() => changeLanguage("en")}>EN</Button>
                        </Box>
                    </Drawer>
                    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                            <Card
                                sx={{
                                    width: "210mm",
                                    minHeight: "297mm",
                                    bgcolor: "background.paper",
                                    boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                                    borderRadius: 2,
                                }}
                            >
                                <CardContent sx={{ p: 6 }}>
                                    {loading ? (
                                        <Typography>{t("Loading...")}</Typography>
                                    ) : (
                                        <TextField
                                            multiline
                                            minRows={25}
                                            fullWidth
                                            variant="standard"
                                            sx={{
                                                fontFamily: `"Roboto", "Arial", sans-serif`,
                                                fontSize: "15px",
                                                lineHeight: 1.7,
                                            }}
                                            value = {content}
                                            onChange={(e) => setContent(e.target.value)}
                                        />
                                    )}

                                    <Box sx={{
                                            mt: 4,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                disabled={saving}
                                                onClick={saveButton}
                                            >
                                                {saving ? t("Saving...") : t("Save")}
                                            </Button>
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 6 }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            {t("Comments")}
                                        </Typography>
                                        <Stack spacing = {2}>
                                            {comment.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">
                                                {t("No comments yet")}
                                            </Typography>
                                        ) : (
                                            comment.map((c, index) => (
                                                
                                                <Paper
                                                    key={index}
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 2,
                                                        border: (theme) => `1px solid ${theme.palette.divider}`,
                                                        bgcolor: "background.paper"
                                                    }}
                                                >
                                                    <Typography variant="subtitle2">
                                                        Line {c.line}
                                                    </Typography>

                                                    <Typography variant="body1">
                                                        {c.comment}
                                                    </Typography>

                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(c.createdAt).toLocaleString()}
                                                    </Typography>
                                                </Paper>
                                            ))
                                        )}
                                        </Stack>
                                    </Box>
                                </CardContent>
                            </Card>
                    </Box>
                </Box>   
                <Toaster  
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
        </Box>
    </AppTheme>
    );
};

export default EditFile;