import mongoose from "mongoose";

const componentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true},
    name: String,
    brand: String,
    cat: { type: String, required: true, enum: ["cpu", "gpu", "motherboard", "memory", "storage", "cooling", "case", "power", "peripherals"]},
    price: Number,
    specs: { type: mongoose.Schema.Types.Mixed },
});

export const Component = mongoose.models.Component || mongoose.model("Component", componentSchema);