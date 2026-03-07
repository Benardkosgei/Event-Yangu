import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  triggerIcon?: keyof typeof Ionicons.glyphMap;
  triggerSize?: number;
  triggerColor?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  triggerIcon = 'ellipsis-vertical',
  triggerSize = 24,
  triggerColor = Colors.text.primary,
}) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<TouchableOpacity>(null);

  const showMenu = () => {
    if (triggerRef.current) {
      triggerRef.current.measure((fx, fy, width, height, px, py) => {
        const screenWidth = Dimensions.get('window').width;
        const menuWidth = 200;
        
        // Position menu to the left of the trigger if it would go off screen
        const x = px + width > screenWidth - menuWidth ? px - menuWidth + width : px;
        
        setPosition({
          x: Math.max(10, x), // Ensure minimum margin from screen edge
          y: py + height + 5,
        });
        setVisible(true);
      });
    }
  };

  const hideMenu = () => {
    setVisible(false);
  };

  const handleItemPress = (item: DropdownMenuItem) => {
    hideMenu();
    item.onPress();
  };

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={showMenu}
        style={styles.trigger}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name={triggerIcon} size={triggerSize} color={triggerColor} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideMenu}
      >
        <Pressable style={styles.overlay} onPress={hideMenu}>
          <View
            style={[
              styles.menu,
              {
                left: position.x,
                top: position.y,
              },
            ]}
          >
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === items.length - 1 && styles.lastMenuItem,
                ]}
                onPress={() => handleItemPress(item)}
              >
                {item.icon && (
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={Colors.text.primary}
                    style={styles.menuIcon}
                  />
                )}
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    padding: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
});