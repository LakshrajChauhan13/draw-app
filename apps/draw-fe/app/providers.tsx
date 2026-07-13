"use client";

import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { useState } from 'react'

const Provider = ({children}: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000*60*5,
                refetchOnWindowFocus: true,
            }
        }
    }))
    
  return (
    <QueryClientProvider client={queryClient}>
        { children }
        <Toaster />
    </QueryClientProvider>
  )
}

export default Provider