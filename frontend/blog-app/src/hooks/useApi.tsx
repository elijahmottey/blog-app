import { useCallback, useState, useEffect } from "react";
import type { ApiError } from "../service/BackendApi.ts";

type ApiFunction<T> = () => Promise<T>;

export function useApi<T>(apiFn: ApiFunction<T>, immediate = false) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<ApiError | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFn();
            setData(response);
            return response;
        } catch (err) {
            setError(err as ApiError);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFn]);

    // Optional auto-run
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate]);

    return {
        data,
        error,
        loading,
        execute,
        setData,
    };
}
