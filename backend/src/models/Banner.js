import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["main", "sub"],
            default: "main",
        },
        link: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
