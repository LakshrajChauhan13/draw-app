"use client"

import BrandName from "@/app/component/BrandName"
import { SignupForm } from "@/components/signup-form"
import { FeatherIcon, FerrisWheel, FerrisWheelIcon, GalleryVerticalEndIcon, GavelIcon, PencilIcon, SheetIcon, Table2Icon } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FeatherIcon className="size-4" />
          </div>
          <BrandName />
        </a>
        <SignupForm />
      </div>
    </div>
  )
}



// const page = () => {
//   return (
//     <div className='flex justify-center items-center h-screen w-screen'>
//       <form className='w-150 h-150 border space-y-7 border-white p-4 rounded-4xl'>
//         <LabeledInput type='text' label='Username' placeholder='John Doe' />
//         <LabeledInput type='email' label='Email' placeholder='Johndoe@gmail.com' />
//         <LabeledInput type='password' label='password' placeholder='Enter your username' />
//       </form>
//     </div>
//   )
// }

// export default page


// const LabeledInput = ({label, placeholder, type }:{label: string, placeholder: string, type: string}) => {
//   return (
//     <div className=' flex flex-col gap-1'>
//       <label className='text-3xl' htmlFor="username"> {label} </label>
//       <input 
//         placeholder={placeholder} 
//         className=' w-full px-2 py-3 border-white border text-lg ' 
//         name='username'
//         type={type}
//       />
//     </div>
//   )
// }