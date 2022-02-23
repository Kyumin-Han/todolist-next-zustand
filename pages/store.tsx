import create from 'zustand'
import produce from 'immer'

export interface TodoItem {
  id: number
  title: string
  done: boolean
}

export interface State {
  items: TodoItem[]
  hideCompleted: boolean
  addItem(item: TodoItem): void
  toggleHideCompleted(): void
  toggleItem(item: TodoItem): void
  removeItem(item: TodoItem): void
  removeCompleted(): void
}

export const useStore = create<State>(set => ({
  items: [],
  hideCompleted: false,
  addItem: (item: TodoItem) =>
    // set(state => ({ items: [...state.items, item] })),
    set(
      produce((draft: State) => {
        draft.items.push(item)
      })
    ),
  removeItem: (item: TodoItem) =>
    set(state => ({
      items: state.items.filter(it => it.id !== item.id),
    })),
  toggleItem: (item: TodoItem) =>
    set(state => ({
      items: state.items.map(it => ({
        ...it,
        done: it.id === item.id ? !item.done : it.done,
      })),
    })),
  toggleHideCompleted: () =>
    set(state => ({ hideCompleted: !state.hideCompleted })),
  removeCompleted: () =>
    set(state => ({ items: state.items.filter(it => !it.done) })),
}))
