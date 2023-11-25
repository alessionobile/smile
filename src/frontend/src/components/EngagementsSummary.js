import PropTypes from 'prop-types';
import {
  Card,
  View,
  Flex,
  Badge,
  Heading,
  Text,
  useTheme
} from '@aws-amplify/ui-react';

export default function EngagementsSummary({testResults}) {
  const { tokens } = useTheme();
  return (
    <View
      backgroundColor={tokens.colors.background.secondary}
      padding={tokens.space.medium}>
      {testResults.map((test, index) => (
        <Card key={index}>
          {test.Details.length > 0 ? (
            <Flex direction="row" alignItems="flex-start">
              <Flex direction="column" alignItems="flex-start" gap={tokens.space.xs}>
                <Flex>
                  <Badge size="small" variation={test.Details[0].Smile.Value ? "success" : "error"}>
                    Smile Detection
                  </Badge>
                </Flex>
                <Heading level={5}>
                  Are you smiling?
                </Heading>
                <Text as="span">
                  {test.Details[0].Smile.Value ? "Yes!! Go spread it around!" : "Nope. Try harder!"}
                </Text>
              </Flex>
            </Flex>
          ) : (
            <Flex direction="row" alignItems="flex-start">
              <Flex direction="column" alignItems="flex-start" gap={tokens.space.xs}>
                <Flex>
                  <Badge size="small" variation="error">
                    Smile Detection
                  </Badge>
                </Flex>
                <Heading level={5}>
                  Hello? Anyone there?
                </Heading>
                <Text as="span">
                  No face detected
                </Text>
              </Flex>
            </Flex>
          )}
         </Card>
      ))}
    </View>
  );
}

EngagementsSummary.propTypes = {
  testResults: PropTypes.array
}