import { DiffResponse, ImprovementResponse } from "../public/schemas";
import { Text, Box, Flex } from "@chakra-ui/react";

export default function SuggestionText({
  diffResponse,
  improvement,
}: {
  diffResponse: DiffResponse;
  improvement: ImprovementResponse;
}) {
  return (
    <Box>
      <Box fontSize={"2xl"}>
        <Text as="span" fontWeight="bold">
          Original:{" "}
        </Text>
        {diffResponse.original.map(function (diffPart, index) {
          if (diffPart.type === "equal") {
            return <Text as="span" key={index}>{diffPart.text}</Text>;
          } else if (diffPart.type === "insert") {
            return (
              <Text as="span" color={"green.600"} fontWeight="bold" key={index}>
                {diffPart.text}
              </Text>
            );
          } else {
            return (
              <Text
                as="span"
                color={"red.600"}
                fontWeight="bold"
                textDecoration="line-through"
                key={index}
              >
                {diffPart.text}
              </Text>
            );
          }
        })}
      </Box>
      <Box fontSize={"2xl"}>
        <Text as="span" fontWeight="bold">
          Correct:{" "}
        </Text>
        {diffResponse.improvement.map(function (diffPart, index) {
          if (diffPart.type === "equal") {
            return <Text as="span" key={index}>{diffPart.text}</Text>;
          } else if (diffPart.type === "insert") {
            return (
              <Text as="span" color={"green.600"} fontWeight="bold" key={index}>
                {diffPart.text}
              </Text>
            );
          } else {
            return (
              <Text
                as="span"
                color={"red.600"}
                fontWeight="bold"
                textDecoration="line-through"
                key={index}
              >
                {diffPart.text}
              </Text>
            );
          }
        })}
      </Box>
      <br />
      <Box fontSize="2xl">
        <Text as="span" fontWeight="bold">
          Reason:{" "}
        </Text>
        <Text as="span">{improvement.reason}</Text>
      </Box>
     
    </Box>
  );
}
