import axios from "axios"
import { createId } from "@paralleldrive/cuid2";
import { config } from "dotenv";

config({ path: ".env.local" });

interface JsonObject {
    name: string;
    symbol: string;
    description: string;
    image: string;
}

// const jsonObject: JsonObject = {
//     name: 'John Doe',
//     age: 30,
//     city: 'New York',
// };

export const createAndUploadJsonFile = async (jsonObject: JsonObject) => {

    let uniqueId = createId();
    // Step 1: Convert object to JSON string
    const jsonString = JSON.stringify(jsonObject, null, 2);

    // Step 2: Create a Blob from the JSON string (this simulates file creation)
    const blob = new Blob([jsonString], { type: 'application/json' });

    const file = new File([blob], `${uniqueId}-data.json`, { type: "application/json" });

    const fileData = new FormData();
    fileData.append("file", file);

    console.log(fileData)

    const responseData = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: fileData,
        headers: {
            pinata_api_key: process.env.PINATA_API_KEY!,
            pinata_secret_api_key: process.env.PINATA_SECRET_KEY!,
            "Content-Type": "multipart/form-data"
        }
    })

    const url = "https://gateway.pinata.cloud/ipfs/" + responseData.data.IpfsHash;
    return url
};