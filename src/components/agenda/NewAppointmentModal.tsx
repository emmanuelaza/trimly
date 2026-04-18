"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Modal } from "@/components/ui/Modal"

export function NewAppointmentModal() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const isOpen = searchParams.get("new") === "1"

  const handleClose = () => {
    // Remove ?new=1 from URL without refreshing
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete("new")
    const newUrl = `${pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`
    router.replace(newUrl, { scroll: false })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva Cita">
      {/* 3 Step Wizard goes here */}
      <div className="flex flex-col space-y-4">
        <p className="text-sm text-text-secondary">
          WIP: Sistema rápida &lt;30s para agendar citas.
        </p>
      </div>
    </Modal>
  )
}
