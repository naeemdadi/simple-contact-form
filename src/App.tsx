import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import sendgrid from "@sendgrid/mail";
import "./App.css";
import {
  ChakraProvider,
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  FormHelperText,
  useToast,
  Stack,
  Heading,
} from "@chakra-ui/react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SECRET
);
sendgrid.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY);

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("contact-form") // Replace with your table name
      .insert([
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      ]);

    if (!error) {
      // Send email using SendGrid
      const msg = {
        to: "recipient@example.com", // Change to your recipient
        from: "sender@example.com", // Change to your verified sender
        subject: "New Contact Form Submission",
        text: `Name: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`,
      };

      try {
        await sendgrid.send(msg);
        toast({
          title: "Message sent.",
          description:
            "We've received your message and will get back to you soon.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
        setFormData({ name: "", email: "", message: "" });
      } catch (sendgridError) {
        console.error(sendgridError);
        toast({
          title: "Error.",
          description: "There was an error sending your email.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      }
    } else {
      console.log({ error });
      toast({
        title: "Error.",
        description: "There was an error sending your message.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof typeof formData
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <ChakraProvider>
      <Box
        mx="auto"
        mt={8}
        py={10}
        px={16}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Heading as="h2" size="lg" textAlign="center" mb={5}>
          Contact Us
        </Heading>
        <FormControl as="form" onSubmit={handleSubmit} isRequired>
          <Stack spacing={4}>
            <div>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange(e, "name")}
              />
            </div>
            <div>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange(e, "email")}
              />
            </div>
            <div>
              <FormLabel>Message</FormLabel>
              <Textarea
                value={formData.message}
                onChange={(e) => handleChange(e, "message")}
              />
            </div>
            <div>
              <FormHelperText>We'll never share your email.</FormHelperText>
              <Button type="submit" colorScheme="teal" mt={4}>
                Send Message
              </Button>
            </div>
          </Stack>
        </FormControl>
      </Box>
    </ChakraProvider>
  );
}

export default App;
