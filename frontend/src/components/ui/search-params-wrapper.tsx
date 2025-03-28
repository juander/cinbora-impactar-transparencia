"use client"

import { useSearchParams } from 'next/navigation'
import React from 'react'

interface SearchParamsWrapperProps {
  children: (searchParams: URLSearchParams) => React.ReactNode
}

export function SearchParamsWrapper({ children }: SearchParamsWrapperProps) {
  const searchParams = useSearchParams()
  return <>{children(searchParams)}</>
}