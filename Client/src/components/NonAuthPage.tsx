import { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import { Box, Card, CardActions, CardContent, TextField, Typography } from '@mui/material';
import {useTranslation} from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';

interface INonAuthFile {
    file: ITextFile[];
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

const NonAuthPage = () => {
    const [nonAuthFile, setNonAuthFile] = useState<ITextFile[]>([]);
    const {t, i18n} = useTranslation();
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
    const handleContent = async (fileId: string) => {
        console.log(`Edit file with ID: ${fileId}`)
        window.location.href = `/content/${fileId}`
    }
    return (
            <>
            <h3>{t("Please login to use OneDrive.")}</h3>
                <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => {
                    localStorage.removeItem("userToken"); // clear JWT
                    window.location.href = "/login";       // redirect to login page
                    }}
                    >
                    {t("log in")}
                </Button>
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
    );
}

export default NonAuthPage;