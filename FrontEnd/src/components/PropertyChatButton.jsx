import React from 'react'

function PropertyChatButton() {

  const handleUserClick = (user) => {
    navigate("/chat", { state: { selectedUser: user } });
  };

  return (
    <button className=''>
      
    </button>
  )
}

export default PropertyChatButton
