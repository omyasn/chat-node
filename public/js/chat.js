const socket = io();

const form = document.querySelector('form');
const messageInput = form.querySelector('input');
const formButton = form.querySelector('button');
const locationButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages');

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { room, username } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageSyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageSyles.marginBottom)
    const mewMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - mewMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }

    

}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll()
});


socket.on('locationMessage', (url) => {
    const html = Mustache.render(locationTemplate, {
        url,
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll()
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    formButton.setAttribute('disabled', 'disabled');

    socket.emit('sendMessage', messageInput.value, (error) => {
        formButton.removeAttribute('disabled');
        messageInput.value = '';
        messageInput.focus();

        
        if (error) {
            return console.log(error);
        }

        console.log('Delevered');
    });
});

locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return console.log("U don't support location");
    }

    locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(({ coords }) => {
        socket.emit('sendLocation', {
            lat: coords.latitude,
            long: coords.longitude,
        }, (res) => {
            console.log(res);
            locationButton.removeAttribute('disabled');
        });
    });
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
});
