import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../utils/constants';

interface CheckboxListProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
}

const CheckboxList: React.FC<CheckboxListProps> = ({
  title,
  items,
  selectedItems,
  onSelectionChange
}) => {
  const toggleItem = (item: string) => {
    const isSelected = selectedItems.includes(item);
    let newSelection: string[];
    
    if (isSelected) {
      newSelection = selectedItems.filter(selected => selected !== item);
    } else {
      newSelection = [...selectedItems, item];
    }
    
    onSelectionChange(newSelection);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item, index) => {
          const isSelected = selectedItems.includes(item);
          return (
            <TouchableOpacity
              key={index}
              style={[styles.checkboxItem, isSelected && styles.selectedItem]}
              onPress={() => toggleItem(item)}
            >
              <Text style={[styles.checkbox, isSelected && styles.selectedCheckbox]}>
                {isSelected ? '✓' : '☐'}
              </Text>
              <Text style={[styles.itemText, isSelected && styles.selectedText]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedItem: {
    backgroundColor: '#E8F5E8',
    borderColor: COLORS.primary,
  },
  checkbox: {
    fontSize: 16,
    marginRight: SPACING.sm,
    color: COLORS.textSecondary,
  },
  selectedCheckbox: {
    color: COLORS.primary,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default CheckboxList;