import { cn } from "@/utils/cn"

interface ClassName {
  className? : string
}

export const CircleIcon = ({className}: ClassName) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" 
        width="15" height="15" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={cn(className)}>
        <circle cx="12" cy="12" r="10"/>
    </svg>
  )
}

export const LineIcon = ({className}: ClassName) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={cn(className)}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M16 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M7.5 16.5l9 -9" />
    </svg>
  )
}

export const RectIcon = ({className}: ClassName) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className={cn(className)} >
        <rect width="18" height="18" x="3" y="3" rx="2"/>
    </svg>
  )
}
