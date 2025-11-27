import apiClient from "../apiClient";

/**
 * Fetches full expressions based on the language provided.
 * Attempts to retrieve data from the API client and returns mock data if the API call fails.
 * @param language The language for which to fetch expressions.
 * @returns A promise resolving to an array of expressions or null if no data is available.
 */
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