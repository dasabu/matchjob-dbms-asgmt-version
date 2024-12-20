import { useEffect, useState } from 'react'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import { Badge } from '../../components/ui/badge'
import {
  CircleDollarSign,
  Clock,
  DollarSign,
  Gauge,
  MapPin,
  UsersRound,
} from 'lucide-react'
import dayjs from 'dayjs'
import { IJob } from '../../interfaces/schemas'
import { getJobByIdApi, getResumesCountByJobId } from '../../apis/job.api'
import { useLocation } from 'react-router'
import { formatSalary, getLocationLabel } from '../../utils/helpers'
import { useQuery } from '@tanstack/react-query'
import ResumeApplyModal from '../../components/ResumeApplyModal'
import parse from 'html-react-parser'

export default function JobDetailPage() {
  const [job, setJob] = useState<IJob | undefined>()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const id = params.get('id')

  const { data: jobResumes } = useQuery({
    queryKey: ['job-resumes', id],
    queryFn: ({ queryKey }) => {
      const id = queryKey[1]
      return getResumesCountByJobId(id!)
    },
  })

  const { data, isPending } = useQuery({
    queryKey: ['job', id],
    queryFn: ({ queryKey }) => {
      const id = queryKey[1]
      return getJobByIdApi(id!)
    },
  })

  useEffect(() => {
    if (data?.data?.data) {
      setJob(data?.data?.data)
    }
  }, [data?.data?.data])

  if (isPending) {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <div>
            <Skeleton className="h-56" />
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return <div className="container mx-auto p-4">No job details found.</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {job?.company?.logo ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 order-2 md:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{job.name}</CardTitle>
                {/* <h3 className="text-lg font-medium">{job.company.name}</h3> */}
                <div className="flex items-center mb-2 text-gray-600">
                  <MapPin className="mr-2 size-6" />
                  <span>{getLocationLabel(job.location)}</span>
                </div>
                <div className="flex items-center mb-2 text-[#85bb65]">
                  <CircleDollarSign className="mr-2 size-6" />
                  <span className="font-medium">
                    {formatSalary(job.salary)} đ
                  </span>
                </div>
                <Button
                  className="mt-4 font-normal text-lg bg-red-600 hover:bg-red-700"
                  onClick={() => setIsModalOpen(true)}
                >
                  Ứng tuyển ngay
                </Button>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="font-normal"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center mb-2 text-gray-600">
                  <Gauge className="mr-2" />
                  <span>
                    {job.level.charAt(0).toUpperCase() +
                      job.level.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center mb-2 text-gray-600">
                  <UsersRound className="mr-2" />
                  <p>
                    {job.quantity} (Đã apply:{' '}
                    <span className="font-normal">
                      {jobResumes?.data?.data?.totalResumes
                        ? jobResumes?.data?.data?.totalResumes
                        : 0}
                    </span>
                    )
                  </p>
                </div>

                <div className="flex items-center mb-4 text-gray-600">
                  <Clock className="mr-2" />
                  <span>{dayjs(job.updatedAt).fromNow()}</span>
                </div>
                <Separator className="my-4" />
                <div>{parse(job.description)}</div>
              </CardContent>
            </Card>
          </div>
          <div className="order-1 md:order-2">
            <Card>
              <CardContent className="flex flex-col items-center p-6">
                <img
                  src={`http://localhost:3333/company/${job.company.logo}`}
                  alt={job.company.name}
                  className="w-32 h-32 object-contain mb-4"
                />
                <h3 className="text-lg font-semibold">{job.company.name}</h3>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{job.name}</CardTitle>
            <Button>Apply Now</Button>
          </CardHeader>
          <CardContent>
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="flex items-center mb-2">
              <DollarSign className="mr-2" />
              <span>{formatSalary(job.salary)} đ</span>
            </div>
            <div className="flex items-center mb-2">
              <MapPin className="mr-2" />
              <span>{getLocationLabel(job.location)}</span>
            </div>
            <div className="flex items-center mb-4">
              <Clock className="mr-2" />
              <span>{dayjs(job.updatedAt).fromNow()}</span>
            </div>
            <Separator className="my-4" />
            <div>{parse(job.description)}</div>
          </CardContent>
        </Card>
      )}
      {job && (
        <ResumeApplyModal
          isOpenModal={isModalOpen}
          setIsOpenModal={setIsModalOpen}
          jobDetail={job}
        />
      )}
    </div>
  )
}
// import { useEffect, useState } from 'react'
// import { Skeleton } from '../../components/ui/skeleton'
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from '../../components/ui/card'
// import { Button } from '../../components/ui/button'
// import { Separator } from '../../components/ui/separator'
// import { Badge } from '../../components/ui/badge'
// import {
//   CircleDollarSign,
//   Clock,
//   DollarSign,
//   Gauge,
//   MapPin,
//   UsersRound,
// } from 'lucide-react'
// import dayjs from 'dayjs'
// import { IJob } from '../../interfaces/schemas'
// import { getJobByIdApi } from '../../apis/job.api'
// import { useLocation } from 'react-router'
// import { formatSalary, getLocationLabel } from '../../utils/helpers'
// import { useQuery } from '@tanstack/react-query'
// import ResumeApplyModal from '../../components/ResumeApplyModal'

