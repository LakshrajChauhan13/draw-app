import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccessMode } from "../component/RoomCanvas";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ErrorMessage } from "@/components/signup-form";
import { toggleAccessModeApi } from "@/api/room.api";


export function useToggleModeAccess(){
    const queryClient = useQueryClient()

    const toggleAccessModeMutation = useMutation({
      mutationFn: ({roomId, accessMode}: {roomId: string, accessMode: AccessMode}) => toggleAccessModeApi(roomId, accessMode),
      onMutate: () => {
        const toastId = toast.loading("Updating access mode...")
        return { toastId }
      },
      onSuccess: (data, variables, context) => {
        const message = data.message;
        console.log(message);
        toast.dismiss(context.toastId);
        toast.success(message);
        queryClient.invalidateQueries({ queryKey: ['getAllRooms&Data'] })

      },
      onError: (error: AxiosError<ErrorMessage>, variables, context) => {
        const message = error.response?.data.message;
        console.log(message);
        toast.dismiss(context!.toastId);
        toast.error(message);
        queryClient.invalidateQueries({ queryKey: ['getAllRooms&Data'] })
      } 
    })

    const handleToggleAccessModeMutation = (roomId: string, value: AccessMode) => {
      toggleAccessModeMutation.mutate({roomId: roomId, accessMode: value});
    }

    return  {
        handleToggleAccessModeMutation,
        toggleAccessModeMutation
    }
}