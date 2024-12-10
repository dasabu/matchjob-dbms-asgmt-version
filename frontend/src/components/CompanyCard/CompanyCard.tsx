import { useNavigate } from 'react-router'
import { formatSalary, generateSlug } from '../../utils/helpers'
import { Card, CardContent } from '../ui/card'
import { Separator } from '../ui/separator'
import { ChevronsRight, Wallet } from 'lucide-react'
import { Button } from '../ui/button'
import { getJobsByCompany } from '../../apis/company.api'
import { useState } from 'react'
import JobModal from '../JobModal'

interface ICompanyCardProps {
  _id: string
  name: string
  logo: string
  totalJobs?: number
  maxSalary?: number
}

export default function CompanyCard({
  _id,
  name,
  logo,
  totalJobs,
  maxSalary,
}: ICompanyCardProps) {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleNavigateToCompanyDetail = () => {
    if (_id && name) {
      const slug = generateSlug(name)
      navigate(`/companies/${slug}?id=${_id}`)
    }
  }

  const handleGetJobs = async () => {
    if (_id) {
      const response = await getJobsByCompany(_id)

      setJobs(response.data.data)
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <Card
        className="hover:shadow-lg transition-shadow"
        onClick={handleNavigateToCompanyDetail}
      >
        <CardContent className="p-4 h-[400px] flex flex-col items-center justify-center">
          <img
            src={`http://localhost:3333/company/${logo}`}
            alt={`${name} logo`}
            className="size-[200px] object-contain mb-4"
          />
          <Separator className="my-4" />
          <h3 className="text-lg text-center font-medium">{name}</h3>
          {maxSalary && totalJobs && (
            <div className="w-full mt-4 flex flex-col text-sm">
              <div className="flex flex-row justify-center items-center">
                <Button
                  variant="link"
                  className="p-0 italic text-blue-500 hover:cursor-pointer font-thin gap-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleGetJobs()
                  }}
                >
                  <ChevronsRight className="size-4" />
                  {totalJobs} jobs
                </Button>
              </div>
              <div className="mt-1 flex flex-row gap-1 justify-center items-center text-[#85bb65] font-thin">
                <Wallet className="size-4" />
                Up to
                <span className="font-medium">{formatSalary(maxSalary)}</span>$
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {isModalOpen && (
        <JobModal
          jobs={jobs}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  )
}
