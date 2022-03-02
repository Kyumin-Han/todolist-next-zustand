import create from 'zustand'
import produce from 'immer'
import axios from 'axios'

export interface TodoItem {
  id: number
  content: string
  done: boolean
}

export interface State {
  items: TodoItem[]
  hideCompleted: boolean
  addItem(item: TodoItem): void
  updateItem(id: number, content: string): void
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
  updateItem: (id: number, content: string) =>
    set(
      produce((draft: State) => {
        draft.items = draft.items.map(
          produce((todoItem: TodoItem) => {
            if (todoItem.id === id) {
              todoItem.content = content
            }
          })
        )
      })
    ),
  removeItem: (item: TodoItem) =>
    // set(state => ({
    //   items: state.items.filter(it => it.id !== item.id),
    // })),
    set(
      produce((draft: State) => {
        draft.items = draft.items.filter(it => it.id !== item.id)
      })
    ),
  toggleItem: (item: TodoItem) =>
    // set(state => ({
    //   items: state.items.map(it => ({
    //     ...it,
    //     done: it.id === item.id ? !item.done : it.done,
    //   })),
    // })),
    set(
      produce((draft: State) => {
        draft.items = draft.items.map(
          produce((todoItem: TodoItem) => {
            if (todoItem.id === item.id) {
              todoItem.done = !todoItem.done
            }
          })
        )
      })
    ),
  toggleHideCompleted: () =>
    set(
      // state => ({ hideCompleted: !state.hideCompleted })
      produce((draft: State) => {
        draft.hideCompleted = !draft.hideCompleted
      })
    ),
  removeCompleted: () =>
    set(
      produce((draft: State) => {
        draft.items = draft.items.filter(it => !it.done)
      })
    ),
  // state => ({ items: state.items.filter(it => !it.done) })
}))
