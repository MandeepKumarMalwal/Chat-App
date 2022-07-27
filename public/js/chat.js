// const moment = require("moment")

const socket =io()

//elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton= $messageForm.querySelector("button")
const $sendLocationButton = document.querySelector('#geo-location')
const $message = document.querySelector('#messages')

//template
const messagetemplate = document.querySelector('#message-template').innerHTML
const locationmessagetemplate = document.querySelector('#location-message-template').innerHTML
const sidebars = document.querySelector('#sidebar-list').innerHTML

//options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix : true})

const autoscroll = () => {
    //New Message Element
    const $newMessage = $message.lastElementChild

    //Height of New Messages
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $message.offsetHeight

    //height of message container
    const containerHeight = $message.scrollHeight

    //how far have I scrolled?
    const scrolloffset = $message.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrolloffset) {
        $message.scrollTop = $message.scrollHeight
    }
}


socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messagetemplate,{
        username:message.username,
        message:message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)

    autoscroll()

})

socket.on('locationmessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationmessagetemplate,{
        username:message.username,
        url:message.url,
        createdAt :moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomdata',({room,users})=>{
    const html = Mustache.render(sidebars,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})


$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    // const message = document.querySelector('input').value
    const message = e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled','disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('message delivered')
   })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert ('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
            
        },()=>{
            console.log('location shared')
            $sendLocationButton.removeAttribute('disabled','disabled')
        }
    
        )
    })
})

socket.emit('join',{username,room},(error)=>{
    if  (error){
        alert(error)
        location.href='/'
    }
})