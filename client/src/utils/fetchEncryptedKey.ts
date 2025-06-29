import axios from "axios"
export async function fetchEncryptedKey(): Promise<string> {
    try {
        const res = await axios.get("http://localhost:8000/api/getkey", { withCredentials: true });
        return res.data.encryptedKey;

    } catch (error) {
        console.error("Error fetching encrypted key:", error)
        throw new Error("Failed to fetch encrypted key")

    }

}