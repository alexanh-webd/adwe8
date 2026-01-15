import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";

const NonAuthContent = () => {
    const { fileId } = useParams<{ fileId: string }>(); // only call once
    const [content, setContent] = useState("");
    // Set JWT once on mount;

    // Fetch file content when JWT or fileId changes
    useEffect(() => {
        const fetchFileContent = async () => {
            if (!fileId) return;
            try {
                const response = await fetch(`http://localhost:4000/api/nonAuth/content/${fileId}`)
                const data = await response.json();
                setContent(data.content); // update textarea
            } catch (error: any) {
                console.log("Error fetching file content:", error.message);
            }
        };
        fetchFileContent();
    }, [fileId]);

    return (
        <div>
            <p>{content}</p>
        </div>
    )
}

export default NonAuthContent