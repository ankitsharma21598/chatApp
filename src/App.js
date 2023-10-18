import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  HStack,
  Input,
  VStack,
  Divider,
  Text
} from "@chakra-ui/react";
import { Message } from "./Component/Message";
import { app } from "./firebase";
import {
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);

const loginHandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};

const logoutHandler = () => {
  signOut(auth);
};

function App() {
  const [user, setUser] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const divForScroll = useRef(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setMessage("");
      await addDoc(collection(db, "Message"), {
        text: message,
        uid: user.uid,
        uri: user.photoURL,
        createdAt: serverTimestamp(),
      });
      divForScroll.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    
    const q = query(collection(db, "Message"), orderBy("createdAt", "asc"));
    const unSubscribe = onAuthStateChanged(auth, (data) => {
      setUser(data);
    });
    const unSubscribeForMessage = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((item) => {
          const id = item.id;
          return { id, ...item.data() };
        })
      );
    });
    
    return () => {
      unSubscribe();
      unSubscribeForMessage();
    };
  }, []);

  return (
    <Box bg={"red.50"}>
      {user ? (
        <Container h={"100vh"} bg={"white"}>
          <VStack h={"full"} bg={"telegram.100"} paddingY={"4"}>
            <HStack spacing='200px'>
              <Text fontSize='3xl' as={'b'} color={"tomato"}>Chat App</Text>
              <Button colorScheme="red" onClick={logoutHandler}>
                Logout
              </Button>
            </HStack>
              <Divider />
            <VStack
              h={"full"}
              w={"full"}
              overflowY={"auto"}
              css={{
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {messages.map((item) => (
                <Message
                  key={item.id}
                  user={item.uid === user.uid ? "me" : "other"}
                  text={item.text}
                  uri={item.uri}
                />
              ))}
              {/* Div For add new message then it will auto scroll */}
              <div ref={divForScroll}></div>
            </VStack>

            <form onSubmit={submitHandler}>
              <HStack>
                <Input
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                  backgroundColor={"white"}
                  placeholder="Enter a message...."
                />
                <Button colorScheme="purple" type="submit">
                  Send
                </Button>
              </HStack>
            </form>
          </VStack>
        </Container>
      ) : (
        <VStack justifyContent={"center"} h={"100vh"}>
          <Button onClick={loginHandler} colorScheme="purple">
            Sign In with Google
          </Button>
        </VStack>
      )}
    </Box>
  );
}

export default App;
