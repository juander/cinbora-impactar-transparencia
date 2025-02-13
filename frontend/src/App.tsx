import { Box, Button, Text } from '@chakra-ui/react';

function App() {
  return (
    <Box textAlign="center" fontSize="xl" p={4}>
      <Text mb={4}>Welcome to Chakra UI with TypeScript!</Text>
      <Button colorScheme="teal" size="lg">
        Click Me
      </Button>
    </Box>
  );
}

export default App;
