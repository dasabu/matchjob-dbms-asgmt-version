import { create } from 'zustand'

import { IAccount } from '../interfaces/schemas'
import {
  getAccountApi,
  signInApi,
  signOutApi,
  signUpApi,
} from '../apis/auth.api'
import { toast } from '../hooks/use-toast'

interface IAuthState {
  user: IAccount | undefined
  isAuthenticated: boolean

  // Actions
  authCheck: () => void
  signUp: (
    name: string,
    email: string,
    password: string,
    age: number,
    gender: string,
    address: string
  ) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<IAuthState>((set) => ({
  user: undefined,
  isAuthenticated: false,

  // Actions
  authCheck: async () => {
    const access_token = localStorage.getItem('access_token')
    if (access_token) {
      const response = await getAccountApi()
      if (response?.data?.data) {
        set({
          user: { ...response.data.data, access_token },
          isAuthenticated: true,
        })
      }
    } else {
      set({
        user: undefined,
        isAuthenticated: false,
      })
    }
  },

  signUp: async (
    name: string,
    email: string,
    password: string,
    age: number,
    gender: string,
    address: string
  ): Promise<boolean> => {
    try {
      const response = await signUpApi(
        name,
        email,
        password,
        age,
        gender,
        address
      )
      if (response && response.data) {
        toast({
          title: 'Đăng ký thành công',
          description: 'Bạn sẽ được chuyển đến trang đăng nhập',
        })
        return true
      } else {
        toast({
          title: 'Đăng ký thất bại',
          variant: 'destructive',
          // description: response.data.message,
        })
        return false
      }
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Có lỗi xảy ra trong quá trình đăng ký',
        variant: 'destructive',
        description: error.response?.data?.message,
      })
      return false
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const response = await signInApi(email, password)
      if (response && response.data) {
        set({
          user: response.data.data,
          isAuthenticated: true,
        })
        // save access token in local storage
        localStorage.setItem('access_token', response.data.data?.access_token!)
        toast({ title: 'Đăng nhập thành công' })
      } else {
        toast({
          title: 'Đăng nhập thất bại',
          variant: 'destructive',
          // description: response.data.message,
        })
      }
    } catch (error: any) {
      console.error(error)
      set({
        user: undefined,
        isAuthenticated: false,
      })
      toast({
        title: 'Có lỗi xảy ra trong quá trình đăng nhập',
        variant: 'destructive',
        description: error.response?.data?.message,
      })
    }
  },

  signOut: async () => {
    try {
      await signOutApi()
      localStorage.removeItem('access_token')
      set({
        user: undefined,
        isAuthenticated: false,
      })
      toast({ title: 'Đăng xuất thành công' })
    } catch (error: any) {
      console.log(error)
      toast({
        title: 'Đăng xuất thất bại',
        variant: 'destructive',
        description:
          error.response?.data?.message ||
          'Có lỗi xảy ra trong quá trình đăng xuất!',
      })
    }
  },
}))
