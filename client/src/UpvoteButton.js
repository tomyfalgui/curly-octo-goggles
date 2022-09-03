import React from 'react'
import { BACKEND } from './main.js'

export default function UpvoteButton({ id, upvotes: fetchedUpvotes }) {
  const [upvotes, setUpvotes] = React.useState(+fetchedUpvotes)

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
          return
        }
        throw new Error('upvote failed')
      })
      .catch(() => {
        setUpvotes(upvote => upvote - 1)
      })
  }

  return (
    <button className="upvote-button" onClick={upvoteComment}>
      ▲ {upvotes} Upvote
    </button>
  )
}
