import type { NextPage } from 'next'

import { FormEvent, useCallback, useState } from 'react'
import { TodoItem, useStore, State } from './store'
import { useForm } from 'react-hook-form'
import produce from 'immer'
import axios from 'axios'
import useSWR, { KeyedMutator, mutate, useSWRConfig } from 'swr'

const client = axios.create({
  baseURL: 'http://localhost:4444',
  withCredentials: true,
})

const fetcher = (url: string) =>
  client.request({ url }).then(res => res.data.payload)

// client
//   .get('/todos')
//   .then(res => {
//     console.log(res.data.payload)
//   })
//   .catch(error => {
//     console.log(error)
//   })

const Home: NextPage = () => {
  return (
    <div className="App">
      <div className="navbar bg-white">
        <a className="btn btn-ghost normal-case text-xl text-black">TODOLIST</a>
      </div>
      <TodoList />
    </div>
  )
}

function TodoList() {
  const [newText, setNewText] = useState('')
  const { handleSubmit, register } = useForm()
  // const { mutate } = useSWR<TodoItem[]>('/todos', fetcher, {
  //   refreshInterval: 1000,
  // })
  const {
    hideCompleted,
    toggleHideCompleted,
    addItem,
    removeCompleted,
    items,
  } = useStore()

  function addTodoItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    addItem({ id: Date.now(), content: newText, done: false, deletedAt: null })
    setNewText('')
  }

  // const addTodoItem1 = (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault()
  //   addItem({ id: Date.now(), title: newText, done: false })
  //   setNewText('')
  // }

  const onSubmit = useCallback(
    (data: any) => {
      // addItem({ id: Date.now(), content: newText, done: false })
      // setNewText('')
      client.post('/todos', { content: newText }).then(res => {
        mutate('/todos')
      })

      setNewText('')
    },
    [newText]
  )

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex gap-4">
        <label className="input-group input-group-sm">
          <span>할 일</span>
          <input
            type="text"
            placeholder="할 일을 입력하세요."
            className="input input-bordered input-sm"
            value={newText}
            {...register('newText')}
            onChange={e => setNewText(e.currentTarget.value)}
          />
        </label>

        {/* <input
          type="text"
          placeholder="New Todo"
          value={newText}
          onInput={e => setnewText(e.currentTarget.value)}
        /> */}
        <button
          type="submit"
          className="btn btn-sm btn-outline ml-1"
          disabled={!newText.trim()}
        >
          할 일 저장하기
        </button>
      </form>
      <label className="cursor-pointer label">
        Hide completed
        <input
          type="checkbox"
          checked={hideCompleted}
          onChange={toggleHideCompleted}
          className="checkbox"
        />
      </label>
      {/* <input
        type="checkbox"
        checked={hideCompleted}
        onChange={toggleHideCompleted}
      />
      Hide completed */}
      <List></List>
    </>
  )
}

function List() {
  const { hideCompleted } = useStore()

  const { data: todos, mutate } = useSWR<TodoItem[]>('/todos', fetcher)
  // mutate(data => {
  //   if (!data) return []
  //   return [...data]
  // })
  return (
    <ul>
      {todos &&
        todos
          .filter(li => !li.done || !hideCompleted)
          .map(li => <ListItem item={li} key={li.id}></ListItem>)}
    </ul>
  )
}
// .filter(li => !li.done || !hideCompleted)

function ListItem({ item }: { item: TodoItem }) {
  const { toggleItem, updateItem, removeItem } = useStore()
  const [updateText, setUpdateText] = useState(item.content)
  const [editing, setEditing] = useState(false)
  const { handleSubmit, register } = useForm()
  const { mutate } = useSWRConfig()

  const onClickEditButton = () => {
    setEditing(true)
  }

  const onUpdate = (e: FormEvent<HTMLInputElement>) => {
    setUpdateText(e.currentTarget.value)
  }

  const onEditSubmit = (id: number) => {
    // updateItem(id, updateText)
    client
      .put(`/todos/${id}`, { content: updateText, done: false })
      .then(res => {
        // mutate(data => {
        //   if (!data) return []
        //   return [
        //     produce((draft: State) => {
        //       draft.items = draft.items.map(
        //         produce((todoItem: TodoItem) => {
        //           if (todoItem.id === id) {
        //             todoItem.content = updateText
        //           }
        //         })
        //       )
        //     }),
        //   ]
        // }, true)
        mutate(
          '/todos',
          produce((draft: TodoItem[]) => {
            draft = draft.map(
              produce(item => {
                if (item.id === id) {
                  item.content = updateText
                }
              })
            )
          }),
          {
            revalidate: true,
          }
        )
        // mutate()
      })

    // .then(res => console.log(res.data.payload))
    setEditing(false)
  }

  const isChecked = (id: number) => {
    client
      .put(`/todos/${id}`, { content: item.content, done: !item.done })
      .then(res => {
        mutate(
          '/todos',
          produce((draft: TodoItem[]) => {
            draft = draft.map(
              produce(item => {
                if (item.id === id) {
                  item.done = !item.done
                }
              })
            )
          }),
          {
            revalidate: true,
          }
        )
      })
  }

  const deleteItem = (id: number) => {
    client.delete(`/todos/${id}`).then(res => {
      mutate(
        '/todos',
        produce((draft: TodoItem[]) => {
          mutate(
            '/todos',
            produce((draft: TodoItem[]) => {
              draft = draft.map(
                produce(item => {
                  if (item.id === id) {
                    item.deletedAt = new Date()
                  }
                })
              )
            }),
            {
              revalidate: true,
            }
          )
        }),
        {
          revalidate: true,
        }
      )
    })
  }

  return (
    <div>
      {item.deletedAt === null ? (
        <li className="flex">
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => isChecked(item.id)}
          />
          {editing ? (
            <form onSubmit={handleSubmit(() => onEditSubmit(item.id))}>
              <input
                type="text"
                className="input input-bordered input-sm"
                value={updateText}
                onChange={onUpdate}
              />
            </form>
          ) : (
            `${item.content}`
          )}

          {!item.done ? (
            editing ? (
              <button type="submit" onClick={() => onEditSubmit(item.id)}>
                확인
              </button>
            ) : (
              <button type="button" onClick={onClickEditButton}>
                수정
              </button>
            )
          ) : null}
          <button onClick={() => deleteItem(item.id)}>delete</button>
        </li>
      ) : null}
    </div>
  )
}

export default Home
