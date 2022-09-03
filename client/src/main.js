import { faker } from '@faker-js/faker'
const BACKEND = 'http://localhost:4444'

document.querySelectorAll('img').forEach(node => {
  node.src = faker.image.avatar()
})

async function fetchResponses() {
  return await fetch(`${BACKEND}/comments`).then(resp => resp.json())
}

//https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time
function convertToTimeAgo(dateString) {
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

function generateResponseNode(comment) {
  const responseContainer = document.createElement('div')
  const avatar = document.createElement('img')
  const header = document.createElement('div')
  const contentBlock = document.createElement('div')
  const name = document.createElement('span')
  const time = document.createElement('span')
  const content = document.createElement('p')
  const actions = document.createElement('div')
  const upvote = document.createElement('button')

  avatar.src = faker.image.avatar()

  name.innerText = comment.name
  time.innerText = convertToTimeAgo(comment.created_at)

  header.classList.add('header')
  header.appendChild(name)
  header.appendChild(time)

  content.classList.add('content')
  content.innerText = comment.content

  upvote.innerText = `▲ ${comment.upvotes} Upvote`
  upvote.classList.add('upvote-button')
  upvote.dataset.id = comment.id
  upvote.dataset.upvotes = comment.upvotes

  actions.appendChild(upvote)
  actions.classList.add('actions')

  contentBlock.appendChild(header)
  contentBlock.appendChild(content)
  contentBlock.appendChild(actions)
  contentBlock.classList.add('content-block')

  responseContainer.classList.add('response')
  responseContainer.appendChild(avatar)
  responseContainer.appendChild(contentBlock)

  return responseContainer
}

function displayComments(comments) {
  const commentsParent = document.querySelector('.responses')
  commentsParent.innerHTML = ''
  comments.reverse().forEach(comment => {
    const responseContainer = generateResponseNode(comment)
    commentsParent.appendChild(responseContainer)
  })
}

function upvoteComment(event) {
  const { upvotes, id } = event.target.dataset

  event.target.dataset.tempUpvotes = +upvotes
  fetch(`${BACKEND}/comments/${id}/upvote`, {
    method: 'PUT',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(resp => {
      if (resp.ok) {
        event.target.innerText = `▲ ${+upvotes + 1} Upvote`
        event.target.dataset.upvotes = +upvotes + 1
        event.target.dataset.tempUpvotes = +upvotes + 1
      }
      throw new Error('upvote failed')
    })
    .catch(() => {
      const oldUpvotes = event.target.dataset.tempUpvotes
      event.target.innerText = `▲ ${oldUpvotes} Upvote`
      event.target.dataset.upvotes = +oldUpvotes
    })
}

function handleCommentSubmission() {
  const form = document.querySelector('form')
  const input = document.querySelector('input[type="text"]')

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    if (input.value.trim() == '') {
      return
    }

    fetch(`${BACKEND}/comments`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: input.value,
        name: faker.name.fullName(),
      }),
    })
      .then(val => val.json())
      .then(async () => {
        input.value = ''
        const responses = await fetchResponses()
        displayComments(responses.comments)
      })
      .catch(err => {
        console.error(err)
      })
  })
}

async function main() {
  const responses = await fetchResponses()

  displayComments(responses.comments)
  handleCommentSubmission()

  document.querySelector('.responses').addEventListener('click', function (e) {
    if (Array.from(e.target.classList).includes('upvote-button')) {
      upvoteComment(e)
    }
  })
}

main().catch(err => console.error(err))
