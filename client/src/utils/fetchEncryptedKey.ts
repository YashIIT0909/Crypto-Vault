import axios from "axios"
export async function fetchEncryptedKey(address: string, vaultId: string): Promise<string> {
    try {
        const res = await axios.get(`${process.env.VITE_API_URL}/api/getkey/${address}/${vaultId}`, { withCredentials: true });
        return res.data.encryptedKey;

    } catch (error) {
        console.error("Error fetching encrypted key:", error)
        throw new Error("Failed to fetch encrypted key")

    }

}