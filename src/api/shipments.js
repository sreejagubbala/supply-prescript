import { API_BASE_URL } from './config'

export async function fetchShipments() {
  const response = await fetch(`${API_BASE_URL}/shipments`)
  if (!response.ok) {
    throw new Error('Failed to fetch shipments')
  }
  return response.json()
}

export async function fetchOperationsSummary() {
  const response = await fetch(`${API_BASE_URL}/operations/summary`)
  if (!response.ok) {
    throw new Error('Failed to fetch operations summary')
  }
  return response.json()
}