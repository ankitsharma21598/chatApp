import React from 'react'
import { HStack,Avatar,Text } from '@chakra-ui/react'
export const Message = ({text,uri,user="other"}) => {
  return (
    <HStack mx={"1"} alignSelf={user==="me"?"flex-end":"flex-start"}  bg={"gray.100"} padding={"1"} borderRadius={"lg"}>
      {
        user==="other" && <Avatar src={uri}/>
      }
      <Text>{text}</Text>
      {
        user==="me" && <Avatar src={uri}/>
      }
    </HStack>
  )
}
