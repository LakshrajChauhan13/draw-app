import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteIcon } from "@/icons/icons";
import { ShareIcon } from "lucide-react";
import React from "react";

const CardCanvas = ({slug, createdAt}: {slug: string, createdAt: string}) => {
    const isoStr = "2026-07-13T21:27:32.623Z";
    const date = new Date(isoStr);

    const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',    // "July" (use 'short' for "Jul")
    day: 'numeric',   // "13"
    year: 'numeric',  // "2026"
    timeZone: 'UTC'   // Matches your exact string day
    });

    console.log(formattedDate);
  return (
    <>
      <Card className="h-50 hover:bg-accent group relative">
        <CardHeader>
          <CardTitle className=" leading-[1.428571] flex justify-between items-center">
            <h1> { slug } </h1>
            <Button
              variant={"secondary"}
              className={"  hover:text-red-500 text-red-500/50 hover:bg-accent"}
            >
              <DeleteIcon />
            </Button>
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
          <Button size={"sm"} variant={"secondary"}>
            Open
          </Button>
          <Button size={"sm"} variant={"secondary"}>
            Share
            <ShareIcon />
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default CardCanvas;
