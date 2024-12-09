import {
  IBackendResponse,
  IPagination,
  IJob,
  ISkill,
} from '../interfaces/schemas'
import axiosInstance from '../lib/axios'

export const getResumesCountByJobId = (id: string) => {
  return axiosInstance.get<
    IBackendResponse<{ _id: string; totalResumes: number }>
  >(`/api/v1/jobs/${id}/resumes-count`)
}

export const getSkillsStatistic = () => {
  return axiosInstance.get<IBackendResponse<ISkill[]>>(
    `/api/v1/jobs/skills-stats`
  )
}

export const getJobsApi = (query: string) => {
  return axiosInstance.get<IBackendResponse<IPagination<IJob>>>(
    `/api/v1/jobs?${query}`
  )
}

export const getJobsByLocationAndSkillsApi = (
  location: string,
  skills: string[]
) => {
  const encodedSkills = skills
    .map((skill) => encodeURIComponent(skill))
    .join(',')

  const result = axiosInstance.get<IBackendResponse<IJob[]>>(
    `/api/v1/jobs/search?location=${encodeURIComponent(
      location
    )}&skills=${encodedSkills}`
  )
  return result
}

export const getJobByIdApi = (id: string) => {
  return axiosInstance.get<IBackendResponse<IJob>>(`/api/v1/jobs/${id}`)
}

export const createJobApi = (job: IJob) => {
  return axiosInstance.post<IBackendResponse<IJob>>('/api/v1/jobs', { ...job })
}

export const updateJobApi = (job: IJob, id: string) => {
  return axiosInstance.patch<IBackendResponse<IJob>>(`/api/v1/jobs/${id}`, {
    ...job,
  })
}

export const deleteJobApi = (id: string) => {
  return axiosInstance.delete<IBackendResponse<IJob>>(`/api/v1/jobs/${id}`)
}
