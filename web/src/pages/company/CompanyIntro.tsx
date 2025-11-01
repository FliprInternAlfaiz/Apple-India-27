import { Flex, Text, ScrollArea } from "@mantine/core";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

const CompanyIntro = () => {
  return (
    <Flex direction="column" style={{ height: "100vh", backgroundColor: "#f9f9f9" }}>
      <CommonHeader heading="Company Introduction" />

      <ScrollArea style={{ flex: 1, padding: "1rem" }}>
        <Text c="#2d1b4e" fw={700} size="xl" mb="md">
          The Apple Logo: History, Meaning, Design Influences, and Evolution
        </Text>

        <Text c="dimmed" size="sm" lh={1.7}>
          Apple Inc. is an American multinational technology company headquartered in Cupertino, California, 
          known for its consumer electronics, software, and online services. It was founded in 1976 by Steve Jobs, 
          Steve Wozniak, and Ronald Wayne and is best known for products like the iPhone, iPad, and Mac computers, 
          along with operating systems like iOS and macOS. Apple is a major global technology company, publicly traded 
          on the NASDAQ stock exchange under the ticker symbol AAPL.
        </Text>

        <Text mt="md" c="dimmed" size="sm" lh={1.7}>
          <b>Founding and Early History:</b> Apple was founded in 1976, initially as Apple Computer, Inc., by Steve Jobs, 
          Steve Wozniak, and Ronald Wayne. The company incorporated the following year. Its early history includes 
          the development of the Apple II personal computer, which was a commercial success.
        </Text>

        <Text mt="md" c="dimmed" size="sm" lh={1.7}>
          <b>Key Products and Services:</b> The company's product line has expanded significantly over the years to 
          include the iPhone, iPad, Apple Watch, Apple TV, and Mac computers. It also develops and sells associated 
          software and online services, including the iOS and macOS operating systems.
        </Text>

        <Text mt="md" c="dimmed" size="sm" lh={1.7}>
          <b>Company Evolution:</b> Apple changed its name from Apple Computer, Inc. to Apple Inc. in 2007 to reflect 
          its expansion from computers to other consumer electronics, such as the iPhone. Under the leadership of 
          CEO Tim Cook, the company has continued to grow and innovate, solidifying its position as one of the 
          world's largest technology companies by revenue.
        </Text>

        <Text mt="md" c="dimmed" size="sm" lh={1.7}>
          <b>Stock and Market Presence:</b> Apple Inc. is a publicly traded company on the NASDAQ stock exchange (AAPL) 
          and is a component of the Dow Jones Industrial Average and the NASDAQ-100.
        </Text>

        <Text mt="md" c="dimmed" size="sm" lh={1.7}>
          <b>Headquarters:</b> The company is headquartered in Cupertino, California, in the heart of Silicon Valley.
        </Text>
      </ScrollArea>
    </Flex>
  );
};

export default CompanyIntro;
