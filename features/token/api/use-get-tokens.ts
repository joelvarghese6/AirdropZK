import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetTokens = () => {
    const query = useQuery({
        queryKey: ["tokens"],
        queryFn: async () => {
            const response = await client.api.tokens.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch accounts");
            }

            const { data } = await response.json();
            return data;
        }
    });

    return query;
}