import React, { useState, useRef } from "react";
import axios from "axios";
import { Upload, Loader } from "lucide-react";
import { API_BASE_URL } from "../config/api";

const MultiImageUpload = ({ onUpload, placeholder = "Upload Images" }) => {
    const [uploading, setUploading] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleFilesUpload = async (files) => {
        if (!files || files.length === 0) return;
        setUploading(true);

        const uploadedUrls = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append("image", file);

            try {
                const config = {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                };

                const { data } = await axios.post(
                    `${API_BASE_URL}/api/upload`,
                    formData,
                    config,
                );
                
                uploadedUrls.push(data.url);
            } catch (error) {
                console.error(error);
                alert(`Failed to upload image: ${file.name}`);
            }
        }

        if (uploadedUrls.length > 0) {
            onUpload(uploadedUrls);
        }
        
        setUploading(false);
        // Reset input so the same files can be selected again if needed
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const uploadFileHandler = (e) => {
        handleFilesUpload(e.target.files);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragActive) {
            setIsDragActive(true);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesUpload(e.dataTransfer.files);
        }
    };

    return (
        <div className="w-full h-full">
            <div
                className={`w-full h-full flex flex-col items-center justify-center p-4 bg-white text-blue rounded-xl shadow-sm tracking-wide uppercase cursor-pointer transition-colors border-dashed min-h-[120px] ${isDragActive ? 'bg-blue-50 border-blue-600 border-2' : 'border-gray-300 border hover:bg-blue-50 hover:text-blue-600'}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                {uploading ? (
                    <Loader className="w-8 h-8 animate-spin text-primary" />
                ) : (
                    <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-600' : 'text-primary'}`} />
                )}
                <span className="mt-2 text-xs md:text-sm leading-normal text-gray-500 font-bold text-center">
                    {uploading ? "Uploading..." : (isDragActive ? "Drop images here" : `${placeholder}`)}
                </span>
                <input
                    type="file"
                    className="hidden"
                    ref={inputRef}
                    onChange={uploadFileHandler}
                    disabled={uploading}
                    multiple
                />
            </div>
        </div>
    );
};

export default MultiImageUpload;
