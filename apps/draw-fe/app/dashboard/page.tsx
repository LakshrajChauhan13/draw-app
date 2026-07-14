"use client";

import BrandName from '../component/BrandName'
import { Button } from '@/components/ui/button'
import { PlusIcon, ShareIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/utils/cn'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { DeleteIcon } from '@/icons/icons'
import { useQuery } from '@tanstack/react-query'
import { getAllRoomsApi } from '@/api/room.api'
import { useEffect, useState } from 'react';
import NewCanvasCard from '../component/NewCanvasCard';
import CardCanvas from '../component/CardCanvas';

interface RoomDataInterface{
  id: string,
  slug: string,
  createdAt: string
}

const DashBoard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['getAllRooms&Data'],
    queryFn: getAllRoomsApi
  })
  console.log(data)
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex text-3xl tracking-tighter items-center justify-center bg-background text-muted-foreground font-mono">
        Loading workspaces...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive font-mono">
        Failed to load canvases. Please try again.
      </div>
    );
  }

  const roomsList: RoomDataInterface[] = data.rooms || [];
  const username = data.user.username || 'Guest';
  
  return (
    <>
    { isLoading ? 
      <div>
        Loading..
      </div> : 
    
    
    <div className='min-h-screen flex flex-col selection:bg-muted'>
      <nav className='h-15 w-full bg-background text-accent border-b-2 border-dashed '>
        <div className='max-w-7xl h-full flex justify-between items-center  mx-auto'>
          <BrandName className='text-accent font-bold text-2xl font-mono' />

          <div className='flex justify-center items-center gap-2'>
            <span className='px-4 py-1.5 bg-muted-foreground/50 rounded-lg text-foreground'>
              { username }
            </span>
            <Button className='px-4 py-1.5 ' variant={'destructive'}  >
              Sign Out
            </Button>
          </div>
        </div>        
      </nav>
      
      <div className=' flex flex-col gap-5 px-20 py-10  w-screen flex-1 max-w-7xl mx-auto border-x-2 border-dashed'>

        <div className=' flex flex-col justify-start gap-'>
          <h1 className='text-2xl font-semibold tracking-tighter '>
            Your Canvases
          </h1>
          <h2 className='text-sm text-muted-foreground'>
            Open a canvas to start drawing or invite others to collaborate.
          </h2>
        </div>

        <div className='w-full border-dashed border' />

        <div className='grid grid-cols-3 gap-2'>
        
        <NewCanvasCard />

        { 
          roomsList && roomsList.map((roomData) => <CardCanvas key={roomData.id} slug={roomData.slug} createdAt={roomData.createdAt} /> )  
        }

        {/* <Card className='h-50 hover:bg-accent group relative'>
          <CardHeader>
            <CardTitle className=' leading-[1.428571] flex justify-between items-center'>
              <h1>
                Room Name
              </h1>
              <Button variant={'secondary'} className={'  hover:text-red-500 text-red-500/50 hover:bg-accent'}  >
                <DeleteIcon />
              </Button>
            </CardTitle>
            <CardDescription className='text-muted-foreground text-xs'>
              Created 20 June 2026
            </CardDescription>
          </CardHeader>

          <CardContent className='text-muted-foreground italic'>
            system designs, approaching the systems with the first fundamentals.
            Diagrams of the systems.
          </CardContent>

          <CardFooter className='absolute w-full opacity-0 group-hover:opacity-100 transition-opacity duration-75 bottom-0 flex justify-start items-center gap-2'>
            <Button 
              size={'sm'}
              variant={'secondary'}
            >
              Open
            </Button>
            <Button 
              size={'sm'}
              variant={'secondary'}
            >
              Share
              <ShareIcon /> 
            </Button>
          </CardFooter>
        </Card> */}
        
        
        </div>
        
      </div>

    </div>
  }
    </>
  )
}

export default DashBoard