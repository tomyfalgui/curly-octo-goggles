import React from 'react'
import { BACKEND } from './main.js'

export default function UpvoteButton({ id, upvotes: fetchedUpvotes, socket }) {
  const [upvotes, setUpvotes] = React.useState(+fetchedUpvotes)

  React.useEffect(() => {
    socket.on('upvote', receivedId => {
      if (id == receivedId) {
        setUpvotes(upvote => upvote + 1)
      }
    })
  }, [])

  function upvoteComment() {
    fetch(`${BACKEND}/comments/${id}/upvote`, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(resp => {
        if (resp.ok) {
          setUpvotes(upvote => upvote + 1)
          socket.emit('upvote', id)
          return
        }
        throw new Error('upvote failed')
      })
      .catch(() => {
        console.error('upvote failed')
      })
  }

  return (
    <button className="upvote-button" onClick={upvoteComment}>
      ▲ {upvotes} Upvote
    </button>
  )
}
