'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, FileText, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface ExportButtonProps {
  testId: string
  testName: string
  disabled?: boolean
}

export function ExportButton({ testId, testName, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (includeAppendix: boolean) => {
    setIsExporting(true)

    try {
      const url = `/api/tests/${testId}/export${!includeAppendix ? '?appendix=false' : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate PDF')
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `${testName.replace(/[^a-zA-Z0-9]/g, '_')}_report.pdf`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match && match[1]) {
          filename = match[1]
        }
      }

      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast.success('Report downloaded successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to export report')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
              <ChevronDown className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => handleExport(true)}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2" />
          <div className="flex flex-col">
            <span>Full Report</span>
            <span className="text-xs text-muted-foreground">
              Includes all persona responses
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport(false)}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2" />
          <div className="flex flex-col">
            <span>Executive Summary</span>
            <span className="text-xs text-muted-foreground">
              Key insights only
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
