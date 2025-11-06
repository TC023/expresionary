import apiClient from "../apiClient";

export const fetchExpressionsFull: (language: string) => Promise<any> = async (language: string) => {
    try {
        // Intenta obtener datos reales; si falla, usa el mock
        const resp = await apiClient.get('/expressions', {
            params: { language },
        });
        if (resp?.data.rows && resp.data.rows.length > 0) {
            return resp.data.rows
        }
    } catch (e) {
        // Ignorar: usaremos datos mock
        return null; // Ensure no undefined is returned
    }
    return null;
};