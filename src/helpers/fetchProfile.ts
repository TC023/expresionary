import apiClient from "../apiClient";
import { useUser } from "../contexts/UserContext";

export const fetchProfile = async () => {

    const { setUser } = useUser()
    
    const token = localStorage.getItem("token");
    // console.log('token', token);

    try {
        const res = await apiClient.get("/profile", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // console.log(res);
        // console.log(res.data);

        if (res.data) {
            setUser(res.data)
        }

    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        } else {
            console.error('An unknown error occurred:', err);
        }
    }
};
