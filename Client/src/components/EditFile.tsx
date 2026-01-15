import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";

const EditFile = () => {
    const { fileId } = useParams<{ fileId: string }>(); // only call once
    const [jwt, setJwt] = useState<string | null>(null);
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [permitId, setPermitId] = useState<string>("");
    const [rename, setRename] = useState<string>("");
    // Set JWT once on mount
    useEffect(() => {
        const token = localStorage.getItem("userToken");
        if (token) setJwt(token);
    }, []);

    // Fetch file content when JWT or fileId changes
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
    }, [jwt, fileId]);

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
                body: JSON.stringify({ content }),
            });
            const data = await response.json();
            console.log("Saved:", data);
        } catch (error: any) {
            console.log("Error saving file:", error.message);
        } finally {
            setSaving(false);
        }
    };

    const lockButton = async() => {
        try {
            const lockResponse = await fetch(`http://localhost:4000/api/lock/${fileId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${jwt}`,
                }
            });
            const lockData = await lockResponse.json();
            console.log("File locked:", lockData);
        } catch (error: any) {
            console.error("Error locking file:", error.message);
        }
    }
    
    const unLockButton = async() => {
        try {
            const lockResponse = await fetch(`http://localhost:4000/api/unlock/${fileId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${jwt}`,
                }
            });
            const lockData = await lockResponse.json();
            console.log("File unlocked:", lockData);
        } catch (error: any) {
            console.error("Error unlocking file:", error.message);
        }
    }

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
            console.log("Permission granted:", permissionData);
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
            console.log(renameData)
        } catch (error: any) {
            console.error("Error rename the file " + error.message);
        }
    }

    const viewToAllBtn = async() => {
        try {
            const giveViewFetching = await fetch(`http://localhost:4000/api/read=true/${fileId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${jwt}`
                }
            })
            if (!giveViewFetching.ok) {
                console.log("Error when fetching data");
            }
            console.log("Set view = true successfully");
        } catch(error: any) {
            console.log("Error when giving view permission to all user!!!")
        }
    } 

    return (
        <div>
            <Box
            component="form"
            sx={{
                alignItems: 'left',
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
                label="Permit User ID"
                type = "text"
                defaultValue=""
                onChange={(e) => setPermitId(e.target.value)}
                />
                <Button sx={{ display: 'flex', justifyContent: 'center', marginLeft: 2 }} variant="contained" color="primary" onClick={() => permissionButton()}>Give permit</Button>
            <TextField
                required
                id="outlined-required"
                label="Rename the file"
                type = "text"
                defaultValue=""
                onChange={(e) => setRename(e.target.value)}
                />
            <Button sx={{ display: 'flex', justifyContent: 'center', marginLeft: 2 }} variant="contained" color="primary" onClick={() => renameButton()}>Rename</Button>
            
            </Box>
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#e5e5e5",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                pt: 6,
            }}
        >
            <Card
                sx={{
                    width: "210mm",
                    minHeight: "297mm",
                    maxWidth: "100%",
                    boxShadow: 6,
                    borderRadius: 1,
                }}
            >
                <CardContent sx={{ p: 6 }}>
                    <Typography variant="h4" sx={{ mb: 4, fontWeight: 500 }}>
                        Edit File
                    </Typography>

                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : (
                        <TextField
                            multiline
                            minRows={25}
                            fullWidth
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            variant="outlined"
                            sx={{
                                "& .MuiInputBase-root": {
                                    fontFamily: `"Times New Roman", serif`,
                                    fontSize: "16px",
                                    lineHeight: 1.6,
                                    padding: "16px",
                                },
                                backgroundColor: "#ffffff",
                            }}
                        />
                    )}

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                        <Button
                            variant="contained"
                            size="large"
                            disabled={saving}
                            onClick={saveButton}
                        >
                            {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => lockButton()}
                        > lock
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => unLockButton()}
                        > Unlock
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => viewToAllBtn()}
                        > View to all
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
        </div>
    );
};

export default EditFile;
