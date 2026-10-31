import { Flex } from "antd";
import { Paragraph, Title } from "@/components/ui/typography";
import { siteCopy } from "@/copy/site";

export default function Home() {
  return (
    <Flex vertical gap={8}>
      <Title level={1}>{siteCopy.homeHeading}</Title>
      <Paragraph>{siteCopy.homeIntro}</Paragraph>
    </Flex>
  );
}
