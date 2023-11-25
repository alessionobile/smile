import { Menu, MenuItem, View } from "@aws-amplify/ui-react";
import { signOut } from 'aws-amplify/auth';

const Header = () => {
  return (
    <View width="4rem">
      <Menu>
        <MenuItem onClick={signOut}>
          Sign Out
        </MenuItem>
      </Menu>
    </View>
  );
};

export default Header;