import { InferRequestType, InferResponseType } from "hono"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { client } from "@/lib/hono"

type ResponseType = InferResponseType<typeof client.api.tokens.$post>;
type RequestType = InferRequestType<typeof client.api.tokens.$post>["json"];

export const useCreateToken = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.tokens.$post({ json });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Token Created");
            queryClient.invalidateQueries({ queryKey: ["tokens"] });
        },
        onError: () => {
            toast.error("Failed to create account")
        }
    })

    return mutation;
}

