import React from 'react'
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useAsyncModalState } from "./useAsyncModalState"
import { AsyncModalProps } from "./AsyncModalProps"

describe('useAsyncModalState', () => {

  it('initially, modal state is not open', () => {
    const { result } = renderHook(() => useAsyncModalState())
    const [state] = result.current

    expect(state.isOpen).toBe(false)
  })

  it('changes modal state to open when calling showModal', async () => {
    const { result } = renderHook(() => useAsyncModalState())
    const [, showModal] = result.current

    act(() => {
      showModal()
    })

    const [updatedState] = result.current
    expect(updatedState.isOpen).toBe(true)
  })

  it('resolves when component triggers resolve', async () => {
    const { result } = renderHook(() => useAsyncModalState<string, 'ok' | 'cancel'>())

    // Trigger showModal to open modal
    let promise: Promise<'ok' | 'cancel'> | null = null;
    act(() => {
      const [, showModal] = result.current
      promise = showModal('world')
    })

    // Render modal component
    act(() => {
      const [state] = result.current
      expect(state.props).not.toBeNull()
      expect(state.isOpen).toBe(true)

      if (!state.props)
        return

      render(<GreeterDialog {...state.props} />)
    })

    // Simulate click on OK button and wait for promise
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /OK/i}))

      // Verify result matches the clicked value
      const result = await promise
      expect(result).toBe('ok')
    })

    const [updatedState] = result.current
    expect(updatedState.isOpen).toBe(false)
    expect(updatedState.props).toBeNull()
  })
})

function GreeterDialog({ value, resolve }: AsyncModalProps<string, 'ok' | 'cancel'>) {
  return (
    <div>
      <p>Hello, {value}!</p>
      <button onClick={() => resolve('ok')}>OK</button>
      <button onClick={() => resolve('cancel')}>Cancel</button>
    </div>
  )
}