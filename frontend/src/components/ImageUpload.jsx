import React, { useState } from "react";
import axios from "axios";
import { Upload, X, Loader } from "lucide-react";
import { API_BASE_URL } from "../config/api";

const ImageUpload = ({ value, onChange, placeholder = "Upload Image" }) => {
    const [uploading, setUploading] = useState(false);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
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
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue rounded-xl shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors border-dashed border-gray-300">
                    {uploading ? (
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                        <Upload className="w-8 h-8 text-primary" />
                    )}
                    <span className="mt-2 text-base leading-normal text-gray-500 font-bold">
                        {uploading ? "Uploading..." : placeholder}
                    </span>
                    <input
                        type="file"
                        className="hidden"
                        onChange={uploadFileHandler}
                        disabled={uploading}
                    />
                </label>
            )}
        </div>
    );
};

export default ImageUpload;
