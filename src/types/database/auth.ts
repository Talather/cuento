export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  auth: {
    Tables: {
      users: {
        Row: {
          id: string
          email?: string
        }
      }
    }
  }
}