import { getResumeByUserApi } from '../../apis/resume.api'
import { useQuery } from '@tanstack/react-query'
import { ICompany, IJob, IResume } from '../../interfaces/schemas'
import { ColumnDef } from '@tanstack/react-table'
import { shortenObjectId } from '../../utils/helpers'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { DataTable } from '../ui/data-table'
import dayjs from 'dayjs'
import { Badge } from '../ui/badge'
import { getCompaniesApi } from '../../apis/company.api'
import { getJobsApi } from '../../apis/job.api'

interface IUserResumeModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function UserResumeModal({
  open,
  onOpenChange,
}: IUserResumeModalProps) {
  // Fetch data using react-query
  const { data: userResumesData } = useQuery({
    queryKey: ['user-resumes'],
    queryFn: () => getResumeByUserApi(),
  })

  const { data: companiesData } = useQuery({
    queryKey: ['companies'],
    queryFn: () => getCompaniesApi(''),
  })

  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => getJobsApi(''),
  })

  // Combine data to map company names and job titles
  const resumes =
    userResumesData?.data?.data?.map((resume: IResume) => {
      const company = companiesData?.data?.data?.result?.find(
        (comp) => comp._id === resume.companyId
      )
      const job = jobsData?.data?.data?.result?.find(
        (job) => job._id === resume.jobId
      )
      return {
        ...resume,
        companyId: company?.name,
        jobId: job?.name,
      }
    }) || []

  // Define table columns
  const columns: ColumnDef<IResume>[] = [
    {
      id: '_id',
      accessorKey: '_id',
      header: 'ID',
      cell: ({ row }) => shortenObjectId(row.original._id),
    },
    {
      id: 'companyId',
      accessorKey: 'companyId',
      header: 'Công ty',
    },
    {
      id: 'jobId',
      accessorKey: 'jobId',
      header: 'Công việc',
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <Badge className="font-light">{row.original.status}</Badge>
      ),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) =>
        dayjs(row.original.createdAt).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <a
          href={`http://localhost:3333/resume/${row.original.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Chi tiết
        </a>
      ),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Danh sách CV</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <DataTable data={resumes} columns={columns} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
