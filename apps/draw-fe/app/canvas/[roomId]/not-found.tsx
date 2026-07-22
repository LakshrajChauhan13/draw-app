import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CanvasNotFound(){
    return (
        <div className="h-screen max-w-7xl mx-auto flex flex-col gap-10 justify-center font-mono items-center bg-background text-foreground ">
            <div className="space-y-2 text-center flex flex-col justify-center items-center">
                <h1 className="text-6xl font-thin text-destructive text-shadow-sm "> 404 </h1>
                <h2 className="text-2xl font-semibold"> Canvas Room Not Found </h2>
                <h6 className="text-sm text-muted-foreground max-w-md tracking-tight"> 
                    The canvas room ID you are looking for either doesn't exist or may have been deleted or you don't have the access to it.
                </h6>
            </div>
            
            <Button size={'sm'} variant={'default'} className="" >
                <Link href={'/dashboard'} > Return to Dashboard </Link>
            </Button>
            
        </div>
    )
}

