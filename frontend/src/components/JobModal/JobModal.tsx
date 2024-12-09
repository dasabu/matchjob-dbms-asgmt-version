import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import JobCard from '../JobCard'
import { IJob } from '../../interfaces/schemas'

interface IJobModalProps {
  jobs: IJob[]
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function JobModal({ open, onOpenChange, jobs }: IJobModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-2/3 max-w-none"
        style={{
          maxHeight: 'calc(3 * 200px + 2rem)', // Tối đa 3 hàng + khoảng cách
          overflowY: 'auto', // Cuộn khi vượt quá chiều cao
        }}
      >
        <DialogHeader>
          <DialogTitle>Công việc phù hợp</DialogTitle>
        </DialogHeader>
        <div
          className="grid gap-4 mt-4"
          style={{
            gridTemplateColumns: 'repeat(2, 1fr)', // Hai cột
            gridAutoRows: 'minmax(50px, auto)', // Chiều cao linh hoạt cho mỗi hàng
          }}
        >
          {jobs.map(({ _id, name, location, company, salary, updatedAt }) => (
            <JobCard
              key={_id}
              _id={_id!}
              location={location}
              name={name}
              logo={company?.logo!}
              salary={salary}
              updatedAt={updatedAt!}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
