import React, { useEffect, useState } from 'react'
import './Feed.css'
import MessageSender from './MessageSender'
import Post from './Post'
import StoryReel from './StoryReel'
import axios from '../axios'
import Pusher from 'pusher-js'

import db from '../firebase'

var pusher = new Pusher('839189115ba5ec11ad4d', {
    cluster: 'ap2'
  });

const Feed = () => {
    const [profilePic, setProfilePic] = useState('')
    const [postsData, setPostsData] = useState([])

    // useEffect(() => {
    //     db.collection('posts').onSnapshot(snapshot => (
    //         setPostsData(snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })))
    //     ))
    // }, [])
     const syncFeed=()=>{
         axios.get('/retrieve/posts')
         .then((res)=>{
             console.log(res.data)
            setPostsData(res.data)
         })
     }
     useEffect(()=>{
        const channel = pusher.subscribe('posts');
        channel.bind('inserted', function(data) {
        syncFeed()
         
        });
     },[])

     useEffect(()=>{
        syncFeed()
     },[])
    return (
        <div className='feed' >
            <StoryReel />
            <MessageSender />

            {
                postsData.map(entry => (
                    <Post
                        profilePic={entry.avatar}
                        message={entry.text}
                        timestamp={entry.timestamp}
                        imgName={entry.imgName}
                        username={entry.user}
                    />
                ))
            }
        </div>
    )
}

export default Feed
