"use client";

import BrandName from '../component/BrandName'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { getAllRoomsApi } from '@/api/room.api'
import NewCanvasCard from '../component/NewCanvasCard';
import CardCanvas from '../component/CardCanvas';
import JoinCanvasCard from '../component/JoinCanvasCard';

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
      
      <div className='flex flex-col gap-5 px-20 py-10  w-screen flex-1 max-w-7xl mx-auto border-x-2 border-dashed'>

        <div className=' flex flex-col justify-start gap-'>
          <h1 className='text-2xl font-semibold tracking-tighter '>
            Your Canvases
          </h1>
          <h2 className='text-sm text-muted-foreground'>
            Open a canvas to start drawing or invite others to collaborate.
          </h2>
        </div>

        <div className='w-full border-dashed border' />

        <div className='w-full h-50 grid grid-cols-2 gap-2'>
          <NewCanvasCard />
          <JoinCanvasCard />
        </div>
        <div className='grid grid-cols-3 gap-2 mt-5'>
        
        { 
          roomsList && roomsList.map((roomData) => <CardCanvas key={roomData.id} id={roomData.id} slug={roomData.slug} createdAt={roomData.createdAt} /> )  
        }

        </div>
        
      </div>

    </div>
    </>
  )
}

export default DashBoard