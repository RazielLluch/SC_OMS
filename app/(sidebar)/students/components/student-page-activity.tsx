"use client"

import * as React from "react"

type StudentPageActivity = {
  setTransactionActive: (active: boolean) => void
}

export const StudentPageActivityContext = React.createContext<StudentPageActivity | null>(null)

export function useStudentPageActivity() {
  const context = React.useContext(StudentPageActivityContext)
  if (!context) {
    throw new Error("useStudentPageActivity must be used within StudentsTable")
  }
  return context
}
