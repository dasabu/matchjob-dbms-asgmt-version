import {
  IBackendResponse,
  ICompany,
  IJob,
  IPagination,
} from '../interfaces/schemas'
import axiosInstance from '../lib/axios'

export const getJobsByCompany = (id: string) => {
  return axiosInstance.get<IBackendResponse<IJob[]>>(
    `/api/v1/companies/${id}/jobs`
  )
}

export const getCompaniesJobStatsApi = (query: string) => {
  return axiosInstance.get<IBackendResponse<IPagination<ICompany>>>(
    `api/v1/companies/job-stats?${query}`
  )
}

export const getCompaniesApi = (query: string) => {
  return axiosInstance.get<IBackendResponse<IPagination<ICompany>>>(
    `/api/v1/companies?${query}`
  )
}

export const getCompanyByIdApi = (id: string) => {
  return axiosInstance.get<IBackendResponse<ICompany>>(
    `/api/v1/companies/${id}`
  )
}

export const createCompanyApi = (
  name: string,
  address: string,
  description: string,
  logo: string
) => {
  return axiosInstance.post<IBackendResponse<ICompany>>('/api/v1/companies', {
    name,
    address,
    description,
    logo,
  })
}

export const updateCompanyApi = (
  id: string,
  name: string,
  address: string,
  description: string,
  logo: string
) => {
  return axiosInstance.patch<IBackendResponse<ICompany>>(
    `/api/v1/companies/${id}`,
    {
      name,
      address,
      description,
      logo,
    }
  )
}

export const deleteCompanyApi = (id: string) => {
  return axiosInstance.delete<IBackendResponse<ICompany>>(
    `/api/v1/companies/${id}`
  )
}
