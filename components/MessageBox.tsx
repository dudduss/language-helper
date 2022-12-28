import {
  Box,
  Text,
  Button,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Message } from "../public/schemas";
import React, { useState, useEffect } from "react";

export default function MessageBox({ message }: { message: Message }) {
  const [improvement, setImprovement] = useState("");

  useEffect(() => {
    async function getImprovement() {
      const url = `${process.env.NEXT_PUBLIC_API_URL!}/api/improvement`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.text }),
      });
      const data = await response.json();
      setImprovement(data);
    }

    if (!message.isFromGpt) {
      getImprovement().catch((err) => console.log(err));
    }
  }, []);

  const backgroundColor = message.isFromGpt ? "gray.200" : "blue.200";
  const sender = message.isFromGpt ? "Linda" : "Me";
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box marginTop={10} marginBottom={10}>
      <HStack justifyContent={"space-between"}>
        <Text fontSize="2xl"> {sender} </Text>
        {!message.isFromGpt && improvement != "" && (
          <Button colorScheme="blue" variant={"ghost"} onClick={onOpen}>
            {" "}
            Suggestion{" "}
          </Button>
        )}
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Improvement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="2xl">{improvement}</Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box bg={backgroundColor} padding={7} borderRadius={20} marginTop={2}>
        <Text fontSize="2xl">{message.text}</Text>
      </Box>
    </Box>
  );
}
