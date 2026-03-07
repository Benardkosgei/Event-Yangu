import React from 'react';
import { DropdownMenu, DropdownMenuItem } from './DropdownMenu';
import { useEventStore } from '../store/eventStore';

interface EventDetailsMenuButtonProps {
  eventId: string;
  navigation: any;
}

export const EventDetailsMenuButton: React.FC<EventDetailsMenuButtonProps> = ({
  eventId,
  navigation,
}) => {
  const { selectEvent } = useEventStore();

  const menuItems: DropdownMenuItem[] = [
    {
      id: 'notice-board',
      label: 'Notice Board',
      icon: 'notifications',
      onPress: () => {
        // TODO: Navigate to Notice Board
        console.log('Navigate to Notice Board');
      },
    },
    {
      id: 'committee',
      label: 'Committee',
      icon: 'people',
      onPress: () => navigation.navigate('Committees', { eventId }),
    },
    {
      id: 'contribution-box',
      label: 'Contribution Box',
      icon: 'card',
      onPress: () => {
        // TODO: Navigate to Contribution Box
        console.log('Navigate to Contribution Box');
      },
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: 'wallet',
      onPress: () => {
        // Set this event as selected and navigate to Budget tab
        selectEvent(eventId);
        navigation.getParent()?.navigate('BudgetTab');
      },
    },
    {
      id: 'members',
      label: 'Members',
      icon: 'person-add',
      onPress: () => {
        // TODO: Navigate to Members
        console.log('Navigate to Members');
      },
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'chatbubbles',
      onPress: () => {
        // TODO: Navigate to Messages
        console.log('Navigate to Messages');
      },
    },
    {
      id: 'program',
      label: 'Program',
      icon: 'calendar-outline',
      onPress: () => navigation.navigate('EventProgram', { eventId }),
    },
    {
      id: 'live',
      label: 'Live',
      icon: 'videocam',
      onPress: () => navigation.navigate('LiveStream', { eventId }),
    },
  ];

  return <DropdownMenu items={menuItems} />;
};