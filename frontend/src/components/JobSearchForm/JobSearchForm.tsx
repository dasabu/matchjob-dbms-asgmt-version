import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'

import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem } from '../ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { MultiSelect } from '../ui/multi-select'
import { SKILL_LIST, LOCATION_LIST } from '../../utils/constants'
import { getJobsByLocationAndSkillsApi } from '../../apis/job.api'
import JobModal from '../JobModal'

const formSchema = z.object({
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
})

export default function JobSearchForm() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [jobs, setJobs] = useState([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills: [],
      location: undefined,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const skills = values.skills || []
    const location = values.location || ''

    console.log({ skills, location })

    try {
      const response = await getJobsByLocationAndSkillsApi(location, skills)
      if (response && response.data) {
        setJobs(response.data.data)
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching jobs: ', error)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3">
          <div className="flex flex-col md:flex-row items-stretch gap-4 mb-16">
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Controller
                      name="skills"
                      control={form.control}
                      render={({ field }) => (
                        <MultiSelect
                          options={SKILL_LIST}
                          onValueChange={field.onChange}
                          placeholder="Tìm theo kỹ năng..."
                          maxCount={3}
                          defaultValue={field.value}
                        />
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue
                          placeholder={
                            <div className="flex items-center text-slate-600">
                              Địa điểm...
                            </div>
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LOCATION_LIST.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button type="submit" className="px-5">
              Tìm việc
            </Button>
          </div>
        </form>
      </Form>
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
