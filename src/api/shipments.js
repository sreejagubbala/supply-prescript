import { API_BASE_URL } from './config'

export async function fetchShipments() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1500) // give up after 1.5s

  const response = await fetch(`${API_BASE_URL}/shipments`, {
    signal: controller.signal,
  })
  clearTimeout(timeout)

  if (!response.ok) {
    throw new Error('Failed to fetch shipments')
  }
  return response.json()
}

export async function fetchOperationsSummary() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1500)

  const response = await fetch(`${API_BASE_URL}/operations/summary`, {
    signal: controller.signal,
  })
  clearTimeout(timeout)

  if (!response.ok) {
    throw new Error('Failed to fetch operations summary')
  }
  return response.json()
}