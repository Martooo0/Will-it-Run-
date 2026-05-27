import fs from "fs";
import mongoose from "mongoose";
import { connectMongo } from "../src/lib/mongodb";
import { Component } from "../src/lib/models/Component";

async function main() {
    await connectMongo();

    const components = JSON.parse(fs.readFileSync("data/components.json", "utf-8"));

    await Component.deleteMany({});
    await Component.insertMany(components);

    console.log(`Seed terminado: ${components.length} componentes insertados`);
    await mongoose.disconnect();
}

main();