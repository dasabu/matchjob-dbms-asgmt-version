import { useLocation } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import parse from 'html-react-parser'
import { getCompanyByIdApi, getJobsByCompany } from '../../apis/company.api'
import { useQuery } from '@tanstack/react-query'
import { ICompany, IJob } from '../../interfaces/schemas'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import JobModal from '../../components/JobModal'

export default function CompanyDetailPage() {
  const [company, setCompany] = useState<ICompany | undefined>()
  const [jobs, setJobs] = useState<IJob[]>([])
  const [openModal, setOpenModal] = useState<boolean>(false)

  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const id = params.get('id')

  const companyDetail = useQuery({
    queryKey: ['company', id],
    queryFn: ({ queryKey }) => {
      const id = queryKey[1]
      return getCompanyByIdApi(id!)
    },
  })

  const companyJobs = useQuery({
    queryKey: ['company-jobs', id],
    queryFn: ({ queryKey }) => {
      const id = queryKey[1]
      return getJobsByCompany(id!)
    },
  })

  useEffect(() => {
    if (companyDetail?.data?.data?.data) {
      setCompany(companyDetail?.data?.data?.data)
    }
  }, [companyDetail?.data?.data?.data])

  useEffect(() => {
    if (companyJobs.data?.data.data) {
      setJobs(companyJobs.data?.data.data)
    }
  }, [companyJobs.data?.data.data])

  if (companyDetail?.isPending || companyJobs?.isPending) {
    return (
      <div className="max-w-7xl mx-auto p-4 h-screen w-full">
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

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto p-4">No company details found.</div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 order-2 md:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{company.name}</CardTitle>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{company.address}</span>
              </div>
              <div>
                <Button
                  variant="link"
                  className="p-0 italic text-blue-500"
                  onClick={() => setOpenModal(true)}
                >
                  Click to see opening jobs
                </Button>
              </div>
            </CardHeader>
            <CardContent>{parse(company.description || '')}</CardContent>
          </Card>
        </div>
        <div className="order-1 md:order-2">
          <Card>
            <CardContent className="flex flex-col items-center p-6">
              <img
                alt={`${company.name} logo`}
                src={`http://localhost:3333/company/${company.logo}`}
                className="w-32 h-32 object-contain mb-4"
              />
              <h3 className="text-lg font-semibold">{company.name}</h3>
            </CardContent>
          </Card>
        </div>
      </div>
      <JobModal jobs={jobs} open={openModal} onOpenChange={setOpenModal} />
    </div>
  )
}
