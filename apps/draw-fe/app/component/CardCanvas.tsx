import { deleteRoomApi } from "@/api/room.api";
import { ErrorMessage } from "@/components/signup-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ShareIcon } from "lucide-react";
import { toast } from "sonner";
import { AlertDialogDelete } from "./AlertDialogDelete";
import { useRouter } from "next/navigation";
import { RoomDataInterface } from "../dashboard/page";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToggleModeAccess } from "../hooks/useToggleAccessModeMutation";


const CardCanvas = ({slug, createdAt, id, accessMode}: RoomDataInterface) => {
    const isoStr = createdAt;
    const date = new Date(isoStr);
    const router = useRouter();
    
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',    
      day: 'numeric',   
      year: 'numeric',  
      timeZone: 'UTC'   
    });

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteRoomApi(id),
        onMutate: () => {
            const toastId = toast.loading('deleting...')
            return { toastId }
        },
        onSuccess: (data, variables, context) => {
            console.log(data);
            const message = data.message || 'Room deleted'
            toast.dismiss(context.toastId);
            toast.success(message);
            queryClient.invalidateQueries({ queryKey: ['getAllRooms&Data']})        
        },
        onError: (error: AxiosError<ErrorMessage>, variables, context) => {
            const message = error.response?.data.message || "Deletion failed"
            console.log(message)
            toast.dismiss(context?.toastId)
            toast.error(message)
            queryClient.invalidateQueries({ queryKey: ['getAllRooms&Data']})        
        }
    })

    const { handleToggleAccessModeMutation, toggleAccessModeMutation } = useToggleModeAccess()

  return (
    <>
      <Card className="h-50 hover:bg-accent group relative hover:-translate-y-2 transition-transform duration-150 cursor-pointer">
        <CardHeader>
          <CardTitle className=" leading-[1.428571] flex justify-between items-center">
            <h1> { slug } </h1>
            <AlertDialogDelete onClick={() => deleteMutation.mutate(id)} />
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Created { formattedDate }
          </CardDescription>
        </CardHeader>

        <CardContent className="text-muted-foreground italic ">
          system designs, approaching the systems with the first fundamentals.
          Diagrams of the systems.
        </CardContent>

        <CardFooter className="opacity-100 group-hover:opacity-0 absolute bottom-0 w-full flex justify-end items-center border-none bg-transparent">
          <Badge className="  font-light p-3.5 flex justify-center items-center " variant={'secondary'}>
            { toggleAccessModeMutation.isPending ? <div className=" h-10 min-w-20 ">
                <Skeleton className="w-full h-full" /> 
            </div>: accessMode }
          </Badge>
        </CardFooter>
        
        <CardFooter className="absolute w-full opacity-0 group-hover:opacity-100 transition-opacity duration-75 bottom-0 flex justify-between items-center gap-2">
          <div className="flex justify-start items-center w-full">
            <Button onClick={() => {
              router.push(`/canvas/${id}`)
            }} size={"sm"} variant={"secondary"} className={'cursor-pointer'}>
              Open
            </Button>
            <Button size={"sm"} variant={"secondary"} className={'cursor-pointer'}>
              Share
              <ShareIcon />
            </Button>
          </div>

          <Select value={accessMode} onValueChange={(value) => {
            if(value){
              handleToggleAccessModeMutation(id, value)
            }}} 
          >
            <SelectTrigger className={"w-full max-w-48"}>
              <SelectValue />
            </SelectTrigger>            
            <SelectContent>
              <SelectGroup>
                <SelectLabel> Private Mode </SelectLabel>
                <SelectItem key={1} value={"PRIVATE"}> Private </SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel> Public Access </SelectLabel>
                <SelectItem key={2} value={"PUBLIC_EDIT"}> Public Edit </SelectItem>
                <SelectItem key={3} value={"PUBLIC_VIEW"}> Public View </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
        </CardFooter>
      </Card>
    </>
  );
};

export default CardCanvas;
