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

const CardCanvas = ({slug, createdAt, id}: {slug: string, createdAt: string, id: string}) => {
    const isoStr = createdAt;
    const date = new Date(isoStr);
    const router = useRouter();
    
    const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',    // "July" (use 'short' for "Jul")
    day: 'numeric',   // "13"
    year: 'numeric',  // "2026"
    timeZone: 'UTC'   // Matches your exact string day
    });

    console.log(formattedDate);

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteRoomApi(id),
        onMutate: () => {
            const id = toast.loading('deleting...')
            return { id }
        },
        onSuccess: (data, variables, context) => {
            console.log(data);
            const message = data.message || 'Room deleted'
            toast.dismiss(context.id);
            toast.success(message);
            queryClient.invalidateQueries({ queryKey: ['getAllRooms&Data']})        
        },
        onError: (error: AxiosError<ErrorMessage>, variables, context) => {
            const message = error.response?.data.message || "Deletion failed"
            console.log(message)
            toast.dismiss(context?.id)
            toast.error(message)
            queryClient.invalidateQueries({ queryKey: ['getAllRooms&Data']})        
        }
    })

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

        <CardContent className="text-muted-foreground italic">
          system designs, approaching the systems with the first fundamentals.
          Diagrams of the systems.
        </CardContent>

        <CardFooter className="absolute w-full opacity-0 group-hover:opacity-100 transition-opacity duration-75 bottom-0 flex justify-start items-center gap-2">
          <Button onClick={() => {
            router.push(`/canvas/${id}`)
          }} size={"sm"} variant={"secondary"} className={'cursor-pointer'}>
            Open
          </Button>
          <Button size={"sm"} variant={"secondary"} className={'cursor-pointer'}>
            Share
            <ShareIcon />
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default CardCanvas;
