import { Text, Group, Flex } from "@mantine/core";

const AllUsers = () => {
  return (
    <Flex direction="column">
      <div>
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <Flex gap="xs" direction="column" align="flex-start">
              <Text size="xl" fw={700}>
                User Management
              </Text>
              <Text size="sm" c="dimmed">
                Manage all users and their permissions
              </Text>
            </Flex>
          </Group>
        </Group>
      </div>
    </Flex>
  );
};

export default AllUsers;