// export default function JobDetailPage() {
//   const [job, setJob] = useState<IJob | undefined>()
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

//   const location = useLocation()
//   const params = new URLSearchParams(location.search)
//   const id = params.get('id')

//   const { data, isPending } = useQuery({
//     queryKey: ['job', id],
//     queryFn: ({ queryKey }) => {
//       const id = queryKey[1]
//       return getJobByIdApi(id!)
//     },
//   })

//   useEffect(() => {
//     if (data?.data?.data) {
//       setJob(data?.data?.data)
//     }
//   }, [data?.data?.data])

//   if (isPending) {
//     return (
//       <div className="container mx-auto p-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="md:col-span-2">
//             <Skeleton className="h-96" />
//           </div>
//           <div>
//             <Skeleton className="h-56" />
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (!job) {
//     return <div className="container mx-auto p-4">No job details found.</div>
//   }

//   return (
//     <div className="max-w-7xl mx-auto p-4">
//       {job?.company?.logo ? (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="md:col-span-2 order-2 md:order-1">
//             <Card>
//               <CardHeader>
//                 <CardTitle>{job.name}</CardTitle>
//                 <h3 className="text-lg font-medium">{job.company.name}</h3>
//                 <div className="flex items-center mb-2">
//                   <MapPin className="mr-2" />
//                   <span>{getLocationLabel(job.location)}</span>
//                 </div>
//                 <div className="flex items-center mb-2">
//                   <CircleDollarSign className="mr-2" />
//                   <span>{formatSalary(job.salary)} đ</span>
//                 </div>
//                 {/* I want to put more space here == */}
//                 <Button onClick={() => setIsModalOpen(true)} className="mt-4">
//                   Apply Now
//                 </Button>
//               </CardHeader>
// <CardContent>
//   <Separator className="my-4" />
//   <div className="flex flex-wrap gap-2 mb-4">
//     {job.skills.map((skill, index) => (
//       <Badge key={index} variant="secondary">
//         {skill}
//       </Badge>
//     ))}
//   </div>
//   <div className="flex items-center mb-2">
//     <Gauge className="mr-2" />
//     <span>
//       {job.level.charAt(0).toUpperCase() +
//         job.level.slice(1).toLowerCase()}
//     </span>
//   </div>
//   <div className="flex items-center mb-2">
//     <UsersRound className="mr-2" />
//     <span>{job.quantity}</span>
//   </div>

//   <div className="flex items-center mb-4">
//     <Clock className="mr-2" />
//     <span>{dayjs(job.updatedAt).fromNow()}</span>
//   </div>
//   <Separator className="my-4" />
//   <div dangerouslySetInnerHTML={{ __html: job.description }} />
// </CardContent>
//             </Card>
//           </div>
//           <div className="order-1 md:order-2">
//             <Card>
//               <CardContent className="flex flex-col items-center p-6">
//                 <img
//                   src={`http://localhost:8000/images/company/${job.company.logo}`}
//                   alt={job.company.name}
//                   className="w-32 h-32 object-contain mb-4"
//                 />
//                 <h3 className="text-lg font-semibold">{job.company.name}</h3>
//                 <div className="flex items-center mb-2">
//                   <MapPin className="mr-2" />
//                   <span>{}</span>
//                   {/* I want to add Company Address here */}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       ) : (
//         <Card>
//           <CardHeader>
//             <CardTitle>{job.name}</CardTitle>
//             <Button
//             // onClick={() => setIsModalOpen(true)} className="mt-4"
//             >
//               Apply Now
//             </Button>
//           </CardHeader>
//           <CardContent>
//             <Separator className="my-4" />
//             <div className="flex flex-wrap gap-2 mb-4">
//               {job.skills.map((skill, index) => (
//                 <Badge key={index} variant="secondary">
//                   {skill}
//                 </Badge>
//               ))}
//             </div>
//             <div className="flex items-center mb-2">
//               <DollarSign className="mr-2" />
//               <span>{formatSalary(job.salary)} đ</span>
//             </div>
//             <div className="flex items-center mb-2">
//               <MapPin className="mr-2" />
//               <span>{getLocationLabel(job.location)}</span>
//             </div>
//             <div className="flex items-center mb-4">
//               <Clock className="mr-2" />
//               <span>{dayjs(job.updatedAt).fromNow()}</span>
//             </div>
//             <Separator className="my-4" />
//             <div dangerouslySetInnerHTML={{ __html: job.description }} />
//           </CardContent>
//         </Card>
//       )}
//       {job && (
//         <ResumeApplyModal
//           isOpen={isModalOpen}
//           setIsOpen={setIsModalOpen}
//           jobDetail={job}
//         />
//       )}
//     </div>
//   )
// }
