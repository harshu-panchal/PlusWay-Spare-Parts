import React, { useState, useRef } from "react";
import axios from "axios";
import { Upload, X, Loader } from "lucide-react";
import { API_BASE_URL } from "../config/api";

const ImageUpload = ({ value, onChange, placeholder = "Upload Image" }) => {
    const [uploading, setUploading] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleFileUpload = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("image", file);
        setUploading(true);

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

            onChange(data.url);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
            alert("Image upload failed!");
        }
    };

    const uploadFileHandler = (e) => {
        handleFileUpload(e.target.files[0]);
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
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full">
            {value ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    className={`w-full flex flex-col items-center px-4 py-6 bg-white text-blue rounded-xl shadow-lg tracking-wide uppercase cursor-pointer transition-colors border-dashed ${isDragActive ? 'bg-blue-50 border-blue-600 border-2' : 'border-gray-300 border hover:bg-blue-50 hover:text-blue-600'}`}
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
                    <span className="mt-2 text-base leading-normal text-gray-500 font-bold text-center">
                        {uploading ? "Uploading..." : (isDragActive ? "Drop image here" : `${placeholder} or drag and drop`)}
                    </span>
                    <input
                        type="file"
                        className="hidden"
                        ref={inputRef}
                        onChange={uploadFileHandler}
                        disabled={uploading}
                    />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
