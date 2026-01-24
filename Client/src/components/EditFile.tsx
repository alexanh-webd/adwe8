import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import {useTranslation} from 'react-i18next';
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
                //setComment([...comment, data.comments]);
                //console.log(data.comment[0])
                //let i: number = 0;
                //for (i = 0; i < data.comment.length; i++) {
                //    console.log(data.comment[0])
                //}
                
                setComment(data.comment)
            } catch (error: any) {
                console.log("Error fetching comment:", error.message);
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
    }
    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
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
                label={t("Permit User ID")}
                type = "text"
                defaultValue=""
                onChange={(e) => setPermitId(e.target.value)}
                />
                <Button sx={{ display: 'flex', justifyContent: 'center', marginLeft: 2 }} variant="contained" color="primary" onClick={() => permissionButton()}>{t("Give permit")}</Button>
            <TextField
                required
                id="outlined-required"
                label={t("Rename the file")}
                type = "text"
                defaultValue=""
                onChange={(e) => setRename(e.target.value)}
                />
            <Button sx={{ display: 'flex', justifyContent: 'center', marginLeft: 2 }} variant="contained" color="primary" onClick={() => renameButton()}>{t("Rename")}</Button>
            <TextField
                required
                id="outlined-required"
                label={t("Comment line")}
                type = "number"
                defaultValue=""
                onChange={(e) => setLine(Number(e.target.value))}
                />
            <TextField
                required
                id="outlined-required"
                label={t("Give comment")}
                type = "text"
                defaultValue=""
                onChange={(e) => setInComment(e.target.value)}
                />
            
            <Button sx={{ display: 'flex', justifyContent: 'center', marginLeft: 2 }} variant="contained" color="primary" onClick={() => commentBtn()}>{t("Comment")}</Button>
            <Button onClick={() => changeLanguage("fi")}>FI</Button>
            <Button onClick={() => changeLanguage("en")}>EN</Button>
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
                        {t("Edit File")}
                    </Typography>

                    {loading ? (
                        <Typography>{t("Loading...")}</Typography>
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
                            {saving ? t("Saving...") : t("Save")}
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => lockButton()}
                        > {t("lock")}
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => unLockButton()}
                        > {t("Unlock")}
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => viewToAllBtn()}
                        > {t("View to all")}
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => downLoadPdfBtn()}
                        > {t("Download PDF")}
                        </Button>
                    </Box>
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6">{t("Comments")}</Typography>

                        {comment.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                {t("No comments yet")}
                            </Typography>
                        ) : (
                            comment.map((c, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        mt: 2,
                                        p: 2,
                                        border: "1px solid #ddd",
                                        borderRadius: 1,
                                        backgroundColor: "#fafafa",
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
                                </Box>
                            ))
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
        </div>
    );
};

export default EditFile;
