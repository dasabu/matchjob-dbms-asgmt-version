import { IBackendResponse, IPagination, IUser } from '../interfaces/schemas'
import axiosInstance from '../lib/axios'

export const getUsersApi = (query: string) => {
  return axiosInstance.get<IBackendResponse<IPagination<IUser>>>(
    `/api/v1/users?${query}`
  )
}

export const getUserByIdApi = (id: string) => {
  return axiosInstance.get<IBackendResponse<IUser>>(`/api/v1/users/${id}`)
}

export const createUserApi = (user: IUser) => {
  return axiosInstance.post<IBackendResponse<IUser>>('/api/v1/users', {
    ...user,
  })
}

export const updateUserApi = (user: IUser) => {
  return axiosInstance.patch<IBackendResponse<IUser>>(`/api/v1/users`, {
    ...user,
  })
}

export const deleteUserApi = (id: string) => {
  return axiosInstance.delete<IBackendResponse<IUser>>(`/api/v1/users/${id}`)
}
