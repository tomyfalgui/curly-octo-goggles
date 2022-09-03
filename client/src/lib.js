import { faker } from '@faker-js/faker'
import { createRoot } from 'react-dom/client'
import UpvoteButton from './UpvoteButton.js'
import { BACKEND, displayComments, fetchResponses } from './main.js'
//https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time
export function convertToTimeAgo(dateString) {
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  const convertedDate = new Date(dateString).getTime()

  const differenceDate = new Date().getTime() - convertedDate

  let val = 1
  let unit = ''

  if (differenceDate < msPerMinute) {
    val = Math.round(differenceDate / 1000)
    unit = 'second'
  } else if (differenceDate < msPerHour) {
    val = Math.round(differenceDate / msPerMinute)
    unit = 'minute'
  } else if (differenceDate < msPerDay) {
    val = Math.round(differenceDate / msPerHour)
    unit = 'hour'
  } else if (differenceDate < msPerMonth) {
    val = Math.round(differenceDate / msPerDay)
    unit = 'day'
  } else if (differenceDate < msPerYear) {
    val = Math.round(differenceDate / msPerMonth)
    unit = 'month'
  } else {
    val = Math.round(differenceDate / msPerYear)
    unit = 'year'
  }

  return `${val} ${val > 1 ? `${unit}s` : unit} ago`
}

export function generateResponseNode(comment, isParent, socket) {
  const responseContainer = document.createElement('div')
  const avatar = document.createElement('img')
  const header = document.createElement('div')
  const contentBlock = document.createElement('div')
  const name = document.createElement('span')
  const time = document.createElement('span')
  const content = document.createElement('p')
  const actions = document.createElement('div')
  const upvoteContainer = document.createElement('div')
  const reply = document.createElement('button')

  const replyContainer = document.createElement('div')

  avatar.src = faker.image.avatar()

  name.innerText = comment.name
  time.innerText = convertToTimeAgo(comment.created_at)

  header.classList.add('header')
  header.appendChild(name)
  header.appendChild(time)

  content.classList.add('content')
  content.innerText = comment.content
  /**
   **/

  actions.appendChild(upvoteContainer)
  actions.classList.add('actions')
  if (isParent) {
    replyContainer.classList.add('reply-container')
    reply.classList.add('reply-button')
    reply.textContent = 'Reply'
    reply.addEventListener('click', function (e) {
      replyContainer.classList.toggle('visible')
    })

    actions.appendChild(reply)
  }

  const upvoteButtonRoot = createRoot(upvoteContainer)
  upvoteButtonRoot.render(
    <UpvoteButton id={comment.id} upvotes={comment.upvotes} socket={socket} />
  )

  contentBlock.appendChild(header)
  contentBlock.appendChild(content)
  contentBlock.appendChild(actions)
  contentBlock.classList.add('content-block')

  responseContainer.classList.add('response')
  responseContainer.appendChild(avatar)
  responseContainer.appendChild(contentBlock)

  if (isParent) {
    // child reply
    const form = document.createElement('form')
    form.action = '/'
    form.method = 'POST'
    const img = document.createElement('img')
    img.src = faker.image.avatar()
    img.alt = 'profile picture'
    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'What are your thoughts?'
    input.name = 'reply'
    const button = document.createElement('button')
    button.type = 'submit'
    button.innerText = 'Reply'

    form.classList.add('child')
    form.appendChild(img)
    form.appendChild(input)
    form.appendChild(button)

    let submitting = false
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      if (input.value.trim() == '') {
        return
      }

      if (!submitting) {
        submitting = true

        fetch(`${BACKEND}/comments`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: input.value,
            name: faker.name.fullName(),
            parentId: comment.id,
          }),
        })
          .then(val => val.json())
          .then(async () => {
            input.value = ''
            const responses = await fetchResponses()
            displayComments(responses.comments)
            submitting = false
          })
          .catch(err => {
            console.error(err)
            submitting = false
          })
      }
    })
    replyContainer.appendChild(form)
  }

  contentBlock.appendChild(replyContainer)

  if (!isParent) {
    responseContainer.classList.add('child')
  }

  return { responseContainer, contentBlock }
}
