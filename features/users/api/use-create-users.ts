import { InferRequestType, InferResponseType } from "hono"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { client } from "@/lib/hono"

type ResponseType = InferResponseType<typeof client.api.users.$post>;
type RequestType = InferRequestType<typeof client.api.users.$post>["json"];

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.users.$post({ json });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Private key updated");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: () => {
            toast.error("Failed to update private key")
        }
    })

    return mutation;
}

