let peerConnection = new RTCPeerConnection()
let localStream;

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    remoteStream = new MediaStream()
    document.getElementById('user-1').srcObject = localStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });
   
    createOffer();
}

let createOffer = async () => {


    peerConnection.onicecandidate = async (event) => {
        //Event that fires off when a new offer ICE candidate is created
        if(event.candidate){
            document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription)
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
}


// let remoteDescriptions = [];
// let addAnswer = async () => {
//     console.log('Add answer triggerd')
//     let answer = JSON.parse(document.getElementById('answer-sdp').value)
//     console.log('answer:', answer)

//     // remoteDescriptions.push(answer);
//     // console.log(remoteDescriptions);
//     // remoteDescriptions.forEach(async (answer) => {
//             peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//     // });

// }

let remoteDescriptionQueue = []; // Queue to hold pending remote descriptions

let addAnswer = async () => {
    console.log('Add answer triggered');

    let answer = JSON.parse(document.getElementById('answer-sdp').value);
    console.log('answer:', answer);

    // Queue the remote description
    remoteDescriptionQueue.push(answer);

    // Process the queue if the peer connection is stable
    if (peerConnection.signalingState === 'stable') {
        processDescriptionQueue();
    }
    else
    {
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
};

let processDescriptionQueue = async () => {
    while (remoteDescriptionQueue.length > 0) {
        let answer = remoteDescriptionQueue.shift(); // Get the next description from the queue

        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('Remote description set successfully:', answer);
        } catch (error) {
            console.error('Error setting remote description:', error);
        }
    }
};

init()

document.getElementById('add').addEventListener('click', addAnswer)